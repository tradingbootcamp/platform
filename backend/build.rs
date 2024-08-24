use std::io::Result;
fn main() -> Result<()> {
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
