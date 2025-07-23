use anyhow::Result;
use rmcp::{service::RunningService, transport::ConfigureCommandExt, RoleClient, ServiceExt};
use serde::{Deserialize, Serialize};
use std::{collections::HashMap, process::Stdio};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct McpConfig {
    #[serde(rename = "mcpServers")]
    pub servers: HashMap<String, McpServerTransportConfig>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct McpServerConfig {
    pub name: String,
    #[serde(flatten)]
    pub transport: McpServerTransportConfig,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(untagged)]
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
            return Ok(McpConfig { servers: HashMap::new() });
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

        for (name, transport_config) in &self.servers {
            match transport_config.start().await {
                Ok(client) => {
                    clients.insert(name.clone(), client);
                }
                Err(e) => {
                    eprintln!("Failed to start MCP server {}: {}", name, e);
                }
            }
        }

        Ok(clients)
    }

    /// Enable a single MCP server by name
    pub async fn enable_mcp_server(
        &self,
        name: &str,
    ) -> Result<Option<(String, RunningService<RoleClient, ()>)>> {
        if let Some(config) = self.servers.get(name) {
            match config.start().await {
                Ok(client) => Ok(Some((name.to_string(), client))),
                Err(e) => {
                    eprintln!("Failed to start MCP server {}: {}", name, e);
                    Ok(None)
                }
            }
        } else {
            Err(anyhow::anyhow!("Server config not found for {}", name))
        }
    }

    /// Disable a single MCP client by name from the running clients HashMap
    pub fn disable_mcp_server(
        clients: &mut HashMap<String, RunningService<RoleClient, ()>>,
        name: &str,
    ) -> Result<()> {
        if clients.remove(name).is_some() {
            Ok(())
        } else {
            Err(anyhow::anyhow!("MCP client not found for {}", name))
        }
    }
}