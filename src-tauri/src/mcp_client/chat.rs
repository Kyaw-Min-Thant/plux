use std::sync::Arc;

use anyhow::Result;
use serde_json;

use super::{
    client::common::ChatClient,
    model::{CompletionRequest, Message, Tool, ToolFunction},
    tool::{ToolSet},
};

pub struct ChatSession {
    client: Arc<dyn ChatClient>,
    tool_set: ToolSet,
    model: String,
    messages: Vec<Message>,
}

impl ChatSession {
    pub fn new(client: Arc<dyn ChatClient>, tool_set: ToolSet, model: String) -> Self {
        Self {
            client,
            tool_set,
            model,
            messages: Vec::new(),
        }
    } 

    pub fn add_system_prompt(&mut self, prompt: impl ToString) {
        self.messages.push(Message::system(prompt));
    }

    pub fn get_tools(&self) -> Vec<Arc<dyn super::tool::Tool>> {
        self.tool_set.tools()
    }

    pub fn get_model(&self) -> String {
        self.model.clone()
    }

    pub fn get_messages(&self) -> &Vec<Message> {
        &self.messages
    }

    pub fn get_tool_set(&self) -> &ToolSet {
        &self.tool_set
    }

    pub fn add_user_message(&mut self, content: &str) {
        self.messages.push(Message::user(content));
    }

    pub async fn analyze_tool_call(&mut self, response: &Message) {
        let mut tool_calls_func = Vec::new();
        if let Some(tool_calls) = response.tool_calls.as_ref() {
            for tool_call in tool_calls {
                if tool_call._type == "function" {
                    tool_calls_func.push(tool_call.function.clone());
                }
            }
        } else {
            // check if message contains tool call
            if let Some(content) = &response.content {
                if content.contains("Tool:") {
                    let lines: Vec<&str> = content.split('\n').collect();
                    // simple parse tool call
                    let mut tool_name = None;
                    let mut args_text = Vec::new();
                    let mut parsing_args = false;

                    for line in lines {
                        if line.starts_with("Tool:") {
                            tool_name = line.strip_prefix("Tool:").map(|s| s.trim().to_string());
                            parsing_args = false;
                        } else if line.starts_with("Inputs:") {
                            parsing_args = true;
                        } else if parsing_args {
                            args_text.push(line.trim());
                        }
                    }
                    if let Some(name) = tool_name {
                        tool_calls_func.push(ToolFunction {
                            name,
                            arguments: args_text.join("\n"),
                        });
                    }
                }
            }
        }
        // call tool
        for tool_call in tool_calls_func {

            let tool = self.tool_set.get_tool(&tool_call.name);
            if let Some(tool) = tool {
                // call tool
                let args = serde_json::from_str::<serde_json::Value>(&tool_call.arguments)
                    .unwrap_or_default();
                println!("Calling tool: {} with args: {}", tool_call.name, args);
                match tool.call(args).await {
                    Ok(result) => {
                        println!("Tool call result: {:?}", result);
                        if result.is_error.is_some_and(|b| b) {
                            self.messages
                                .push(Message::user("tool call failed, mcp call error"));
                        } else {
                            if result.content.is_empty() {
                                println!("Tool result has empty content");
                            }
                            result.content.iter().for_each(|content| {
                                println!("Processing content: {:?}", content);
                                
                                // Extract text from different possible content formats
                                let text_content = if let Some(content_text) = content.as_text() {
                                    Some(content_text.text.clone())
                                } else {
                                    // Try to extract text directly from debug format if as_text() fails
                                    let debug_str = format!("{:?}", content);
                                    if debug_str.contains("text: \"") {
                                        debug_str
                                            .split("text: \"")
                                            .nth(1)
                                            .and_then(|s| s.split("\"").next())
                                            .map(|s| s.replace("\\n", "\n"))
                                    } else {
                                        None
                                    }
                                };
                                
                                if let Some(text) = text_content {
                                    println!("Extracted text: {}", text);
                                    // Try to parse as JSON, but fallback to plain text
                                    let result_text = if let Ok(json_val) = serde_json::from_str::<serde_json::Value>(&text) {
                                        serde_json::to_string_pretty(&json_val).unwrap_or(text.clone())
                                    } else {
                                        text.clone()
                                    };
                                    
                                    println!("call tool result: {}", result_text);
                                    self.messages.push(Message::user(format!(
                                        "Tool result: {}",
                                        result_text
                                    )));
                                } else {
                                    println!("Could not extract text from content: {:?}", content);
                                    // Fallback: use the debug representation
                                    let fallback_text = format!("{:?}", content);
                                    self.messages.push(Message::user(format!(
                                        "Tool result (raw): {}",
                                        fallback_text
                                    )));
                                }
                            });
                        }
                    }
                    Err(e) => {
                        println!("tool call failed: {}", e);
                        self.messages
                            .push(Message::user(format!("tool call failed: {}", e)));
                    }
                }
            } else {
                println!("tool not found: {}", tool_call.name);
            }
        }
    }

    pub async fn next_message(
        &mut self,
        input: &str,
        support_tool: bool,
    ) -> Result<(Message, Vec<Message>)> {
        self.messages.push(Message::user(input));
        let tool_definitions = if support_tool {
            // prepare tool list
            let tools = self.tool_set.tools();
            if !tools.is_empty() {
                Some(
                    tools
                        .iter()
                        .map(|tool| Tool::openai_format(
                            tool.name(),
                            tool.description(),
                            tool.parameters(),
                        ))
                        .collect(),
                )
            } else {
                None
            }
        } else {
            None
        };

        // create request
        let request = CompletionRequest {
            model: self.model.clone(),
            messages: self.messages.clone(),
            temperature: Some(0.7),
            tools: tool_definitions,
        };

        // send request
        let response = self.client.complete(request).await?;
        // get choice
        let choice = response
            .choices
            .first()
            .ok_or_else(|| anyhow::anyhow!("No choice in response"))?;
        
        self.messages.push(choice.message.clone());

        let original_message_len = self.messages.len();
        // analyze tool call
        self.analyze_tool_call(&choice.message).await;

        let tool_messages = self.messages.split_off(original_message_len);

        Ok((choice.message.clone(), tool_messages))
    }
}
