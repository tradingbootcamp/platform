use std::{
    env,
    sync::{LazyLock, RwLock},
    time::{Duration, Instant},
};

use anyhow::Context;
use futures::future::join_all;

use prost::Message;
use reqwest::{header, Client};
use rust_decimal_macros::dec;
use serde::{Deserialize, Serialize};
use urlencoding;

use crate::{
    db::EnsureUserCreatedSuccess,
    websocket_api::{server_message::Message as SM, Account, ServerMessage},
    AppState,
};

const TRADEGALA_PRODUCT_ID: &str = "2mR3AnL63Z";
const ASH_PRODUCT_ID: &str = "0VNrVWONPg";
const TRADEGALA_INITIAL_CLIPS: rust_decimal::Decimal = dec!(1000);
const ASH_INITIAL_CLIPS: rust_decimal::Decimal = dec!(2000);
const ERROR_SOURCE: &str = "exchange backend";

struct CachedKindeToken {
    token: String,
    expiry: Instant,
}

static KINDE_TOKEN_CACHE: LazyLock<RwLock<Option<CachedKindeToken>>> =
    LazyLock::new(|| RwLock::new(None));

#[derive(Debug, Deserialize)]
struct AirtableResponse {
    records: Vec<AirtableRecord>,
}

#[derive(Debug, Deserialize)]
struct AirtableRecord {
    fields: AirtableFields,
}

#[derive(Debug, Deserialize)]
struct AirtableFields {
    #[serde(rename = "First Name")]
    first_name: String,
    #[serde(rename = "Last Name")]
    last_name: String,
    #[serde(rename = "Email")]
    email: String,
    #[serde(rename = "Ticket Status")]
    #[allow(dead_code)]
    ticket_status: Option<String>,
    #[serde(rename = "Product ID")]
    #[allow(dead_code)]
    product_id: Option<String>,
    #[serde(rename = "Transferred From ID")]
    transferred_from_id: Option<String>,
    #[serde(rename = "Transferred From Email")]
    #[allow(dead_code)]
    transferred_from_email: Option<String>,
}

#[derive(Debug, Deserialize)]
struct KindeTokenResponse {
    access_token: String,
    #[allow(dead_code)]
    token_type: String,
    #[allow(dead_code)]
    expires_in: u64,
}

#[derive(Debug, Deserialize)]
struct KindeUsersResponse {
    users: Option<Vec<KindeUser>>,
}

#[derive(Debug, Deserialize)]
struct KindeUser {
    id: String,
    #[allow(dead_code)]
    email: String,
    #[allow(dead_code)]
    given_name: Option<String>,
    #[allow(dead_code)]
    family_name: Option<String>,
}

#[derive(Debug, Serialize)]
struct KindeCreateUserRequest {
    profile: KindeProfile,
    identities: Vec<KindeIdentity>,
}

#[derive(Debug, Serialize)]
struct KindeProfile {
    given_name: String,
    family_name: String,
}

#[derive(Debug, Serialize)]
struct KindeIdentity {
    #[serde(rename = "type")]
    identity_type: String,
    is_verified: bool,
    details: KindeIdentityDetails,
}

#[derive(Debug, Serialize)]
struct KindeIdentityDetails {
    #[serde(skip_serializing_if = "Option::is_none")]
    email: Option<String>,
}

#[derive(Debug, Serialize)]
struct AirtableCreateRecordsRequest {
    records: Vec<AirtableCreateRecord>,
}

#[derive(Debug, Serialize)]
struct AirtableCreateRecord {
    fields: AirtableErrorFields,
}

#[derive(Debug, Serialize)]
struct AirtableErrorFields {
    #[serde(rename = "Error Message")]
    error_message: String,
    #[serde(rename = "Source")]
    source: String,
}

/// Fetches Airtable users, validates with Kinde, and ensures they exist in the database
///
/// # Errors
/// Returns an error if API calls fail or environment variables are missing
pub async fn sync_airtable_users_to_kinde_and_db(app_state: AppState) -> anyhow::Result<()> {
    let airtable_base_id =
        env::var("AIRTABLE_BASE_ID").context("Missing AIRTABLE_BASE_ID environment variable")?;
    let airtable_token =
        env::var("AIRTABLE_TOKEN").context("Missing AIRTABLE_TOKEN environment variable")?;

    let client = Client::new();
    let airtable_url =
        format!("https://api.airtable.com/v0/{airtable_base_id}/Tradegala%20Attendees");

    let response = client
        .get(&airtable_url)
        .header("Authorization", format!("Bearer {airtable_token}"))
        .send()
        .await?
        .json::<AirtableResponse>()
        .await?;

    let kinde_token = get_kinde_token(&client).await?;

    let futures = response
        .records
        .iter()
        .map(|record| process_user(app_state.clone(), record, &kinde_token, &client));

    let results = join_all(futures).await;

    let mut errors = Vec::new();
    for (result, record) in results.into_iter().zip(response.records.iter()) {
        match result {
            Ok(()) => (),
            Err(e) => errors.push((record.fields.email.clone(), e)),
        }
    }

    if !errors.is_empty() {
        return Err(anyhow::anyhow!(
            "Errors occurred while processing users: {:?}",
            errors
        ));
    }

    Ok(())
}

