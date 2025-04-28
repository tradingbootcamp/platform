use axum::{
    self,
    extract::{Multipart, Path as AxumPath, State, WebSocketUpgrade},
    response::{IntoResponse, Response},
    routing::{get, post},
    Router,
};
use backend::{airtable_users, AppState};
use std::{env, path::Path, str::FromStr};
use tokio::{fs::create_dir_all, net::TcpListener};
use tower_http::{limit::RequestBodyLimitLayer, trace::TraceLayer};
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
        .layer(TraceLayer::new_for_http())
        // Limit file uploads to 10MB
        .layer(RequestBodyLimitLayer::new(10 * 1024 * 1024))
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
