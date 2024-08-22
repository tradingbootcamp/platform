use std::io::Result;
fn main() -> Result<()> {
    let mut config = prost_build::Config::new();
    config.message_attribute("Out", "#[derive(serde::Deserialize, utoipa::ToSchema)]");
    config.message_attribute(
        "CreateOrder",
        "#[derive(serde::Deserialize, utoipa::ToSchema)]",
    );
    config.message_attribute("Redeem", "#[derive(serde::Deserialize, utoipa::ToSchema)]");
    config.message_attribute("Redeemed", "#[derive(serde::Serialize, utoipa::ToSchema)]");
    config.message_attribute(
        "CancelOrder",
        "#[derive(serde::Deserialize, utoipa::ToSchema)]",
    );
    config.field_attribute(
        "CreateOrder.side",
        r#"#[serde(deserialize_with = "deserialize_side")] #[schema(value_type = Side)]"#,
    );
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