/// Helper function to process each user
async fn process_user(
    app_state: AppState,
    record: &AirtableRecord,
    kinde_token: &str,
    client: &Client,
) -> anyhow::Result<()> {
    let email = &record.fields.email;
    let first_name = &record.fields.first_name;
    let last_name = &record.fields.last_name;

    let kinde_user = get_kinde_user_by_email(email, kinde_token, client).await?;

    let kinde_id = match kinde_user {
        Some(user) => user.id,
        None => create_kinde_user(email, first_name, last_name, kinde_token, client).await?,
    };

    let name = format!("{first_name} {last_name}");
    let result = app_state
        .db
        .ensure_user_created(&kinde_id, Some(&name), dec!(0))
        .await?;

    let id = match result.map_err(|e| anyhow::anyhow!("Couldn't create user {name}: {e:?}"))? {
        EnsureUserCreatedSuccess { id, name: Some(_) } => {
            let msg = ServerMessage {
                request_id: String::new(),
                message: Some(SM::AccountCreated(Account {
                    id,
                    name: name.to_string(),
                    is_user: true,
                })),
            };
            app_state.subscriptions.send_public(msg);
            tracing::info!("User {name} created");
            id
        }
        EnsureUserCreatedSuccess { id, name: None } => id,
    };

    if record
        .fields
        .transferred_from_id
        .as_ref()
        .is_some_and(|id| !id.is_empty())
    {
        tracing::info!("User {name} has a transfer ticket, skipping pixie transfer");
        return Ok(());
    }

    let initial_clips = match record.fields.product_id.as_deref() {
        Some(product_id) if product_id == TRADEGALA_PRODUCT_ID => TRADEGALA_INITIAL_CLIPS,
        Some(product_id) if product_id == ASH_PRODUCT_ID => ASH_INITIAL_CLIPS,
        Some("") | None => {
            tracing::info!("User {name} has no product ID, skipping pixie transfer");
            return Ok(());
        }
        Some(unknown_product_id) => {
            anyhow::bail!("Unknown product ID for user {name}: {unknown_product_id}");
        }
    };

    let transfer = app_state
        .db
        .ensure_arbor_pixie_transfer(id, initial_clips)
        .await?
        .map_err(|e| anyhow::anyhow!("Couldn't transfer initial clips to user {name}: {e:?}"))?;

    if let Some(transfer) = transfer {
        let msg = ServerMessage {
            request_id: String::new(),
            message: Some(SM::TransferCreated(transfer.into())),
        };
        app_state
            .subscriptions
            .send_private(id, msg.encode_to_vec().into());
        app_state.subscriptions.notify_portfolio(id);
        tracing::info!("Pixie transfer created for user {name}");
    }

    Ok(())
}

/// Gets a Kinde access token, using a cached version if available and not expired
///
/// # Errors
/// Returns an error if API call fails or environment variables are missing
async fn get_kinde_token(client: &Client) -> anyhow::Result<String> {
    {
        let token_cache = KINDE_TOKEN_CACHE.read().unwrap();
        if let Some(cached) = &*token_cache {
            if cached.expiry > Instant::now() {
                // Token is still valid, return it
                return Ok(cached.token.clone());
            }
        }
    }

    tracing::info!("Fetching new Kinde token");

    let kinde_subdomain =
        env::var("KINDE_SUBDOMAIN").context("Missing KINDE_SUBDOMAIN environment variable")?;
    let kinde_client_id =
        env::var("KINDE_CLIENT_ID").context("Missing KINDE_CLIENT_ID environment variable")?;
    let kinde_client_secret = env::var("KINDE_CLIENT_SECRET")
        .context("Missing KINDE_CLIENT_SECRET environment variable")?;

    let token_url = format!("https://{kinde_subdomain}.kinde.com/oauth2/token");

    let form_data = [
        ("grant_type", "client_credentials"),
        ("client_id", &kinde_client_id),
        ("client_secret", &kinde_client_secret),
        (
            "audience",
            &format!("https://{kinde_subdomain}.kinde.com/api"),
        ),
        ("scope", "read:users create:users"),
    ];

    let response = client
        .post(&token_url)
        .form(&form_data)
        .send()
        .await?
        .json::<KindeTokenResponse>()
        .await?;

    let expiry_buffer = Duration::from_secs(60); // 1 minute buffer
    let expires_in =
        Duration::from_secs(response.expires_in.saturating_sub(expiry_buffer.as_secs()));
    let expiry = Instant::now() + expires_in;

    // Store token in cache
    let token = response.access_token.clone();
    {
        let mut token_cache = KINDE_TOKEN_CACHE.write().unwrap();
        *token_cache = Some(CachedKindeToken {
            token: token.clone(),
            expiry,
        });
    }

    Ok(token)
}

