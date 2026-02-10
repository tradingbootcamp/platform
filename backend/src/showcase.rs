use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::Path;
use tokio::fs;

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct ShowcaseConfig {
    pub active_bootcamp: Option<String>,
    pub bootcamps: HashMap<String, BootcampConfig>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BootcampConfig {
    pub db_path: String,
    pub display_name: String,
    #[serde(default)]
    pub anonymize_names: bool,
    #[serde(default)]
    pub showcase_market_ids: Vec<i64>,
}

impl ShowcaseConfig {
    #[must_use]
    pub fn get_active_bootcamp(&self) -> Option<&BootcampConfig> {
        self.active_bootcamp
            .as_ref()
            .and_then(|key| self.bootcamps.get(key))
    }
}

/// Load showcase config from the given path, or return default if not found.
///
/// # Errors
/// Returns an error if the file exists but cannot be read or parsed.
pub async fn load_config(path: &Path) -> anyhow::Result<ShowcaseConfig> {
    match fs::read_to_string(path).await {
        Ok(contents) => Ok(serde_json::from_str(&contents)?),
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
