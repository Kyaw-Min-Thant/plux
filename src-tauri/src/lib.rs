mod cmd;
mod config;
mod mcp_adaptor;

use cmd::{
    chat_with_agent, fetch_and_save_manifest, list_mcp_tools, load_manifest, load_manifests, load_mcp_config,
    update_api_keys,read_dxt_setting, save_dxt_setting, list_tools
};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            chat_with_agent,
            load_mcp_config,
            update_api_keys,
            list_mcp_tools,
            load_manifest,
            load_manifests,
            fetch_and_save_manifest,
            save_dxt_setting,
            read_dxt_setting,
            list_tools,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
