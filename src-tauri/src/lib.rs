mod cmd;
mod config;
mod mcp_client;

use std::sync::{Arc, Mutex};

use tauri::Manager;

use cmd::{
    chat::ChatState,
    dxt::{fetch_and_save_manifest, load_manifest, load_manifests},
    dxt_status::{read_dxt_setting, save_dxt_setting},
};
use mcp_client::{chat::ChatSession, tool::Tool};

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
                let chat_state: tauri::State<ChatState> = app_handle.state();
                let mcp_config = config::McpConfig::load(&app_handle).await.unwrap();
                let mcp_clients = mcp_config.create_mcp_clients().await.unwrap();

                let mut tool_set = mcp_client::tool::ToolSet::default();
                for (name, client) in mcp_clients.iter() {
                    println!("load MCP tool: {}", name);
                    let server = client.peer().clone();
                    let tools = mcp_client::tool::get_mcp_tools(server).await.unwrap();

                    for tool in tools {
                        println!("add tool: {}", tool.name());
                        tool_set.add_tool(tool);
                    }
                }
                tool_set.set_clients(mcp_clients);
                println!("{:?}", tool_set); // pretty-printed debug output

                // TODO: Move OpenAI client details to a configuration file
                let openai_client = Arc::new(mcp_client::client::OpenAIClient::new(
                    std::env::var("OPENAI_API_KEY").unwrap_or_default(),
                    None,
                    None,
                ));

                let mut session =
                    ChatSession::new(openai_client, tool_set, "gpt-4o-mini".to_string());
                session.add_system_prompt(
                    "you are a assistant, you can help user to complete various tasks.",
                );

                *chat_state.session.lock().unwrap() = Some(session);
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
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
