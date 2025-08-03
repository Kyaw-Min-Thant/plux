use anyhow::Result;
use async_trait::async_trait;
use reqwest::Client as HttpClient;

use super::model::{CompletionRequest, CompletionResponse, Tool};

#[async_trait]
pub trait ChatClient: Send + Sync {
    async fn complete(&self, request: CompletionRequest) -> Result<CompletionResponse>;
    
    // Transform tools to client-specific format
    fn transform_tools(&self, tools: &[Tool]) -> Vec<Tool> {
        tools.to_vec() // Default: no transformation
    }
}

pub struct OpenAIClient {
    api_key: String,
    client: HttpClient,
    base_url: String,
}

impl OpenAIClient {
    pub fn new(api_key: String, url: Option<String>, proxy: Option<bool>) -> Self {
        let base_url = url.unwrap_or("https://api.openai.com/v1/chat/completions".to_string());
        let proxy = proxy.unwrap_or(false);
        let client = if proxy {
            HttpClient::new()
        } else {
            HttpClient::builder()
                .no_proxy()
                .build()
                .unwrap_or_else(|_| HttpClient::new())
        };

        Self {
            api_key,
            client,
            base_url,
        }
    }
}

#[async_trait]
impl ChatClient for OpenAIClient {
    async fn complete(&self, request: CompletionRequest) -> Result<CompletionResponse> {
        let response = self
            .client
            .post(&self.base_url)
            .header("Authorization", format!("Bearer {}", self.api_key))
            .header("Content-Type", "application/json")
            .json(&request)
            .send()
            .await?;

        if !response.status().is_success() {
            let error_text = response.text().await?;
            println!("API error: {}", error_text);
            return Err(anyhow::anyhow!("API Error: {}", error_text));
        }
        let text_data = response.text().await?;
        println!("Received response: {}", text_data);
        let completion: CompletionResponse = serde_json::from_str(&text_data)
            .map_err(anyhow::Error::from)
            .unwrap();
        Ok(completion)
    }
    
    fn transform_tools(&self, tools: &[Tool]) -> Vec<Tool> {
        tools.iter().map(|tool| {
            // Convert from OpenAI format to Gemini format
            if let (Some(name), Some(description), Some(parameters)) = 
                (&tool.name, &tool.description, &tool.parameters) {
                Tool::gemini_format(name.clone(), description.clone(), parameters.clone())
            } else {
                (*tool).clone() // Already in correct format or malformed
            }
        }).collect()
    }
}

pub struct GeminiClient {
    api_key: String,
    client: HttpClient,
    base_url: String,
}

impl GeminiClient {
    pub fn new(api_key: String, url: Option<String>, proxy: Option<bool>) -> Self {
        let base_url = url.unwrap_or("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions".to_string());
        let proxy = proxy.unwrap_or(false);
        let client = if proxy {
            HttpClient::builder()
                .timeout(std::time::Duration::from_secs(60))
                .build()
                .unwrap_or_else(|_| HttpClient::new())
        } else {
            HttpClient::builder()
                .no_proxy()
                .timeout(std::time::Duration::from_secs(60))
                .build()
                .unwrap_or_else(|_| HttpClient::new())
        };

        Self {
            api_key,
            client,
            base_url,
        }
    }
}

#[async_trait]
impl ChatClient for GeminiClient {
    async fn complete(&self, request: CompletionRequest) -> Result<CompletionResponse> {
        // Transform tools to Gemini format
        let mut gemini_request = request;
        if let Some(tools) = &gemini_request.tools {
            let transformed_tools = self.transform_tools(tools);
            gemini_request.tools = Some(transformed_tools);
        }
        
        println!("Sending request to: {}", self.base_url);
        println!("API key length: {}", self.api_key.len());
        println!("Request payload: {}", serde_json::to_string_pretty(&gemini_request).unwrap_or_default());
        
        let response = self
            .client
            .post(&self.base_url)
            .header("Authorization", format!("Bearer {}", self.api_key))
            .header("Content-Type", "application/json")
            .json(&gemini_request)
            .send()
            .await
            .map_err(|e| {
                println!("Network error: {:?}", e);
                e
            })?;

        if !response.status().is_success() {
            let error_text = response.text().await?;
            println!("API error: {}", error_text);
            return Err(anyhow::anyhow!("API Error: {}", error_text));
        }
        let text_data = response.text().await?;
        println!("Received response: {}", text_data);
        let completion: CompletionResponse = serde_json::from_str(&text_data)
            .map_err(anyhow::Error::from)
            .unwrap();
        Ok(completion)
    }
    
    fn transform_tools(&self, tools: &[Tool]) -> Vec<Tool> {
        tools.iter().map(|tool| {
            // Convert from OpenAI format to Gemini format
            if let (Some(name), Some(description), Some(parameters)) = 
                (&tool.name, &tool.description, &tool.parameters) {
                Tool::gemini_format(name.clone(), description.clone(), parameters.clone())
            } else {
                (*tool).clone() // Already in correct format or malformed
            }
        }).collect()
    }
}
