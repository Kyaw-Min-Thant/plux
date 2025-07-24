mod cmd;
mod config;
mod mcp_adaptor;

use crate::cmd::init_agent;
use rig::{agent::Agent, providers::deepseek};
use tokio::sync::OnceCell;

static AGENT: OnceCell<Agent<deepseek::DeepSeekCompletionModel>> = OnceCell::const_new();

pub async fn get_agent() -> anyhow::Result<&'static Agent<deepseek::DeepSeekCompletionModel>> {
    AGENT.get_or_try_init(init_agent).await
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            cmd::chat_with_agent_command
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
