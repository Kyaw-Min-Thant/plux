use anyhow::Result;
use async_trait::async_trait;
use reqwest::Client as HttpClient;
use futures_util::StreamExt;
use serde_json::Value;

use crate::mcp_client::model::{CompletionRequest, CompletionResponse, Tool};
use super::common::{ChatClient, StreamingChatClient};

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
        // Add stream parameter to request
        let mut request_value = serde_json::to_value(&request)?;
        if let Some(obj) = request_value.as_object_mut() {
            obj.insert("stream".to_string(), Value::Bool(true));
        }

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
            return Err(anyhow::anyhow!("API Error: {}", error_text));
        }

        let mut stream = response.bytes_stream();
        let mut complete_content = String::new();
        let mut buffer = String::new();

        while let Some(chunk_result) = stream.next().await {
            let chunk = chunk_result?;
            let chunk_str = String::from_utf8_lossy(&chunk);
            println!("🔍 Raw chunk: {:?}", chunk_str);
            buffer.push_str(&chunk_str);

            // Process complete lines
            while let Some(line_end) = buffer.find('\n') {
                let line = buffer[..line_end].trim().to_string();
                buffer = buffer[line_end + 1..].to_string();

                if line.starts_with("data: ") {
                    let data = &line[6..];
                    println!("🔍 Processing data: {}", data);
                    if data == "[DONE]" {
                        println!("🏁 Stream finished");
                        break;
                    }
                    
                    if let Ok(json) = serde_json::from_str::<Value>(data) {
                        println!("✅ JSON parsed successfully");
                        if let Some(choices) = json.get("choices").and_then(|c| c.as_array()) {
                            println!("🔍 Found {} choices", choices.len());
                            if let Some(choice) = choices.first() {
                                if let Some(delta) = choice.get("delta") {
                                    println!("🔍 Delta: {}", serde_json::to_string(delta).unwrap_or_default());
                                    
                                    // Try to extract content from regular content field
                                    let mut content_found = false;
                                    if let Some(content) = delta.get("content").and_then(|c| c.as_str()) {
                                        if !content.is_empty() {
                                            println!("📝 Content extracted: \'{}\'", content);
                                            complete_content.push_str(content);
                                            callback(content.to_string());
                                            content_found = true;
                                        }
                                    }
                                    
                                    // If no regular content, try to extract from tool_calls (for Ollama)
                                    if !content_found {
                                        if let Some(tool_calls) = delta.get("tool_calls").and_then(|tc| tc.as_array()) {
                                            for tool_call in tool_calls {
                                                if let Some(function) = tool_call.get("function") {
                                                    if let Some(arguments) = function.get("arguments").and_then(|a| a.as_str()) {
                                                        println!("🔧 Tool call arguments: {}", arguments);
                                                        // Try to parse the arguments as JSON and extract any text values
                                                        if let Ok(args_json) = serde_json::from_str::<Value>(arguments) {
                                                            let mut extracted_content = Vec::new();
                                                            
                                                            // Check common field names that might contain the actual content
                                                            let possible_content_fields = ["message", "text", "content", "story", "response", "y", "x"];
                                                            
                                                            for field_name in &possible_content_fields {
                                                                if let Some(value) = args_json.get(field_name).and_then(|v| v.as_str()) {
                                                                    if !value.is_empty() {
                                                                        extracted_content.push(format!("{}: {}", field_name, value));
                                                                    }
                                                                }
                                                            }
                                                            
                                                            if !extracted_content.is_empty() {
                                                                let content_str = extracted_content.join(", ");
                                                                println!("📝 Content from tool_call: \'{}\'", content_str);
                                                                complete_content.push_str(&content_str);
                                                                callback(content_str);
                                                                content_found = true;
                                                            } else {
                                                                // If no specific fields found, just show the raw arguments
                                                                println!("📝 Raw tool arguments as content: \'{}\'", arguments);
                                                                complete_content.push_str(arguments);
                                                                callback(arguments.to_string());
                                                                content_found = true;
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                    
                                    if !content_found {
                                        println!("❌ No content found in delta (neither content nor tool_calls)");
                                    }
                                } else {
                                    println!("❌ No delta found");
                                }
                            } else {
                                println!("❌ No first choice");
                            }
                        } else {
                            println!("❌ No choices array");
                        }
                    } else {
                        println!("❌ JSON parse failed for: {}", data);
                    }
                }
            }
        }

        // Create a synthetic response  
        use crate::mcp_client::model::{Choice, Message};
        println!("🏁 Complete content: \'{}\'", complete_content);
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
