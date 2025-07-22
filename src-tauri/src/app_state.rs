// Application state
#[derive(Default)]
pub struct AppState {
    pub mcp_clients: std::sync::Arc<tokio::sync::Mutex<std::collections::HashMap<String, rmcp::service::RunningService<rmcp::RoleClient, ()>>>>,
    pub chat_session: std::sync::Arc<tokio::sync::Mutex<Option<crate::chat::ChatSession>>>,
    pub tool_set: std::sync::Arc<tokio::sync::Mutex<crate::tool::ToolSet>>,
}
