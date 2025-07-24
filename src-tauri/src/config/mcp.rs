use std::{collections::HashMap, process::Stdio};

use rmcp::{RoleClient, ServiceExt, service::RunningService, transport::ConfigureCommandExt};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct McpConfig {
    #[serde(rename = "mcpServers")]
    pub servers: HashMap<String, McpServerTransportConfig>,
}

use crate::mcp_adaptor::McpManager;
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct McpServerConfig {
    name: String,
    #[serde(flatten)]
    transport: McpServerTransportConfig,
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


impl McpConfig {
    pub async fn create_manager(&self) -> anyhow::Result<McpManager> {
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

        Ok(McpManager { clients })
    }
}

impl McpServerTransportConfig {
    pub async fn start(&self) -> anyhow::Result<RunningService<RoleClient, ()>> {
        let client = match self {
            McpServerTransportConfig::Streamable { url } => {
                let transport =
                    rmcp::transport::StreamableHttpClientTransport::from_uri(url.to_string());
                ().serve(transport).await?
            }
            McpServerTransportConfig::Sse { url } => {
                let transport = rmcp::transport::SseClientTransport::start(url.to_string()).await?;
                ().serve(transport).await?
            }
            McpServerTransportConfig::Stdio {
                command,
                args,
                envs,
            } => {
                let transport = rmcp::transport::TokioChildProcess::new(
                    tokio::process::Command::new(command).configure(|cmd| {
                        cmd.args(args).envs(envs).stderr(Stdio::inherit())
                        .stdout(Stdio::inherit());
                    }),
                )?;
                ().serve(transport).await?
            }
        };
        Ok(client)
    }
}
