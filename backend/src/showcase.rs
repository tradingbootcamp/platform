use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::Path;
use tokio::fs;

pub const RESERVED_SHOWCASE_KEYS: &[&str] = &[
    "signin",
    "login",
    "showcase",
    "market",
    "accounts",
    "transfers",
    "auction",
    "options",
    "docs",
    "home",
    "api",
];

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct ShowcaseConfig {
    #[serde(default)]
    pub default_showcase: Option<String>,
    #[serde(default)]
    pub databases: HashMap<String, DatabaseConfig>,
    #[serde(default)]
    pub showcases: HashMap<String, ShowcaseEntry>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DatabaseConfig {
    pub db_path: String,
    pub display_name: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ShowcaseEntry {
    pub display_name: String,
    pub database_key: String,
    #[serde(default)]
    pub anonymize_names: bool,
    #[serde(default)]
    pub showcase_market_ids: Vec<i64>,
    #[serde(default)]
    pub hidden_category_ids: Vec<i64>,
    #[serde(default)]
    pub non_anonymous_account_ids: Vec<i64>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub password: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
struct LegacyShowcaseConfig {
    #[serde(default)]
    active_bootcamp: Option<String>,
    #[serde(default)]
    bootcamps: HashMap<String, LegacyBootcampConfig>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct LegacyBootcampConfig {
    db_path: String,
    display_name: String,
    #[serde(default)]
    anonymize_names: bool,
    #[serde(default)]
    showcase_market_ids: Vec<i64>,
    #[serde(default)]
    hidden_category_ids: Vec<i64>,
    #[serde(default)]
    non_anonymous_account_ids: Vec<i64>,
}

impl ShowcaseConfig {
    #[must_use]
    pub fn get_showcase(&self, key: &str) -> Option<&ShowcaseEntry> {
        self.showcases.get(key)
    }

    #[must_use]
    pub fn get_default_showcase(&self) -> Option<(&str, &ShowcaseEntry)> {
        self.default_showcase
            .as_deref()
            .and_then(|key| self.showcases.get(key).map(|showcase| (key, showcase)))
    }

    #[must_use]
    pub fn resolve_showcase(
        &self,
        requested_showcase_key: Option<&str>,
    ) -> Option<(&str, &ShowcaseEntry)> {
        if let Some(key) = requested_showcase_key {
            return self
                .showcases
                .get_key_value(key)
                .map(|(stored_key, showcase)| (stored_key.as_str(), showcase));
        }
        self.get_default_showcase()
    }

    #[must_use]
    pub fn get_database_for_showcase(&self, showcase: &ShowcaseEntry) -> Option<&DatabaseConfig> {
        self.databases.get(&showcase.database_key)
    }

    #[must_use]
    fn from_legacy(legacy: LegacyShowcaseConfig) -> Self {
        let mut databases = HashMap::new();
        let mut showcases = HashMap::new();

        for (key, legacy_bootcamp) in legacy.bootcamps {
            databases.insert(
                key.clone(),
                DatabaseConfig {
                    db_path: legacy_bootcamp.db_path,
                    display_name: legacy_bootcamp.display_name.clone(),
                },
            );

            showcases.insert(
                key.clone(),
                ShowcaseEntry {
                    display_name: legacy_bootcamp.display_name,
                    database_key: key,
                    anonymize_names: legacy_bootcamp.anonymize_names,
                    showcase_market_ids: legacy_bootcamp.showcase_market_ids,
                    hidden_category_ids: legacy_bootcamp.hidden_category_ids,
                    non_anonymous_account_ids: legacy_bootcamp.non_anonymous_account_ids,
                    password: None,
                },
            );
        }

        Self {
            default_showcase: legacy.active_bootcamp,
            databases,
            showcases,
        }
    }
}

#[must_use]
pub fn normalize_key(raw: &str) -> Option<String> {
    let normalized = raw.trim().to_lowercase();
    if normalized.is_empty() {
        return None;
    }
    if !normalized
        .chars()
        .all(|c| c.is_ascii_lowercase() || c.is_ascii_digit() || c == '_' || c == '-')
    {
        return None;
    }
    Some(normalized)
}

#[must_use]
pub fn is_reserved_showcase_key(key: &str) -> bool {
    RESERVED_SHOWCASE_KEYS.contains(&key)
}

/// Load showcase config from the given path, or return default if not found.
///
/// # Errors
/// Returns an error if the file exists but cannot be read or parsed.
pub async fn load_config(path: &Path) -> anyhow::Result<ShowcaseConfig> {
    match fs::read_to_string(path).await {
        Ok(contents) => {
            let raw_value: serde_json::Value = serde_json::from_str(&contents)?;
            let has_new_shape = raw_value.get("showcases").is_some()
                || raw_value.get("databases").is_some()
                || raw_value.get("default_showcase").is_some();

            if has_new_shape {
                Ok(serde_json::from_value(raw_value)?)
            } else {
                let legacy: LegacyShowcaseConfig = serde_json::from_value(raw_value)?;
                Ok(ShowcaseConfig::from_legacy(legacy))
            }
        }
        Err(e) if e.kind() == std::io::ErrorKind::NotFound => Ok(ShowcaseConfig::default()),
        Err(e) => Err(e.into()),
    }
}

/// Save showcase config to the given path.
///
/// # Errors
/// Returns an error if the file cannot be written.
pub async fn save_config(path: &Path, config: &ShowcaseConfig) -> anyhow::Result<()> {
    let contents = serde_json::to_string_pretty(config)?;
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).await?;
    }
    fs::write(path, contents).await?;
    Ok(())
}

/// Get the showcase config file path from env or default.
#[must_use]
pub fn config_path() -> String {
    std::env::var("SHOWCASE_CONFIG").unwrap_or_else(|_| "/data/showcase-config.json".to_string())
}
