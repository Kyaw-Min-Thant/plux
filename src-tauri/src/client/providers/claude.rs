use anyhow::Result;
use async_trait::async_trait;
use reqwest::Client as HttpClient;
use crate::model::{CompletionRequest, CompletionResponse};

pub struct ClaudeClient {
    pub api_key: String,
    pub client: HttpClient,
    pub base_url: String,
}

impl ClaudeClient {
    pub fn new(api_key: String, url: Option<String>, proxy: Option<bool>) -> Self {
        let base_url = url.unwrap_or("https://api.anthropic.com/v1/messages".to_string());
        let proxy = proxy.unwrap_or(false);
        let client = if proxy {
            HttpClient::new()
        } else {
            HttpClient::builder()
                .no_proxy()
                .build()
                .unwrap_or_else(|_| HttpClient::new())
        };
        Self { api_key, client, base_url }
    }
}

#[async_trait]
impl super::super::ChatClient for ClaudeClient {
    async fn complete(&self, request: CompletionRequest) -> Result<CompletionResponse> {
        let anthropic_req = serde_json::json!({
            "model": request.model,
            "messages": request.messages.iter().map(|m| serde_json::json!({
                "role": m.role,
                "content": m.content
            })).collect::<Vec<_>>(),
            "temperature": request.temperature.unwrap_or(0.7),
        });
        let response = self.client
            .post(&self.base_url)
            .header("x-api-key", &self.api_key)
            .header("anthropic-version", "2023-06-01")
            .header("Content-Type", "application/json")
            .json(&anthropic_req)
            .send()
            .await?;
        if !response.status().is_success() {
            let error_text = response.text().await?;
            println!("Claude API error: {}", error_text);
            return Err(anyhow::anyhow!("Claude API Error: {}", error_text));
        }
        let text_data = response.text().await?;
        println!("Claude response: {}", text_data);
        let completion: CompletionResponse = serde_json::from_str(&text_data)
            .map_err(anyhow::Error::from)?;
        Ok(completion)
    }
} 