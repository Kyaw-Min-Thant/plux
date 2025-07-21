use anyhow::Result;
use serde::{Deserialize, Serialize};
use std::{collections::HashMap, sync::Arc};
use tauri::{command, AppHandle, State};
use tokio::sync::{Mutex, RwLock};

use crate::config::{AppConfig, McpConfig, McpServerConfig};
use simple_chat_client::{
    chat::ChatSession,
    client::OpenAIClient,
    tool::{get_mcp_tools, Tool, ToolSet},
};

// Application state
#[derive(Default)]
pub struct AppState {
    pub config: Arc<RwLock<AppConfig>>,
    pub mcp_clients:
        Arc<Mutex<HashMap<String, rmcp::service::RunningService<rmcp::RoleClient, ()>>>>,
    pub chat_session: Arc<Mutex<Option<ChatSession>>>,
    pub tool_set: Arc<Mutex<ToolSet>>,
}

// Tauri commands

#[command]
pub async fn get_app_config(state: State<'_, AppState>) -> Result<AppConfig, String> {
    let config = state.config.read().await;
    Ok(config.clone())
}

#[command]
pub async fn update_app_config(
    state: State<'_, AppState>,
    config: AppConfig,
) -> Result<(), String> {
    let mut app_config = state.config.write().await;
    *app_config = config;
    Ok(())
}

#[command]
pub async fn load_mcp_config() -> Result<McpConfig, String> {
    McpConfig::load_from_user_config()
        .await
        .map_err(|e| e.to_string())
}

#[command]
pub async fn save_mcp_config(config: McpConfig) -> Result<(), String> {
    let home = dirs::home_dir().ok_or("Cannot find home directory")?;
    let config_dir = home.join(".config/finder");

    if !config_dir.exists() {
        tokio::fs::create_dir_all(&config_dir)
            .await
            .map_err(|e| e.to_string())?;
    }

    let config_path = config_dir.join("mcp.json");
    let content = serde_json::to_string_pretty(&config).map_err(|e| e.to_string())?;

    tokio::fs::write(config_path, content)
        .await
        .map_err(|e| e.to_string())
}

#[command]
pub async fn initialize_mcp_clients(state: State<'_, AppState>) -> Result<Vec<String>, String> {
    let mcp_config = load_mcp_config().await?;
    let mut clients = state.mcp_clients.lock().await;
    let mut tool_set = state.tool_set.lock().await;

    // Clear existing clients and tools
    clients.clear();
    *tool_set = ToolSet::default();

    let mut loaded_servers = Vec::new();

    for server_config in &mcp_config.servers {
        match server_config.transport.start().await {
            Ok(client) => {
                let server = client.peer().clone();

                match get_mcp_tools(server).await {
                    Ok(tools) => {
                        for tool in tools {
                            tool_set.add_tool(tool);
                        }
                        clients.insert(server_config.name.clone(), client);
                        loaded_servers.push(server_config.name.clone());
                    }
                    Err(e) => {
                        eprintln!("Failed to get tools from {}: {}", server_config.name, e);
                    }
                }
            }
            Err(e) => {
                eprintln!("Failed to start MCP server {}: {}", server_config.name, e);
            }
        }
    }

    Ok(loaded_servers)
}

#[command]
pub async fn create_chat_session(state: State<'_, AppState>) -> Result<(), String> {
    let config = state.config.read().await;
    let tool_set = state.tool_set.lock().await;

    // Get OpenAI API key
    let api_key = config
        .openai_key
        .clone()
        .or_else(|| std::env::var("OPENAI_API_KEY").ok())
        .ok_or("OpenAI API key not provided")?;

    // Create OpenAI client
    let openai_client = Arc::new(OpenAIClient::new(
        api_key,
        config.chat_url.clone(),
        config.proxy.unwrap_or(false),
    ));

    // Create chat session
    let session = ChatSession::new(
        openai_client,
        tool_set.clone(),
        config
            .model_name
            .clone()
            .unwrap_or_else(|| "gpt-4o-mini".to_string()),
    );

    let mut chat_session = state.chat_session.lock().await;
    *chat_session = Some(session);

    Ok(())
}

#[command]
pub async fn get_available_tools(state: State<'_, AppState>) -> Result<Vec<ToolInfo>, String> {
    let tool_set = state.tool_set.lock().await;
    let tools: Vec<ToolInfo> = tool_set
        .get_tools()
        .iter()
        .map(|tool| ToolInfo {
            name: tool.name().to_string(),
            description: tool.description().to_string(),
        })
        .collect();

    Ok(tools)
}

#[command]
pub async fn send_message(state: State<'_, AppState>, message: String) -> Result<String, String> {
    let mut chat_session = state.chat_session.lock().await;

    match chat_session.as_mut() {
        Some(session) => {
            // This would need to be adapted based on your ChatSession implementation
            // For now, returning a placeholder
            Ok(format!("Received message: {}", message))
        }
        None => Err("Chat session not initialized".to_string()),
    }
}

#[derive(Serialize, Deserialize)]
pub struct ToolInfo {
    pub name: String,
    pub description: String,
}
