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

#[tauri::command]
pub async fn get_gpu_info() -> Result<Vec<crate::models::gpu::GpuInfo>, String> {
    blocking(crate::services::gpu::collect).await
}

#[tauri::command]
pub async fn get_storage_info() -> Result<crate::models::storage::StorageInfo, String> {
    blocking(crate::services::storage::collect).await
}

#[tauri::command]
pub async fn get_display_info(
    app: tauri::AppHandle,
) -> Result<Vec<crate::models::display::DisplayInfo>, String> {
    blocking(move || crate::services::display::collect(&app)).await
}

#[tauri::command]
pub async fn get_network_info() -> Result<crate::models::network::NetworkInfo, String> {
    blocking(crate::services::network::collect).await
}

#[tauri::command]
pub async fn get_battery_info() -> Result<crate::models::battery::BatteryInfo, String> {
    blocking(crate::services::battery::collect).await
}

#[tauri::command]
pub async fn get_mainboard_info() -> Result<crate::models::mainboard::MainboardInfo, String> {
    blocking(crate::services::mainboard::collect).await
}

#[tauri::command]
pub async fn get_security_info() -> Result<crate::models::security::SecurityInfo, String> {
    blocking(crate::services::security::collect).await
}

#[tauri::command]
pub async fn get_license_info() -> Result<crate::models::license::LicenseInfo, String> {
    blocking(crate::services::license::collect).await
}

#[tauri::command]
pub async fn get_sensors_info() -> Result<crate::models::sensors::SensorsInfo, String> {
    blocking(crate::services::sensors::collect).await
}

#[tauri::command]
pub async fn generate_system_report(
    app: tauri::AppHandle,
    mask_sensitive: bool,
) -> Result<crate::models::report::SystemReport, String> {
    blocking(move || crate::services::report::generate(&app, mask_sensitive)).await
}

#[tauri::command]
pub async fn write_report_file(path: String, contents: String) -> Result<(), String> {
    blocking(move || crate::services::report::write_file(&path, &contents)).await?
}
