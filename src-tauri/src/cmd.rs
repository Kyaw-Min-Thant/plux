use futures::StreamExt;
use rig::{
    agent::Agent,
    client::CompletionClient,
    completion::AssistantContent,
    embeddings::EmbeddingsBuilder,
    providers::{cohere, deepseek},
    vector_store::in_memory_store::InMemoryVectorStore,
    tool::ToolSet,
};
use rig::client::ProviderClient;
use rig::streaming::StreamingChat;
use std::sync::Arc;

use crate::config;

#[tauri::command]
pub async fn load_mcp_config() -> Result<crate::config::McpConfig, String> {
    crate::config::McpConfig::load()
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn update_api_keys(deepseek_api_key: String, cohere_api_key: String) {
    std::env::set_var("DEEPSEEK_API_KEY", deepseek_api_key);
    std::env::set_var("COHERE_API_KEY", cohere_api_key);
}

#[tauri::command]
pub async fn get_tool_set(id: String) -> Result<String, String> {
    let config = config::McpConfig::load().await.map_err(|e| e.to_string())?;
    let mcp_manager = config.create_manager().await.map_err(|e| e.to_string())?;
    let tool_set = mcp_manager.get_tool_set().await.map_err(|e| e.to_string())?;
    let schemas = tool_set.schemas().map_err(|e| e.to_string())?;
    
    // Store the tool_set in memory with the given ID
    crate::store_tool_set(id.clone(), tool_set);
    
    serde_json::to_string(&schemas).map_err(|e| e.to_string())
}

pub async fn init_agent() -> anyhow::Result<Agent<deepseek::DeepSeekCompletionModel>> {
    let config = config::McpConfig::load().await?;
    let mcp_manager = config.create_manager().await?;
    let tool_set = mcp_manager.get_tool_set().await?;
    create_agent_with_tools(Arc::new(tool_set)).await
}

async fn create_agent_with_tools(tool_set: Arc<ToolSet>) -> anyhow::Result<Agent<deepseek::DeepSeekCompletionModel>> {
    let openai_client = deepseek::Client::from_env();
    let cohere_client = cohere::Client::from_env();
    let embedding_model =
        cohere_client.embedding_model(cohere::EMBED_MULTILINGUAL_V3, "search_document");
    let schemas = tool_set.schemas()?;
    let embeddings = EmbeddingsBuilder::new(embedding_model.clone())
        .documents(schemas)?
        .build()
        .await?;
    let store = InMemoryVectorStore::from_documents(embeddings);
    let index = store.index(embedding_model);
    
    // Create a new tool_set from the schemas
    let mcp_manager = config::McpConfig::load().await?.create_manager().await?;
    let new_tool_set = mcp_manager.get_tool_set().await?;
    
    let agent = openai_client
        .agent(deepseek::DEEPSEEK_CHAT)
        .dynamic_tools(4, index, new_tool_set)
        .build();
    Ok(agent)
}

#[tauri::command]
pub async fn chat_with_agent(
    input: String,
    tool_set_id: String,
) -> Result<String, String> {
    let tool_set = crate::get_tool_set(&tool_set_id)
        .ok_or_else(|| "Tool set not found".to_string())?;
    let agent = match create_agent_with_tools(tool_set).await {
        Ok(agent) => agent,
        Err(e) => return Err(e.to_string()),
    };
    let chat_log = vec![];
    match agent.stream_chat(&input, chat_log.clone()).await {
        Ok(mut stream) => {
            let mut full_response = String::new();
            while let Some(message) = stream.next().await {
                match message {
                    Ok(AssistantContent::Text(text)) => {
                        full_response.push_str(&text.text);
                    }
                    Ok(AssistantContent::ToolCall(tool_call)) => {
                        let result = agent
                            .tools
                            .call(
                                &tool_call.function.name,
                                tool_call.function.arguments.to_string(),
                            )
                            .await;
                        match result {
                            Ok(r) => full_response.push_str(&r.to_string()),
                            Err(e) => return Err(format!("Tool call error: {}", e)),
                        }
                    }
                    Err(e) => return Err(format!("Chat error: {}", e)),
                }
            }
            Ok(full_response)
        }
        Err(e) => Err(format!("Stream error: {}", e)),
    }
}
