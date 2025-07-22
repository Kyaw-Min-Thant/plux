use anyhow::Result;
use tauri::State;
use crate::chat::ChatSession;
use crate::tool::ToolSet;
use crate::app_state;
use serde::Deserialize;

#[derive(Deserialize)]
pub struct ChatRequest {
    pub message: String,
    pub provider: String,
    pub model: String,
    pub api_key: Option<String>, // accept api_key from frontend
}

#[tauri::command]
pub async fn create_chat_session(state: State<'_, app_state::AppState>, request: ChatRequest) -> Result<(), String> {
    let tool_set = state.tool_set.lock().await;

    // Use provider and API key from request only
    let provider = request.provider.clone();
    let api_key = request.api_key.clone().ok_or("API key not provided")?;
    let model = request.model.clone();

    // Create client for selected provider
    let client = crate::client::create_chat_client(
        &provider,
        api_key,
        None,
        None,
    );

    // Create chat session
    let session = ChatSession::new(
        client,
        ToolSet::default(),
        model,
        provider,
    );

    let mut chat_session = state.chat_session.lock().await;
    *chat_session = Some(session);

    Ok(())
}

#[tauri::command]
pub async fn send_chat_message(
    state: State<'_, app_state::AppState>,
    request: ChatRequest,
) -> Result<String, String> {
    use crate::model::Message;
    use crate::model::CompletionRequest;
    use crate::client::create_chat_client;
    use crate::tool::ToolSet;

    // Lock chat session
    let mut chat_session = state.chat_session.lock().await;
    // If no session or provider/model changed, create new session
    let need_new_session = match chat_session.as_ref() {
        Some(session) => session.model() != request.model || session.provider() != request.provider,
        None => true,
    };
    if need_new_session {
        // Use api_key from request only
        let api_key = request.api_key.clone().ok_or("API key not provided")?;
        let client = create_chat_client(
            &request.provider,
            api_key,
            None,
            None,
        );
        let session = ChatSession::new(client, ToolSet::default(), request.model.clone(), request.provider.clone());
        *chat_session = Some(session);
    }
    // Safe to unwrap now
    let session = chat_session.as_mut().unwrap();
    // Add user message
    session.messages_mut().push(Message::user(&request.message));
    // Build completion request
    let completion_request = CompletionRequest {
        model: session.model().to_string(),
        messages: session.messages().clone(),
        temperature: Some(0.7),
        tools: None,
    };
    // Call model
    let response = session.client().complete(completion_request).await.map_err(|e| e.to_string())?;
    let choice = response.choices.first().ok_or("No response from model")?;
    // Add assistant message to history
    session.messages_mut().push(choice.message.clone());
    Ok(choice.message.content.clone())
}
