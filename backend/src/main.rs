use axum::{
    self,
    extract::{DefaultBodyLimit, Multipart, Path as AxumPath, State, WebSocketUpgrade},
    response::{IntoResponse, Response},
    routing::{get, post},
    Router,
};
use backend::{airtable_users, AppState};
use std::{env, path::Path, str::FromStr};
use tokio::{fs::create_dir_all, net::TcpListener};
use tower_http::{cors::{Any, CorsLayer}, trace::TraceLayer};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};
use uuid::Uuid;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    dotenvy::dotenv().ok();
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "debug".into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    let state = AppState::new().await?;

    // Get upload directory from environment variable or use default
    let uploads_dir = env::var("UPLOAD_DIR").unwrap_or_else(|_| "/data/uploads".to_string());
    let uploads_dir = Path::new(&uploads_dir);
    tracing::info!("Upload directory: {}", uploads_dir.display());
    if !uploads_dir.exists() {
        tracing::info!("Creating upload directory: {}", uploads_dir.display());
        create_dir_all(uploads_dir).await?;
    }

    let app = Router::new()
        .route("/api", get(api))
        .route("/sync-airtable-users", get(sync_airtable_users))
        .route("/api/upload-image", post(upload_image))
        .route("/api/images/:filename", get(serve_image))
        .route("/api/upload-video", post(upload_video))
        .route("/api/videos/:filename", get(serve_video))
        .layer(TraceLayer::new_for_http())
        // Disable default body limit for large video uploads
        .layer(DefaultBodyLimit::disable())
        // Enable CORS for cross-origin requests (needed for dev mode uploads)
        .layer(CorsLayer::new().allow_origin(Any).allow_methods(Any).allow_headers(Any))
        .with_state(AppState {
            uploads_dir: uploads_dir.to_path_buf(),
            ..state
        });

    let listener = TcpListener::bind("0.0.0.0:8080").await?;
    tracing::info!("Listening on {}", listener.local_addr()?);
    Ok(axum::serve(listener, app).await?)
}

#[axum::debug_handler]
async fn api(ws: WebSocketUpgrade, State(state): State<AppState>) -> Response {
    ws.on_upgrade(move |socket| backend::handle_socket::handle_socket(socket, state))
}

#[axum::debug_handler]
async fn sync_airtable_users(State(state): State<AppState>) -> Response {
    match airtable_users::sync_airtable_users_to_kinde_and_db(state).await {
        Ok(()) => {
            tracing::info!("Successfully synchronized Airtable users");
            (axum::http::StatusCode::OK, "OK").into_response()
        }
        Err(e) => {
            tracing::error!("Failed to synchronize Airtable users: {e}");
            if let Err(e) = airtable_users::log_error_to_airtable(&e.to_string()).await {
                tracing::error!("Failed to log error to Airtable: {e}");
            };
            (
                axum::http::StatusCode::INTERNAL_SERVER_ERROR,
                "Failed to synchronize Airtable users",
            )
                .into_response()
        }
    }
}

#[axum::debug_handler]
async fn upload_image(
    State(state): State<AppState>,
    mut multipart: Multipart,
) -> Result<impl IntoResponse, (axum::http::StatusCode, String)> {
    while let Some(field) = multipart.next_field().await.map_err(|e| {
        (
            axum::http::StatusCode::BAD_REQUEST,
            format!("Failed to process form data: {}", e),
        )
    })? {
        let content_type = field.content_type().ok_or((
            axum::http::StatusCode::BAD_REQUEST,
            "Missing content type".to_string(),
        ))?;

        // Validate content type
        if !content_type.starts_with("image/") {
            return Err((
                axum::http::StatusCode::BAD_REQUEST,
                "Invalid file type. Only images are allowed.".to_string(),
            ));
        }

        // Generate a unique filename with the correct extension
        let extension = mime::Mime::from_str(content_type)
            .map_err(|_| {
                (
                    axum::http::StatusCode::BAD_REQUEST,
                    "Invalid content type".to_string(),
                )
            })?
            .subtype()
            .as_str()
            .to_string();

        let filename = format!("{}.{}", Uuid::new_v4(), extension);
        let filepath = state.uploads_dir.join(&filename);

        // Read the file data and write it to disk
        let data = field.bytes().await.map_err(|e| {
            (
                axum::http::StatusCode::INTERNAL_SERVER_ERROR,
                format!("Failed to read file data: {}", e),
            )
        })?;

        tokio::fs::write(&filepath, &data).await.map_err(|e| {
            (
                axum::http::StatusCode::INTERNAL_SERVER_ERROR,
                format!("Failed to save file: {}", e),
            )
        })?;

        // Return the filename that can be used to access the image
        return Ok(axum::Json(serde_json::json!({
            "filename": filename,
            "url": format!("/api/images/{}", filename)
        })));
    }

    Err((
        axum::http::StatusCode::BAD_REQUEST,
        "No file found in request".to_string(),
    ))
}

