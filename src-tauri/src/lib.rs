mod chat;
mod client;
mod commands;
mod config;
mod error;
mod mcp_config;
mod model;
mod tool;

use commands::{
    create_chat_session, get_app_config, get_available_tools, initialize_mcp_clients,
    load_mcp_config, save_mcp_config, send_message, update_app_config, AppState,
};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(AppState::default())
        .invoke_handler(tauri::generate_handler![
            get_app_config,
            update_app_config,
            load_mcp_config,
            save_mcp_config,
            initialize_mcp_clients,
            create_chat_session,
            get_available_tools,
            send_message,
            tool::get_mcp_tools,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
