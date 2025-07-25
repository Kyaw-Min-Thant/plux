use glob::glob;
use std::fs;

#[tauri::command]
pub async fn load_manifests() -> Result<serde_json::Value, String> {
    async {
        let home = dirs::home_dir().ok_or_else(|| anyhow::anyhow!("Cannot find home directory"))?;
        let base_path = home.join(".config/finder/dxt");
        let pattern = base_path.join("*/*/manifest.json");

        let mut manifests = serde_json::Map::new();

        if base_path.exists() {
            for entry in glob(pattern.to_str().unwrap())? {
                let path = entry?;
                let parent_dir = path.parent().ok_or_else(|| anyhow::anyhow!("Invalid path"))?;
                let repo = parent_dir
                    .file_name()
                    .ok_or_else(|| anyhow::anyhow!("Invalid path"))?
                    .to_string_lossy()
                    .to_string();

                let user_dir = parent_dir
                    .parent()
                    .ok_or_else(|| anyhow::anyhow!("Invalid path"))?;
                let user = user_dir
                    .file_name()
                    .ok_or_else(|| anyhow::anyhow!("Invalid path"))?
                    .to_string_lossy()
                    .to_string();

                let content = tokio::fs::read_to_string(&path).await?;
                let json: serde_json::Value = serde_json::from_str(&content)?;
                manifests.insert(format!("{}/{}", user, repo), json);
            }
        }

        Ok(serde_json::Value::Array(manifests.into_values().collect()))
    }
    .await
    .map_err(|e: anyhow::Error| e.to_string())
}

#[tauri::command]
pub async fn load_manifest(user: String, repo: String) -> Result<serde_json::Value, String> {
    async {
        let home = dirs::home_dir().ok_or_else(|| anyhow::anyhow!("Cannot find home directory"))?;
        let manifest_path = home
            .join(".config/finder/dxt")
            .join(&user)
            .join(&repo)
            .join("manifest.json");

        if !manifest_path.exists() {
            return Err(anyhow::anyhow!("Manifest not found for {}/{}", user, repo));
        }

        let content = tokio::fs::read_to_string(&manifest_path).await?;
        let json: serde_json::Value = serde_json::from_str(&content)?;
        Ok(json)
    }
    .await
    .map_err(|e: anyhow::Error| e.to_string())
}


#[tauri::command]
pub async fn fetch_and_save_manifest(user: &str, repo: &str) -> Result<(), String> {

    async {
        let home = dirs::home_dir().ok_or_else(|| anyhow::anyhow!("Cannot find home directory"))?;
        let dxt_path = home.join(".config/finder/dxt").join(user).join(repo);

        // Create the directory if it doesn't exist
        if !dxt_path.exists() {
            fs::create_dir_all(&dxt_path)?;
        }

        // Construct the GitHub URL
        let url = format!(
            "https://raw.githubusercontent.com/awesome-claude-dxt/servers/main/{}/{}/manifest.json",
            user, repo
        );

        // Download the manifest.json
        let response = reqwest::get(&url).await?;
        let content = response.text().await?;

        // Save the file
        let manifest_path = dxt_path.join("manifest.json");
        tokio::fs::write(manifest_path, content).await?;

        Ok(())
    }
    .await
    .map_err(|e: anyhow::Error| e.to_string())
}