#[axum::debug_handler]
async fn serve_image(
    State(state): State<AppState>,
    AxumPath(filename): AxumPath<String>,
) -> Result<impl IntoResponse, (axum::http::StatusCode, String)> {
    let filepath = state.uploads_dir.join(filename);

    // Validate the path to prevent directory traversal
    if !filepath.starts_with(&state.uploads_dir) {
        return Err((
            axum::http::StatusCode::BAD_REQUEST,
            "Invalid filename".to_string(),
        ));
    }

    let data = tokio::fs::read(&filepath).await.map_err(|e| {
        (
            axum::http::StatusCode::NOT_FOUND,
            format!("Image not found: {}", e),
        )
    })?;

    // Try to determine the content type from the file extension
    let content_type = match filepath.extension().and_then(|e| e.to_str()) {
        Some("jpg") | Some("jpeg") => "image/jpeg",
        Some("png") => "image/png",
        Some("gif") => "image/gif",
        Some("webp") => "image/webp",
        _ => "application/octet-stream",
    };

    Ok(([(axum::http::header::CONTENT_TYPE, content_type)], data))
}

#[axum::debug_handler]
async fn upload_video(
    State(state): State<AppState>,
    mut multipart: Multipart,
) -> Result<impl IntoResponse, (axum::http::StatusCode, String)> {
    tracing::info!("Starting video upload");
    let mut file_data: Option<(String, String, i64)> = None; // (filename, original_name, size_bytes)
    let mut user_id: Option<i64> = None;
    let mut name: Option<String> = None;

    while let Some(field) = multipart.next_field().await.map_err(|e| {
        tracing::error!("Failed to process form data: {}", e);
        (
            axum::http::StatusCode::BAD_REQUEST,
            format!("Failed to process form data: {}", e),
        )
    })? {
        let field_name = field.name().map(|s| s.to_string());

        match field_name.as_deref() {
            Some("user_id") => {
                tracing::info!("Processing user_id field");
                let text = field.text().await.map_err(|e| {
                    tracing::error!("Failed to read user_id: {}", e);
                    (
                        axum::http::StatusCode::BAD_REQUEST,
                        format!("Failed to read user_id: {}", e),
                    )
                })?;
                tracing::info!("user_id text: {}", text);
                user_id = Some(text.parse().map_err(|_| {
                    tracing::error!("Invalid user_id: {}", text);
                    (
                        axum::http::StatusCode::BAD_REQUEST,
                        "Invalid user_id".to_string(),
                    )
                })?);
            }
            Some("name") => {
                let text = field.text().await.map_err(|e| {
                    (
                        axum::http::StatusCode::BAD_REQUEST,
                        format!("Failed to read name: {}", e),
                    )
                })?;
                if !text.is_empty() {
                    name = Some(text);
                }
            }
            Some("file") | None => {
                tracing::info!("Processing file field");
                let content_type = field.content_type().ok_or((
                    axum::http::StatusCode::BAD_REQUEST,
                    "Missing content type".to_string(),
                ))?;
                tracing::info!("Content type: {}", content_type);

                // Validate content type
                if !content_type.starts_with("video/") {
                    tracing::error!("Invalid content type: {}", content_type);
                    return Err((
                        axum::http::StatusCode::BAD_REQUEST,
                        "Invalid file type. Only videos are allowed.".to_string(),
                    ));
                }

                let original_name = field
                    .file_name()
                    .map(|s| s.to_string())
                    .unwrap_or_else(|| "video".to_string());
                tracing::info!("Original filename: {}", original_name);

                // Get extension from content type or original filename
                let extension = original_name
                    .rsplit('.')
                    .next()
                    .filter(|ext| ["mp4", "webm", "mov", "avi", "mkv"].contains(ext))
                    .unwrap_or("mp4")
                    .to_string();

                // Generate filename and stream directly to disk
                let filename = format!("{}.{}", Uuid::new_v4(), extension);
                let filepath = state.uploads_dir.join(&filename);
                tracing::info!("Streaming file to: {:?}", filepath);

                let mut file = tokio::fs::File::create(&filepath).await.map_err(|e| {
                    tracing::error!("Failed to create file: {}", e);
                    (
                        axum::http::StatusCode::INTERNAL_SERVER_ERROR,
                        format!("Failed to create file: {}", e),
                    )
                })?;

                let mut size_bytes: i64 = 0;
                let mut stream = field;

                while let Some(chunk) = stream.chunk().await.map_err(|e| {
                    tracing::error!("Failed to read chunk: {}", e);
                    (
                        axum::http::StatusCode::INTERNAL_SERVER_ERROR,
                        format!("Failed to read file data: {}", e),
                    )
                })? {
                    size_bytes += chunk.len() as i64;
                    tokio::io::AsyncWriteExt::write_all(&mut file, &chunk).await.map_err(|e| {
                        tracing::error!("Failed to write chunk: {}", e);
                        (
                            axum::http::StatusCode::INTERNAL_SERVER_ERROR,
                            format!("Failed to write file: {}", e),
                        )
                    })?;
                }

                tracing::info!("Streamed {} bytes to disk", size_bytes);
                file_data = Some((filename, original_name, size_bytes));
            }
            _ => {}
        }
    }

    tracing::info!("Finished processing multipart fields");

    let (filename, original_name, size_bytes) = file_data.ok_or_else(|| {
        tracing::error!("No video file found in request");
        (
            axum::http::StatusCode::BAD_REQUEST,
            "No video file found in request".to_string(),
        )
    })?;

    let user_id = user_id.ok_or_else(|| {
        tracing::error!("Missing user_id field");
        (
            axum::http::StatusCode::BAD_REQUEST,
            "Missing user_id field".to_string(),
        )
    })?;

    // File is already saved to disk during streaming, just save to database
    tracing::info!("Saving video record to database");
    let video = state
        .db
        .create_video(filename.clone(), original_name, size_bytes, user_id, name)
        .await
        .map_err(|e| {
            tracing::error!("Failed to save video record: {}", e);
            (
                axum::http::StatusCode::INTERNAL_SERVER_ERROR,
                format!("Failed to save video record: {}", e),
            )
        })?;
    tracing::info!("Video record saved successfully with id: {}", video.id);

    Ok(axum::Json(serde_json::json!({
        "id": video.id,
        "filename": video.filename,
        "url": format!("/api/videos/{}", video.filename),
        "original_name": video.original_name,
        "size_bytes": video.size_bytes,
        "name": video.name
    })))
}

#[axum::debug_handler]
async fn serve_video(
    State(state): State<AppState>,
    AxumPath(filename): AxumPath<String>,
) -> Result<impl IntoResponse, (axum::http::StatusCode, String)> {
    let filepath = state.uploads_dir.join(&filename);

    // Validate the path to prevent directory traversal
    if !filepath.starts_with(&state.uploads_dir) {
        return Err((
            axum::http::StatusCode::BAD_REQUEST,
            "Invalid filename".to_string(),
        ));
    }

    let data = tokio::fs::read(&filepath).await.map_err(|e| {
        (
            axum::http::StatusCode::NOT_FOUND,
            format!("Video not found: {}", e),
        )
    })?;

    // Determine content type from file extension
    let content_type = match filepath.extension().and_then(|e| e.to_str()) {
        Some("mp4") => "video/mp4",
        Some("webm") => "video/webm",
        Some("mov") => "video/quicktime",
        Some("avi") => "video/x-msvideo",
        Some("mkv") => "video/x-matroska",
        _ => "video/mp4",
    };

    Ok(([(axum::http::header::CONTENT_TYPE, content_type)], data))
}
