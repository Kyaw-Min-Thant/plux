use rmcp::{service::RunningService, transport::ConfigureCommandExt, RoleClient, ServiceExt};
use serde::{Deserialize, Serialize};
use std::{collections::HashMap, process::Stdio};
use tauri::{AppHandle, Manager};

#[derive(Debug, Serialize, Deserialize, Clone, Default)]
pub struct McpConfig {
    #[serde(rename = "mcpServers", default)]
    pub servers: HashMap<String, McpServer>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct McpServer {
    command: String,
    #[serde(default)]
    args: Vec<String>,
    #[serde(default)]
    envs: HashMap<String, String>,
}

impl McpConfig {
    pub async fn load(app: &AppHandle) -> anyhow::Result<Self> {
        let config_path = app
            .path()
            .resolve("mcp.json", tauri::path::BaseDirectory::Resource)?;

        if !config_path.exists() {
            // try to load from home dir for backward compatibility
            let home_config_path =
                dirs::home_dir().map(|h| h.join(".config/finder/mcp.json"));
            if let Some(path) = home_config_path {
                if path.exists() {
                    let content = tokio::fs::read_to_string(path).await?;
                    let config = serde_json::from_str(&content)?;
                    return Ok(config);
                }
            }
            return Ok(Self::default());
        }

        let content = tokio::fs::read_to_string(config_path).await?;
        let config = serde_json::from_str(&content)?;
        Ok(config)
    }

    pub async fn create_mcp_clients(
        &self,
    ) -> Result<HashMap<String, RunningService<RoleClient, ()>>, anyhow::Error> {
        let mut clients = HashMap::new();

        for (name, config) in &self.servers {
            let client = config.start().await?;
            clients.insert(name.clone(), client);
        }

        Ok(clients)
    }
}


impl McpServer {
    pub async fn start(&self) -> anyhow::Result<RunningService<RoleClient, ()>> {
        let transport = rmcp::transport::TokioChildProcess::new(
            tokio::process::Command::new(&self.command).configure(|cmd| {
                cmd.args(&self.args)
                    .envs(&self.envs)
                    .stderr(Stdio::piped())
                    .stdout(Stdio::piped());
            }),
        )?;
        return Ok(().serve(transport).await?);
    }
}
