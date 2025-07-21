use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Arc;
use tokio::io::{AsyncBufReadExt, AsyncWriteExt, BufReader};
use tokio::process::{Child, ChildStdin, ChildStdout, Command};
use tokio::sync::Mutex;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct McpServer {
    pub name: String,
    pub command: String,
    pub args: Vec<String>,
    pub env: HashMap<String, String>,
}

#[derive(Debug, Clone, Serialize)]
pub struct McpTool {
    pub name: String,
    pub description: String,
    pub input_schema: serde_json::Value,
}

pub struct McpConnection {
    pub stdin: Arc<Mutex<ChildStdin>>,
    pub stdout: Arc<Mutex<BufReader<ChildStdout>>>,
    pub process: Arc<Mutex<Child>>,
}

type McpConnections = Arc<Mutex<HashMap<String, McpConnection>>>;

#[tauri::command]
async fn start_mcp_server(
    name: String,
    command: String,
    args: Vec<String>,
    connections: tauri::State<'_, McpConnections>,
) -> Result<String, String> {
    let mut child = Command::new(&command)
        .args(&args)
        .stdin(std::process::Stdio::piped())
        .stdout(std::process::Stdio::piped())
        .stderr(std::process::Stdio::piped())
        .spawn()
        .map_err(|e| format!("Failed to start MCP server: {}", e))?;

    let stdin = child.stdin.take().ok_or("Failed to get stdin")?;
    let stdout = child.stdout.take().ok_or("Failed to get stdout")?;
    
    let connection = McpConnection {
        stdin: Arc::new(Mutex::new(stdin)),
        stdout: Arc::new(Mutex::new(BufReader::new(stdout))),
        process: Arc::new(Mutex::new(child)),
    };

    {
        let mut conns = connections.lock().await;
        conns.insert(name.clone(), connection);
    }

    // Send initialize request
    let init_request = serde_json::json!({
        "jsonrpc": "2.0",
        "id": 1,
        "method": "initialize",
        "params": {
            "protocolVersion": "2024-11-05",
            "capabilities": {
                "tools": {}
            },
            "clientInfo": {
                "name": "tauri-mcp-client",
                "version": "1.0.0"
            }
        }
    });

    send_mcp_request(name.clone(), init_request, connections).await?;
    Ok(format!("MCP server '{}' started successfully", name))
}

#[tauri::command]
async fn send_mcp_request(
    server_name: String,
    request: serde_json::Value,
    connections: tauri::State<'_, McpConnections>,
) -> Result<serde_json::Value, String> {
    let conns = connections.lock().await;
    let connection = conns.get(&server_name)
        .ok_or_else(|| format!("MCP server '{}' not found", server_name))?;

    let request_str = serde_json::to_string(&request)
        .map_err(|e| format!("Failed to serialize request: {}", e))?;

    // Send request
    {
        let mut stdin = connection.stdin.lock().await;
        stdin.write_all(format!("{}\n", request_str).as_bytes()).await
            .map_err(|e| format!("Failed to write to stdin: {}", e))?;
        stdin.flush().await
            .map_err(|e| format!("Failed to flush stdin: {}", e))?;
    }

    // Read response
    let mut stdout = connection.stdout.lock().await;
    let mut line = String::new();
    stdout.read_line(&mut line).await
        .map_err(|e| format!("Failed to read from stdout: {}", e))?;

    serde_json::from_str(&line)
        .map_err(|e| format!("Failed to parse response: {}", e))
}

#[tauri::command]
async fn list_mcp_tools(
    server_name: String,
    connections: tauri::State<'_, McpConnections>,
) -> Result<Vec<McpTool>, String> {
    let request = serde_json::json!({
        "jsonrpc": "2.0",
        "id": 2,
        "method": "tools/list"
    });

    let response = send_mcp_request(server_name.clone(), request, connections).await?;
    
    let tools = response["result"]["tools"].as_array()
        .ok_or("Invalid tools response")?;

    let mut mcp_tools = Vec::new();
    for tool in tools {
        let mcp_tool = McpTool {
            name: tool["name"].as_str().unwrap_or("").to_string(),
            description: tool["description"].as_str().unwrap_or("").to_string(),
            input_schema: tool["inputSchema"].clone(),
        };
        mcp_tools.push(mcp_tool);
    }

    Ok(mcp_tools)
}

#[tauri::command]
async fn call_mcp_tool(
    server_name: String,
    tool_name: String,
    arguments: serde_json::Value,
    connections: tauri::State<'_, McpConnections>,
) -> Result<serde_json::Value, String> {
    let request = serde_json::json!({
        "jsonrpc": "2.0",
        "id": 3,
        "method": "tools/call",
        "params": {
            "name": tool_name,
            "arguments": arguments
        }
    });

    send_mcp_request(server_name, request, connections).await
}

#[tauri::command]
async fn stop_mcp_server(
    server_name: String,
    connections: tauri::State<'_, McpConnections>,
) -> Result<String, String> {
    let mut conns = connections.lock().await;
    if let Some(connection) = conns.remove(&server_name) {
        let mut process = connection.process.lock().await;
        process.kill().await
            .map_err(|e| format!("Failed to kill process: {}", e))?;
        Ok(format!("MCP server '{}' stopped", server_name))
    } else {
        Err(format!("MCP server '{}' not found", server_name))
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(McpConnections::default())
        .invoke_handler(tauri::generate_handler![
            start_mcp_server,
            send_mcp_request,
            list_mcp_tools,
            call_mcp_tool,
            stop_mcp_server
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}