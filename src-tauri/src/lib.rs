mod cmd;
mod config;
mod mcp_adaptor;

use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use once_cell::sync::Lazy;
use cmd::init_agent;
use rig::{agent::Agent, providers::deepseek, tool::ToolSet};
use tokio::sync::OnceCell;

static AGENT: OnceCell<Agent<deepseek::DeepSeekCompletionModel>> = OnceCell::const_new();
static TOOL_SETS: Lazy<Mutex<HashMap<String, Arc<ToolSet>>>> = Lazy::new(|| Mutex::new(HashMap::new()));

pub(crate) fn store_tool_set(id: String, tool_set: ToolSet) {
    let mut tool_sets = TOOL_SETS.lock().unwrap();
    tool_sets.insert(id, Arc::new(tool_set));
}

pub(crate) fn get_tool_set(id: &str) -> Option<Arc<ToolSet>> {
    let tool_sets = TOOL_SETS.lock().unwrap();
    tool_sets.get(id).cloned()
}

pub async fn get_agent() -> anyhow::Result<&'static Agent<deepseek::DeepSeekCompletionModel>> {
    AGENT.get_or_try_init(init_agent).await
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            cmd::chat_with_agent,
            cmd::load_mcp_config,
            cmd::get_tool_set,
            cmd::update_api_keys
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
