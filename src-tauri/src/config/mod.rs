use std::collections::HashMap;

pub mod mcp;
pub use mcp::McpConfig;

impl McpConfig {
    pub async fn load() -> anyhow::Result<Self> {
        let home = dirs::home_dir().ok_or_else(|| anyhow::anyhow!("Cannot find home directory"))?;
        let config_path = home.join(".config/finder/mcp.json");

        if !config_path.exists() {
            return Ok(Self { servers: HashMap::new() });
        }

        let content = tokio::fs::read_to_string(config_path).await?;
        let config = serde_json::from_str(&content)?;
        Ok(config)
    }
}
