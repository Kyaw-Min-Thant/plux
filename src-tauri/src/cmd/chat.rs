use futures::StreamExt;
use rig::{
    agent::Agent,
    client::CompletionClient,
    completion::AssistantContent,
    embeddings::EmbeddingsBuilder,
    providers::{cohere, deepseek},
    tool::ToolSet,
    vector_store::in_memory_store::InMemoryVectorStore,
};
use rig::{client::ProviderClient, streaming::StreamingChat};

use crate::config;

async fn create_agent_with_tools(
    tool_set: ToolSet,
) -> anyhow::Result<Agent<deepseek::DeepSeekCompletionModel>> {
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

    let agent = openai_client
        .agent(deepseek::DEEPSEEK_CHAT)
        .dynamic_tools(4, index, tool_set)
        .build();
    Ok(agent)
}

#[tauri::command]
pub async fn chat_with_agent(input: String) -> Result<String, String> {
    let config = config::McpConfig::load().await.map_err(|e| e.to_string())?;
    let mcp_manager = config.create_manager().await.map_err(|e| e.to_string())?;
    let tool_set = mcp_manager
        .get_tool_set()
        .await
        .map_err(|e| e.to_string())?;

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
