mod cmd;
mod config;
mod mcp_client;

use std::sync::{Arc, Mutex};

use tauri::Manager;

use cmd::{
    chat::{ChatState, list_tools},
    dxt::{fetch_and_save_manifest, load_manifest, load_manifests},
    dxt_status::{read_dxt_setting, save_dxt_setting},
    filesystem::{read_directory, get_default_directories, calculate_file_tokens, read_file},
};
use mcp_client::tool::ToolSet;

pub struct GlobalToolSet(pub Arc<ToolSet>);

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .manage(ChatState {
            session: Mutex::new(None),
        })
        .setup(|app| {
            let app_handle = app.handle().clone();

            tauri::async_runtime::spawn(async move {
                let mcp_config = config::McpConfig::load(&app_handle).await.unwrap();
                let mcp_clients = mcp_config.create_mcp_clients().await.unwrap();

                let mut tool_set = mcp_client::tool::ToolSet::default();
                for (name, client) in mcp_clients.iter() {
                    println!("load MCP tool: {}", name);
                    let server = client.peer().clone();
                    let tools = mcp_client::tool::get_mcp_tools(server).await.unwrap();

                    for tool in tools {
                        tool_set.add_tool(tool);
                    }
                }
                tool_set.set_clients(mcp_clients);
                println!("{:?}", tool_set); // pretty-printed debug output
                
                app_handle.manage(GlobalToolSet(Arc::new(tool_set)));
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            load_manifest,
            load_manifests,
            fetch_and_save_manifest,
            save_dxt_setting,
            read_dxt_setting,
            cmd::chat::send_message,
            list_tools,
            read_directory,
            get_default_directories,
            calculate_file_tokens,
            read_file,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
