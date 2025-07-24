#[tauri::command]
pub fn update_api_keys(deepseek_api_key: String, cohere_api_key: String) {
    std::env::set_var("DEEPSEEK_API_KEY", deepseek_api_key);
    std::env::set_var("COHERE_API_KEY", cohere_api_key);
}
