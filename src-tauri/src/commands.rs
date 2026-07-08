use crate::models::platform::PlatformInfo;
use crate::platform;

/// Long-running collectors run on the blocking pool so the UI thread and the
/// async runtime never stall.
async fn blocking<T, F>(f: F) -> Result<T, String>
where
    T: Send + 'static,
    F: FnOnce() -> T + Send + 'static,
{
    tauri::async_runtime::spawn_blocking(f)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_platform_info() -> Result<PlatformInfo, String> {
    blocking(platform::detect).await
}
