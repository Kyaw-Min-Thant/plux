mod cmd;
mod config;
mod mcp_adaptor;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            cmd::chat_with_agent,
            cmd::load_mcp_config,
            cmd::update_api_keys
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}