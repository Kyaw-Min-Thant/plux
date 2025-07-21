use anyhow::Result;
use rmcp::{service::RunningService, transport::ConfigureCommandExt, RoleClient, ServiceExt};
use serde::{Deserialize, Serialize};
use std::{collections::HashMap, path::Path, process::Stdio};
use tauri::{AppHandle, Manager};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct McpConfig {
    pub servers: Vec<McpServerConfig>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct McpServerConfig {
    pub name: String,
    #[serde(flatten)]
    pub transport: McpServerTransportConfig,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(tag = "protocol", rename_all = "lowercase")]
pub enum McpServerTransportConfig {
    Streamable {
        url: String,
    },
    Sse {
        url: String,
    },
    Stdio {
        command: String,
        #[serde(default)]
        args: Vec<String>,
        #[serde(default)]
        envs: HashMap<String, String>,
    },
}

impl McpServerTransportConfig {
    pub async fn start(&self) -> Result<RunningService<RoleClient, ()>> {
        let client = match self {
            McpServerTransportConfig::Streamable { url } => {
                let transport =
                    rmcp::transport::StreamableHttpClientTransport::from_uri(url.to_string());
                ().serve(transport).await?
            }
            McpServerTransportConfig::Sse { url } => {
                let transport =
                    rmcp::transport::sse_client::SseClientTransport::start(url.to_owned()).await?;
                ().serve(transport).await?
            }
            McpServerTransportConfig::Stdio {
                command,
                args,
                envs,
            } => {
                let transport = rmcp::transport::child_process::TokioChildProcess::new(
                    tokio::process::Command::new(command).configure(|cmd| {
                        cmd.args(args)
                            .envs(envs)
                            .stderr(Stdio::inherit())
                            .stdout(Stdio::inherit());
                    }),
                )?;
                ().serve(transport).await?
            }
        };
        Ok(client)
    }
}

impl McpConfig {
    /// Load MCP config from ~/.config/finder/mcp.json
    pub async fn load_from_user_config() -> Result<Self> {
        let home = dirs::home_dir().ok_or_else(|| anyhow::anyhow!("Cannot find home directory"))?;
        let config_path = home.join(".config/finder/mcp.json");

        if !config_path.exists() {
            return Ok(McpConfig { servers: vec![] });
        }

        let content = tokio::fs::read_to_string(config_path).await?;
        let config: Self = serde_json::from_str(&content)?;
        Ok(config)
    }

    /// Create MCP clients from configuration
    pub async fn create_mcp_clients(
        &self,
    ) -> Result<HashMap<String, RunningService<RoleClient, ()>>> {
        let mut clients = HashMap::new();

        for server in &self.servers {
            let client = server.transport.start().await?;
            clients.insert(server.name.clone(), client);
        }

        Ok(clients)
    }
}

/// App configuration for frontend-backend communication
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AppConfig {
    pub openai_key: Option<String>,
    pub chat_url: Option<String>,
    pub model_name: Option<String>,
    pub proxy: Option<bool>,
    pub support_tool: Option<bool>,
}

impl Default for AppConfig {
    fn default() -> Self {
        Self {
            openai_key: None,
            chat_url: Some("https://api.openai.com/v1/chat/completions".to_string()),
            model_name: Some("gpt-4o-mini".to_string()),
            proxy: Some(false),
            support_tool: Some(true),
        }
    }
}
