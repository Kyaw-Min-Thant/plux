pub mod chat;
pub mod client;
mod commands;
mod mcp_config;
mod error;
mod model;
mod app_state;
mod tool;

use commands::{
    create_chat_session, get_available_tools, initialize_mcp_clients,
    load_mcp_config, save_mcp_config, send_chat_message,
};
use crate::app_state::AppState;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(AppState::default())
        .invoke_handler(tauri::generate_handler![
            load_mcp_config,
            save_mcp_config,
            initialize_mcp_clients,
            create_chat_session,
            get_available_tools,
            send_chat_message,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
