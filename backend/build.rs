use std::{env, io::Result, path::Path};

fn sqlite_db_path(database_url: &str) -> Option<&str> {
    if !database_url.starts_with("sqlite:") {
        return None;
    }
    if database_url.contains(":memory:") {
        return None;
    }
    let mut path = database_url.trim_start_matches("sqlite:");
    if let Some(stripped) = path.strip_prefix("//") {
        path = stripped;
    }
    let path = path.split('?').next().unwrap_or(path);
    if path.is_empty() {
        None
    } else {
        Some(path)
    }
}

fn check_sqlite_db() {
    dotenvy::dotenv().ok();
    if env::var("SQLX_OFFLINE")
        .ok()
        .is_some_and(|val| val.eq_ignore_ascii_case("true"))
    {
        return;
    }
    let database_url = match env::var("DATABASE_URL") {
        Ok(url) => url,
        Err(_) => return,
    };
    let Some(path) = sqlite_db_path(&database_url) else {
        return;
    };
    if Path::new(path).exists() {
        return;
    }
    panic!(
        "DATABASE_URL points to missing SQLite file: {path}. Run `sqlx db create` (and `sqlx migrate run`) or set SQLX_OFFLINE=true."
    );
}

fn main() -> Result<()> {
    println!("cargo:rerun-if-env-changed=DATABASE_URL");
    println!("cargo:rerun-if-env-changed=SQLX_OFFLINE");
    println!("cargo:rerun-if-changed=.env");
    check_sqlite_db();

    let mut config = prost_build::Config::new();
    config.compile_protos(
        &[
            "../schema/server-message.proto",
            "../schema/client-message.proto",
        ],
        &["../schema"],
    )?;
    println!("cargo:rerun-if-changed=migrations");
    println!("cargo:rerun-if-changed=../schema/*");
    Ok(())
}
