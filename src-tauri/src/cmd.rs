use futures::StreamExt;
use rig::{
    agent::Agent,
    client::CompletionClient,
    completion::AssistantContent,
    embeddings::EmbeddingsBuilder,
    providers::{cohere, deepseek},
    vector_store::in_memory_store::InMemoryVectorStore,
};
use rig::client::ProviderClient;
use rig::streaming::StreamingChat;

use crate::config;

pub async fn init_agent() -> anyhow::Result<Agent<deepseek::DeepSeekCompletionModel>> {
    let config = config::Config::load_mcp_config().await?;
    let openai_client = deepseek::Client::from_env();
    let cohere_client = cohere::Client::from_env();
    let mcp_manager = config.mcp.create_manager().await?;
    let tool_set = mcp_manager.get_tool_set().await?;
    let embedding_model =
        cohere_client.embedding_model(cohere::EMBED_MULTILINGUAL_V3, "search_document");
    let embeddings = EmbeddingsBuilder::new(embedding_model.clone())
        .documents(tool_set.schemas()?)?
        .build()
        .await?;
    let store = InMemoryVectorStore::from_documents_with_id_f(embeddings, |f| f.name.clone());
    let index = store.index(embedding_model);
    let agent = openai_client
        .agent(deepseek::DEEPSEEK_CHAT)
        .dynamic_tools(4, index, tool_set)
        .build();
    Ok(agent)
}

#[tauri::command]
pub async fn chat_with_agent_command(
    input: String,
) -> Result<String, String> {
    let agent = match crate::get_agent().await {
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
