use std::fs;
use std::path::Path;
use serde::{Deserialize, Serialize};
use anyhow::Result;

#[derive(Debug, Serialize, Deserialize)]
pub struct FileEntry {
    pub name: String,
    pub path: String,
    pub is_directory: bool,
    pub size: Option<u64>,
    pub extension: Option<String>,
}

#[tauri::command]
pub async fn read_directory(path: String) -> Result<Vec<FileEntry>, String> {
    let expanded_path = if path.starts_with("~/") {
        let home = dirs::home_dir()
            .ok_or_else(|| "Cannot find home directory".to_string())?;
        home.join(&path[2..])
    } else {
        Path::new(&path).to_path_buf()
    };
    
    if !expanded_path.exists() || !expanded_path.is_dir() {
        return Err("Directory does not exist".to_string());
    }

    let mut entries = Vec::new();
    
    match fs::read_dir(&expanded_path) {
        Ok(dir_entries) => {
            for entry in dir_entries {
                match entry {
                    Ok(entry) => {
                        let path = entry.path();
                        let name = path.file_name()
                            .and_then(|n| n.to_str())
                            .unwrap_or("Unknown")
                            .to_string();
                        
                        let is_directory = path.is_dir();
                        let size = if is_directory {
                            None
                        } else {
                            fs::metadata(&path).ok().map(|m| m.len())
                        };
                        
                        let extension = if is_directory {
                            None
                        } else {
                            path.extension()
                                .and_then(|ext| ext.to_str())
                                .map(|s| s.to_string())
                        };

                        entries.push(FileEntry {
                            name,
                            path: path.to_string_lossy().to_string(),
                            is_directory,
                            size,
                            extension,
                        });
                    }
                    Err(_) => continue,
                }
            }
        }
        Err(e) => return Err(format!("Failed to read directory: {}", e)),
    }
    
    // Sort directories first, then files
    entries.sort_by(|a, b| {
        match (a.is_directory, b.is_directory) {
            (true, false) => std::cmp::Ordering::Less,
            (false, true) => std::cmp::Ordering::Greater,
            _ => a.name.to_lowercase().cmp(&b.name.to_lowercase()),
        }
    });
    
    Ok(entries)
}

#[tauri::command]
pub async fn get_default_directories() -> Result<Vec<String>, String> {
    let home = dirs::home_dir()
        .ok_or_else(|| "Cannot find home directory".to_string())?;
    
    let default_dirs = vec![
        home.to_string_lossy().to_string(),
        home.join("Documents").to_string_lossy().to_string(),
        home.join("Downloads").to_string_lossy().to_string(),
        home.join("Pictures").to_string_lossy().to_string(),
        home.join("Movies").to_string_lossy().to_string(),
        home.join("Music").to_string_lossy().to_string(),
    ];
    
    Ok(default_dirs)
}

#[tauri::command]
pub async fn calculate_file_tokens(file_path: String) -> Result<Option<u32>, String> {
    let path = Path::new(&file_path);
    
    if !path.exists() || path.is_dir() {
        return Ok(None);
    }
    
    let extension = path.extension()
        .and_then(|ext| ext.to_str())
        .map(|s| s.to_lowercase());
    
    // Only calculate tokens for text, image, and audio files
    let is_supported = match extension.as_deref() {
        Some("txt") | Some("md") | Some("rs") | Some("js") | Some("ts") | Some("tsx") | 
        Some("jsx") | Some("py") | Some("java") | Some("cpp") | Some("c") | Some("h") |
        Some("css") | Some("html") | Some("json") | Some("xml") | Some("yaml") |
        Some("yml") | Some("toml") | Some("cfg") | Some("ini") | Some("sh") |
        Some("png") | Some("jpg") | Some("jpeg") | Some("gif") | Some("webp") |
        Some("mp3") | Some("wav") | Some("flac") | Some("ogg") => true,
        _ => false,
    };
    
    if !is_supported {
        return Ok(None);
    }
    
    // For now, return a simple estimation based on file size
    // In a real implementation, you would use tiktoken-rs here
    match fs::metadata(path) {
        Ok(metadata) => {
            let size = metadata.len();
            // Rough estimation: ~4 characters per token for text files
            let estimated_tokens = match extension.as_deref() {
                Some("png") | Some("jpg") | Some("jpeg") | Some("gif") | Some("webp") => {
                    // Image tokens estimation (very rough)
                    (size / 1000) as u32 + 100
                }
                Some("mp3") | Some("wav") | Some("flac") | Some("ogg") => {
                    // Audio tokens estimation (very rough)
                    (size / 10000) as u32 + 50
                }
                _ => {
                    // Text files
                    (size / 4) as u32
                }
            };
            Ok(Some(estimated_tokens))
        }
        Err(_) => Ok(None),
    }
}