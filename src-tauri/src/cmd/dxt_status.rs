#[tauri::command]
pub async fn read_dxt_setting(user: String, repo: String) -> Result<serde_json::Value, String> {
    async {
        let home = dirs::home_dir().ok_or_else(|| anyhow::anyhow!("Cannot find home directory"))?;
        let settings_dir = home.join(".config/finder/dxt-settings");
        tokio::fs::create_dir_all(&settings_dir).await?;
        let settings_path = settings_dir.join(format!("{}.{}.json", &user, &repo));

        if !settings_path.exists() {
            return Err(anyhow::anyhow!("Manifest not found for {}.{}", user, repo));
        }

        let content = tokio::fs::read_to_string(&settings_path).await?;
        let json: serde_json::Value = serde_json::from_str(&content)?;
        Ok(json)
    }
    .await
    .map_err(|e: anyhow::Error| e.to_string())
}

#[tauri::command]
pub async fn save_dxt_setting(user: String, repo: String, content: serde_json::Value) -> Result<(), String> {
    async {
        let home = dirs::home_dir().ok_or_else(|| anyhow::anyhow!("Cannot find home directory"))?;
        let settings_dir = home.join(".config/finder/dxt-settings");
        let settings_path = settings_dir.join(format!("{}.{}.json", &user, &repo));
        let content_string = serde_json::to_string_pretty(&content)?;
        tokio::fs::write(settings_path, content_string).await?;
        Ok(())
    }
    .await
    .map_err(|e: anyhow::Error| e.to_string())
}
