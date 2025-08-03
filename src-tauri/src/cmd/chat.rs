use crate::{
    mcp_client::{
        chat::ChatSession,
        client::{ChatClient, GeminiClient, OpenAIClient},
    },
    GlobalToolSet,
};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use std::sync::Mutex;
use tauri::State;

pub struct ChatState {
    pub session: Mutex<Option<ChatSession>>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ToolInfo {
    pub name: String,
    pub description: String,
    pub parameters: serde_json::Value,
}

#[derive(Deserialize)]
pub struct ChatRequest {
    message: String,
    provider: String,
    api_key: String,
    model: String,
}

#[tauri::command]
pub async fn send_message(
    request: ChatRequest,
    state: State<'_, ChatState>,
    tool_set: State<'_, GlobalToolSet>,
) -> Result<serde_json::Value, String> {
    let mut session = {
        let mut session_guard = state.session.lock().unwrap();
        let session_model = session_guard.as_ref().map(|s| s.get_model());

        let should_recreate_session = session_guard.is_none()
            || session_model.is_some_and(|m| m != request.model);

        if should_recreate_session {
            let client: Arc<dyn ChatClient> = if request.provider == "google" {
                Arc::new(GeminiClient::new(request.api_key, None, None))
            } else {
                Arc::new(OpenAIClient::new(request.api_key, None, None))
            };
            let mut new_session = ChatSession::new(client, (*tool_set.0).clone(), request.model);
            new_session
                .add_system_prompt("you are a assistant, you can help user to complete various tasks.");
            new_session
        } else {
            session_guard.take().unwrap()
        }
    };

    let result = session.next_message(&request.message, true).await;

    // Place the session back into the state.
    {
        let mut session_guard = state.session.lock().unwrap();
        *session_guard = Some(session);
    }

    match result {
        Ok((response_message, tool_messages)) => {
            let mut messages = vec![response_message];
            messages.extend(tool_messages);
            Ok(serde_json::to_value(messages).unwrap())
        }
        Err(e) => Err(e.to_string()),
    }
}

#[tauri::command]
pub async fn list_tools(state: State<'_, ChatState>) -> Result<Vec<ToolInfo>, String> {
    let session_guard = state.session.lock().unwrap();
    let session = match session_guard.as_ref() {
        Some(session) => session,
        None => return Err("Chat session not initialized".to_string()),
    };

    let tools = session.get_tools();
    let tool_infos: Vec<ToolInfo> = tools
        .iter()
        .map(|tool| ToolInfo {
            name: tool.name(),
            description: tool.description(),
            parameters: tool.parameters(),
        })
        .collect();

    Ok(tool_infos)
}
