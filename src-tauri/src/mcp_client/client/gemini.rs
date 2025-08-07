use anyhow::Result;
use async_trait::async_trait;
use reqwest::Client as HttpClient;
use futures_util::StreamExt;
use serde_json::Value;

use crate::mcp_client::model::{CompletionRequest, CompletionResponse, Tool};
use super::common::{ChatClient, StreamingChatClient};

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
        let mut accumulated_tool_calls = Vec::new();

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
                                    // Handle regular content
                                    let mut content_found = false;
                                    if let Some(content) = delta.get("content").and_then(|c| c.as_str()) {
                                        if !content.is_empty() {
                                            complete_content.push_str(content);
                                            callback(content.to_string());
                                            content_found = true;
                                        }
                                    }
                                    
                                    // Handle tool_calls (accumulate them for later processing)
                                    if !content_found {
                                        if let Some(tool_calls) = delta.get("tool_calls").and_then(|tc| tc.as_array()) {
                                            for (index, tool_call) in tool_calls.iter().enumerate() {
                                                // Ensure we have enough slots in accumulated_tool_calls
                                                while accumulated_tool_calls.len() <= index {
                                                    accumulated_tool_calls.push(serde_json::json!({
                                                        "id": "",
                                                        "type": "function",
                                                        "function": {
                                                            "name": "",
                                                            "arguments": ""
                                                        }
                                                    }));
                                                }
                                                
                                                // Merge tool call data
                                                if let Some(id) = tool_call.get("id").and_then(|v| v.as_str()) {
                                                    accumulated_tool_calls[index]["id"] = Value::String(id.to_string());
                                                }
                                                if let Some(function) = tool_call.get("function") {
                                                    if let Some(name) = function.get("name").and_then(|v| v.as_str()) {
                                                        accumulated_tool_calls[index]["function"]["name"] = Value::String(name.to_string());
                                                    }
                                                    if let Some(arguments) = function.get("arguments").and_then(|v| v.as_str()) {
                                                        let current_args = accumulated_tool_calls[index]["function"]["arguments"]
                                                            .as_str().unwrap_or("");
                                                        accumulated_tool_calls[index]["function"]["arguments"] = 
                                                            Value::String(format!("{}{}", current_args, arguments));
                                                    }
                                                }
                                                
                                                println!("🔧 Gemini: Accumulating tool call [{}]: {:?}", index, accumulated_tool_calls[index]);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        // Create a synthetic response
        use crate::mcp_client::model::{Choice, Message, ToolCall, ToolFunction};
        
        // Convert accumulated tool calls to proper format
        let tool_calls = if !accumulated_tool_calls.is_empty() {
            let converted_tool_calls: Vec<ToolCall> = accumulated_tool_calls
                .into_iter()
                .filter_map(|tc| {
                    let id = tc.get("id")?.as_str().unwrap_or("");
                    let type_str = tc.get("type")?.as_str().unwrap_or("function");
                    let function = tc.get("function")?;
                    let name = function.get("name")?.as_str().unwrap_or("");
                    let arguments = function.get("arguments")?.as_str().unwrap_or("");
                    
                    if !name.is_empty() && !arguments.is_empty() {
                        Some(ToolCall {
                            id: id.to_string(),
                            _type: type_str.to_string(),
                            function: ToolFunction {
                                name: name.to_string(),
                                arguments: arguments.to_string(),
                            },
                        })
                    } else {
                        None
                    }
                })
                .collect();
            
            if !converted_tool_calls.is_empty() {
                println!("🔧 Gemini: Generated {} tool calls", converted_tool_calls.len());
                Some(converted_tool_calls)
            } else {
                None
            }
        } else {
            None
        };
        
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
                    tool_calls,
                },
                finish_reason: "stop".to_string(),
            }],
        };

        Ok(response)
    }
}