/// Gets a Kinde user by email
///
/// # Errors
/// Returns an error if API call fails or environment variables are missing
async fn get_kinde_user_by_email(
    email: &str,
    token: &str,
    client: &Client,
) -> anyhow::Result<Option<KindeUser>> {
    let kinde_subdomain =
        env::var("KINDE_SUBDOMAIN").context("Missing KINDE_SUBDOMAIN environment variable")?;

    let encoded_email = urlencoding::encode(email);
    let users_url =
        format!("https://{kinde_subdomain}.kinde.com/api/v1/users?email={encoded_email}");

    let response = client
        .get(&users_url)
        .header("Authorization", format!("Bearer {token}"))
        .send()
        .await?;

    if !response.status().is_success() {
        return Ok(None);
    }

    let users_response = response.json::<KindeUsersResponse>().await?;
    let users = users_response.users.unwrap_or_default();

    if users.len() > 1 {
        tracing::warn!("Multiple Kinde users found for email {email}");
    }

    Ok(users.into_iter().next())
}

/// Creates a user in Kinde
///
/// # Errors
/// Returns an error if API call fails or environment variables are missing
async fn create_kinde_user(
    email: &str,
    first_name: &str,
    last_name: &str,
    token: &str,
    client: &Client,
) -> anyhow::Result<String> {
    let kinde_subdomain =
        env::var("KINDE_SUBDOMAIN").context("Missing KINDE_SUBDOMAIN environment variable")?;

    let create_url = format!("https://{kinde_subdomain}.kinde.com/api/v1/user");

    let user_data = KindeCreateUserRequest {
        profile: KindeProfile {
            given_name: first_name.to_string(),
            family_name: last_name.to_string(),
        },
        identities: vec![KindeIdentity {
            identity_type: "email".to_string(),
            is_verified: true,
            details: KindeIdentityDetails {
                email: Some(email.to_string()),
            },
        }],
    };

    let mut headers = header::HeaderMap::new();
    headers.insert(
        header::AUTHORIZATION,
        header::HeaderValue::from_str(&format!("Bearer {token}"))?,
    );
    headers.insert(
        header::CONTENT_TYPE,
        header::HeaderValue::from_static("application/json"),
    );

    let response = client
        .post(&create_url)
        .headers(headers)
        .json(&user_data)
        .send()
        .await?;

    if !response.status().is_success() {
        let error_text = response.text().await?;
        anyhow::bail!("Failed to create Kinde user: {}", error_text);
    }

    let user_data: serde_json::Value = response.json().await?;
    let id = user_data["id"]
        .as_str()
        .context("No ID returned when creating Kinde user")?
        .to_string();

    Ok(id)
}

/// Logs an error message to the Airtable "Application Errors" table
///
/// # Errors
/// Returns an error if API call fails or environment variables are missing
pub async fn log_error_to_airtable(error_message: &str) -> anyhow::Result<()> {
    let airtable_base_id =
        env::var("AIRTABLE_BASE_ID").context("Missing AIRTABLE_BASE_ID environment variable")?;
    let airtable_token =
        env::var("AIRTABLE_TOKEN").context("Missing AIRTABLE_TOKEN environment variable")?;

    let client = Client::new();
    let airtable_url =
        format!("https://api.airtable.com/v0/{airtable_base_id}/Application%20Errors");

    let request_data = AirtableCreateRecordsRequest {
        records: vec![AirtableCreateRecord {
            fields: AirtableErrorFields {
                error_message: error_message.to_string(),
                source: ERROR_SOURCE.to_string(),
            },
        }],
    };

    let response = client
        .post(&airtable_url)
        .header("Authorization", format!("Bearer {airtable_token}"))
        .header("Content-Type", "application/json")
        .json(&request_data)
        .send()
        .await?;

    if !response.status().is_success() {
        let error_text = response.text().await?;
        anyhow::bail!("Failed to log error to Airtable: {}", error_text);
    }

    Ok(())
}
