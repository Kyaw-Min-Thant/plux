mod providers;

use anyhow::Result;
use async_trait::async_trait;
use std::sync::Arc;
use crate::model::{CompletionRequest, CompletionResponse};

pub use providers::{OpenAIClient, ClaudeClient, GeminiClient, OpenRouterClient, ChatProvider};

#[async_trait]
pub trait ChatClient: Send + Sync {
    async fn complete(&self, request: CompletionRequest) -> Result<CompletionResponse>;
}

// Factory function to create the appropriate ChatClient
pub fn create_chat_client(
    provider: &str,
    api_key: String,
    url: Option<String>,
    proxy: Option<bool>,
) -> Arc<dyn ChatClient> {
    match ChatProvider::from_str(provider) {
        Some(ChatProvider::OpenAI) => Arc::new(OpenAIClient::new(api_key, url, proxy)),
        Some(ChatProvider::Claude) => Arc::new(ClaudeClient::new(api_key, url, proxy)),
        Some(ChatProvider::Gemini) => Arc::new(GeminiClient::new(api_key, url, proxy)),
        Some(ChatProvider::OpenRouter) => Arc::new(OpenRouterClient::new(api_key, url, proxy)),
        None => Arc::new(OpenAIClient::new(api_key, url, proxy)), // fallback
    }
}
