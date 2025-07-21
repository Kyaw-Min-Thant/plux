use crate::models::{McpServerConfig, Tool};
use crate::state::McpClients;
use rmcp::client::Client;
use rmcp::transport::child_process::ChildProcessTransport;
use tauri::State;

#[tauri::command]
pub async fn connect_mcp_server(
    name: String,
    config: McpServerConfig,
    clients: State<'_, McpClients>,
) -> Result<bool, String> {
    let mut transport = ChildProcessTransport::new(&config.command, &config.args)
        .map_err(|e| format!("Failed to create transport: {}", e))?;
    if let Some(env) = &config.env {
        for (key, value) in env {
            transport = transport.with_env(key, value);
        }
    }
    let client = Client::new(transport).map_err(|e| format!("Failed to create client: {}", e))?;
    let mut clients_map = clients.lock().unwrap();
    clients_map.insert(name, client);
    Ok(true)
}

#[tauri::command]
pub async fn disconnect_mcp_server(
    name: String,
    clients: State<'_, McpClients>,
) -> Result<bool, String> {
    let mut clients_map = clients.lock().unwrap();
    clients_map.remove(&name);
    Ok(true)
}

#[tauri::command]
pub async fn list_tools(
    server_name: String,
    clients: State<'_, McpClients>,
) -> Result<Vec<Tool>, String> {
    let clients_map = clients.lock().unwrap();
    let client = clients_map
        .get(&server_name)
        .ok_or_else(|| format!("Server {} not connected", server_name))?;
    // This is a simplified version - you'll need to implement the actual MCP protocol calls
    // based on the rmcp SDK documentation
    Ok(vec![Tool {
        name: "example_tool".to_string(),
        description: Some("An example tool".to_string()),
        input_schema: None,
    }])
}
