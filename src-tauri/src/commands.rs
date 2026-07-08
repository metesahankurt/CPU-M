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

#[tauri::command]
pub async fn get_system_info() -> Result<crate::models::system::SystemInfo, String> {
    blocking(crate::services::system::collect).await
}

#[tauri::command]
pub async fn get_cpu_static() -> Result<crate::models::cpu::CpuStaticInfo, String> {
    blocking(crate::services::cpu::collect_static).await
}

#[tauri::command]
pub async fn get_cpu_dynamic() -> Result<crate::models::cpu::CpuDynamicInfo, String> {
    blocking(crate::services::cpu::collect_dynamic).await
}

#[tauri::command]
pub async fn get_memory_info() -> Result<crate::models::memory::MemoryInfo, String> {
    blocking(crate::services::memory::collect).await
}
