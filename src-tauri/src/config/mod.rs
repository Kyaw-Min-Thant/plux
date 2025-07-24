use serde::{Deserialize, Serialize};
use std::collections::HashMap;
pub mod mcp;

#[derive(Debug, Deserialize, Serialize)]
pub struct Config {
    pub mcp: mcp::McpConfig,
}

impl Config {
    pub async fn load_mcp_config() -> anyhow::Result<Self> {
        let home = dirs::home_dir().ok_or_else(|| anyhow::anyhow!("Cannot find home directory"))?;
        let config_path = home.join(".config/finder/mcp.json");

        if !config_path.exists() {
            return Ok(Self { mcp: mcp::McpConfig { servers: HashMap::new() } });
        }

        let content = tokio::fs::read_to_string(config_path).await?;
        let mcp_config: mcp::McpConfig = serde_json::from_str(&content)?;
        let config = Config { mcp: mcp_config };
        Ok(config)
    }
}
