use anyhow::Result;
use tauri::State;
use serde::{Serialize, Deserialize};
use crate::app_state;

#[derive(Serialize, Deserialize)]
pub struct ToolInfo {
    pub name: String,
    pub description: String,
}

#[tauri::command]
pub async fn get_available_tools(state: State<'_, app_state::AppState>) -> Result<Vec<ToolInfo>, String> {
    let tool_set = state.tool_set.lock().await;
    let tools: Vec<ToolInfo> = tool_set
        .tools()
        .iter()
        .map(|tool| ToolInfo {
            name: tool.name().to_string(),
            description: tool.description().to_string(),
        })
        .collect();

    Ok(tools)
}
