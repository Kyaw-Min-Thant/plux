use crate::mcp_client::chat::ChatSession;
use std::sync::Mutex;
use tauri::State;

pub struct ChatState {
    pub session: Mutex<Option<ChatSession>>,
}

#[tauri::command]
pub async fn send_message(
    message: String,
    state: State<'_, ChatState>,
) -> Result<serde_json::Value, String> {
    // Take the session from the Mutex to avoid holding the lock across an await point.
    let mut session = match state.session.lock().unwrap().take() {
        Some(session) => session,
        None => return Err("Chat session not initialized".to_string()),
    };

    let result = session.next_message(&message, true).await;

    // Place the session back into the state.
    *state.session.lock().unwrap() = Some(session);

    match result {
        Ok((response_message, tool_messages)) => {
            let mut messages = vec![response_message];
            messages.extend(tool_messages);
            Ok(serde_json::to_value(messages).unwrap())
        }
        Err(e) => Err(e.to_string()),
    }
}
