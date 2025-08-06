use anyhow::Result;
use async_trait::async_trait;

use super::super::model::{CompletionRequest, CompletionResponse, Tool};

#[async_trait]
pub trait ChatClient: Send + Sync {
    async fn complete(&self, request: CompletionRequest) -> Result<CompletionResponse>;
    
    // Transform tools to client-specific format
    fn transform_tools(&self, tools: &[Tool]) -> Vec<Tool> {
        tools.to_vec() // Default: no transformation
    }
}

#[async_trait]
pub trait StreamingChatClient: ChatClient {
    async fn complete_stream(
        &self, 
        request: CompletionRequest, 
        callback: Box<dyn Fn(String) + Send + Sync>
    ) -> Result<CompletionResponse>;
}
