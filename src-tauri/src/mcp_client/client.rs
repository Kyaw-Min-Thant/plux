use anyhow::Result;
use async_trait::async_trait;
use reqwest::Client as HttpClient;
use futures_util::StreamExt;
use serde_json::Value;

use super::model::{CompletionRequest, CompletionResponse, Tool};

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


#[async_trait]
impl StreamingChatClient for OpenAIClient {
    async fn complete_stream(
        &self, 
        request: CompletionRequest, 
        callback: Box<dyn Fn(String) + Send + Sync>
    ) -> Result<CompletionResponse> {
        println!("🚀 OpenAI complete_stream called");
        println!("📍 Base URL: {}", self.base_url);
        println!("🔑 API key length: {}", self.api_key.len());
        
        // Add stream parameter to request
        let mut request_value = serde_json::to_value(&request)?;
        if let Some(obj) = request_value.as_object_mut() {
            obj.insert("stream".to_string(), Value::Bool(true));
        }
        
        println!("📤 Request payload: {}", serde_json::to_string_pretty(&request_value).unwrap_or_default());

        let response = self
            .client
            .post(&self.base_url)
            .header("Authorization", format!("Bearer {}", self.api_key))
            .header("Content-Type", "application/json")
            .json(&request_value)
            .send()
            .await?;

        if !response.status().is_success() {
            let error_text = response.text().await?;
            println!("API error: {}", error_text);
            return Err(anyhow::anyhow!("API Error: {}", error_text));
        }

        println!("✅ HTTP response status: {}", response.status());
        println!("🌊 Starting to read stream...");
        let mut stream = response.bytes_stream();
        let mut complete_content = String::new();
        let mut buffer = String::new();
        let mut chunk_count = 0;

        while let Some(chunk_result) = stream.next().await {
            chunk_count += 1;
            println!("📦 Received chunk #{}", chunk_count);
            let chunk = chunk_result?;
            let chunk_str = String::from_utf8_lossy(&chunk);
            println!("📄 Raw chunk: {:?}", chunk_str);
            buffer.push_str(&chunk_str);

            // Process complete lines
            while let Some(line_end) = buffer.find('\n') {
                let line = buffer[..line_end].trim().to_string();
                buffer = buffer[line_end + 1..].to_string();
                
                println!("📝 Processing line: {:?}", line);

                if line.starts_with("data: ") {
                    let data = &line[6..];
                    println!("🔍 Data line: {}", data);
                    if data == "[DONE]" {
                        println!("🏁 Stream finished");
                        break;
                    }
                    
                    if let Ok(json) = serde_json::from_str::<Value>(data) {
                        println!("✅ Parsed JSON: {}", json);
                        if let Some(choices) = json.get("choices").and_then(|c| c.as_array()) {
                            if let Some(choice) = choices.first() {
                                if let Some(delta) = choice.get("delta") {
                                    if let Some(content) = delta.get("content").and_then(|c| c.as_str()) {
                                        println!("💬 Streaming content: {:?}", content);
                                        complete_content.push_str(content);
                                        callback(content.to_string());
                                    }
                                }
                            }
                        }
                    } else {
                        println!("❌ Failed to parse JSON: {}", data);
                    }
                }
            }
        }

        // Create a synthetic response
        use super::model::{Choice, Message};
        let response = CompletionResponse {
            id: "stream_response".to_string(),
            object: "chat.completion".to_string(),
            created: chrono::Utc::now().timestamp() as u64,
            model: request.model.clone(),
            choices: vec![Choice {
                index: 0,
                message: Message {
                    role: "assistant".to_string(),
                    content: Some(complete_content),
                    tool_calls: None,
                },
                finish_reason: "stop".to_string(),
            }],
        };

        Ok(response)
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



#[async_trait]
impl StreamingChatClient for GeminiClient {
    async fn complete_stream(
        &self, 
        request: CompletionRequest, 
        callback: Box<dyn Fn(String) + Send + Sync>
    ) -> Result<CompletionResponse> {
        // Transform tools to Gemini format
        let mut request = request;
        if let Some(tools) = &request.tools {
            let transformed_tools = self.transform_tools(tools);
            request.tools = Some(transformed_tools);
        }
        
        // Add stream parameter to request
        let mut request_value = serde_json::to_value(&request)?;
        if let Some(obj) = request_value.as_object_mut() {
            obj.insert("stream".to_string(), Value::Bool(true));
        }
        
        println!("Sending Gemini streaming request to: {}", self.base_url);
        println!("Gemini API key length: {}", self.api_key.len());
        println!("Gemini Request payload: {}", serde_json::to_string_pretty(&request_value).unwrap_or_default());
        
        let response = self
            .client
            .post(&self.base_url)
            .header("Authorization", format!("Bearer {}", self.api_key))
            .header("Content-Type", "application/json")
            .json(&request_value)
            .send()
            .await
            .map_err(|e| {
                println!("Gemini Network error: {:?}", e);
                e
            })?;

        if !response.status().is_success() {
            let error_text = response.text().await?;
            println!("Gemini API error: {}", error_text);
            return Err(anyhow::anyhow!("Gemini API Error: {}", error_text));
        }

        let mut stream = response.bytes_stream();
        let mut complete_content = String::new();
        let mut buffer = String::new();

        while let Some(chunk_result) = stream.next().await {
            let chunk = chunk_result?;
            let chunk_str = String::from_utf8_lossy(&chunk);
            buffer.push_str(&chunk_str);

            // Process complete lines
            while let Some(line_end) = buffer.find('\n') {
                let line = buffer[..line_end].trim().to_string();
                buffer = buffer[line_end + 1..].to_string();

                if line.starts_with("data: ") {
                    let data = &line[6..];
                    if data == "[DONE]" {
                        break;
                    }
                    
                    if let Ok(json) = serde_json::from_str::<Value>(data) {
                        if let Some(choices) = json.get("choices").and_then(|c| c.as_array()) {
                            if let Some(choice) = choices.first() {
                                if let Some(delta) = choice.get("delta") {
                                    if let Some(content) = delta.get("content").and_then(|c| c.as_str()) {
                                        complete_content.push_str(content);
                                        callback(content.to_string());
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        // Create a synthetic response
        use super::model::{Choice, Message};
        let response = CompletionResponse {
            id: "gemini_stream_response".to_string(),
            object: "chat.completion".to_string(),
            created: chrono::Utc::now().timestamp() as u64,
            model: request.model.clone(),
            choices: vec![Choice {
                index: 0,
                message: Message {
                    role: "assistant".to_string(),
                    content: Some(complete_content),
                    tool_calls: None,
                },
                finish_reason: "stop".to_string(),
            }],
        };

        Ok(response)
    }
}
