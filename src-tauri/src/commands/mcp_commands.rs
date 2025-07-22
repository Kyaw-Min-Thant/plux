use anyhow::Result;
use tauri::State;
use crate::mcp_config::McpConfig;
use crate::tool::ToolSet;
use crate::app_state;

#[tauri::command]
pub async fn load_mcp_config() -> Result<McpConfig, String> {
    McpConfig::load_from_user_config()
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
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

#[tauri::command]
pub async fn initialize_mcp_clients(state: State<'_, app_state::AppState>) -> Result<Vec<String>, String> {
    let mcp_config = load_mcp_config().await?;
    let mut clients = state.mcp_clients.lock().await;
    let mut tool_set = state.tool_set.lock().await;

    clients.clear();
    *tool_set = ToolSet::default();

    let mut loaded_servers = Vec::new();

    let new_clients = mcp_config
        .create_mcp_clients()
        .await
        .map_err(|e| format!("Failed to create MCP clients: {}", e))?;

    for (name, client) in new_clients {
        let server = client.peer().clone();

        match crate::tool::get_mcp_tools(server).await {
            Ok(tools) => {
                for tool in tools {
                    tool_set.add_tool(tool);
                }
                clients.insert(name.clone(), client);
                loaded_servers.push(name);
            }
            Err(e) => {
                eprintln!("Failed to get tools from {}: {}", name, e);
            }
        }
    }
    println!("Loaded servers: {:?}", loaded_servers);
    Ok(loaded_servers)
}