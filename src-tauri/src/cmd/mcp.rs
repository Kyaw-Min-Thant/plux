use rmcp::model::Tool as McpTool;

use crate::config;

#[tauri::command]
pub async fn list_mcp_tools() -> Result<std::collections::HashMap<String, Vec<McpTool>>, String> {
    let config = config::McpConfig::load().await.map_err(|e| e.to_string())?;
    let mcp_manager = config.create_manager().await.map_err(|e| e.to_string())?;

    let mut tools_map = std::collections::HashMap::new();
    let mut task = tokio::task::JoinSet::new();

    for (server_name, client) in mcp_manager.clients.iter() {
        let server = client.peer().clone();
        let server_name = server_name.clone();
        task.spawn(async move {
            let tools = match server.list_all_tools().await {
                Ok(tools) => tools,
                Err(e) => {
                    eprintln!("Failed to list tools for server '{}': {}", server_name, e);
                    Vec::new()
                }
            };
            (server_name, tools)
        });
    }

    while let Some(result) = task.join_next().await {
        if let Ok((server_name, tools)) = result {
            tools_map.insert(server_name, tools);
        }
    }

    Ok(tools_map)
}

#[tauri::command]
pub async fn load_mcp_config() -> Result<config::McpConfig, String> {
    config::McpConfig::load().await.map_err(|e| e.to_string())
}