pub mod openai;
pub mod claude;
pub mod gemini;
pub mod openrouter;

pub use openai::OpenAIClient;
pub use claude::ClaudeClient;
pub use gemini::GeminiClient;
pub use openrouter::OpenRouterClient;

#[derive(Debug, Clone)]
pub enum ChatProvider {
    OpenAI,
    Claude,
    Gemini,
    OpenRouter,
}

impl ChatProvider {
    pub fn from_str(s: &str) -> Option<Self> {
        match s.to_lowercase().as_str() {
            "openai" => Some(ChatProvider::OpenAI),
            "claude" => Some(ChatProvider::Claude),
            "gemini" => Some(ChatProvider::Gemini),
            "openrouter" => Some(ChatProvider::OpenRouter),
            _ => None,
        }
    }
} 