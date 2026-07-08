#[cfg(target_os = "macos")]
mod macos;
#[cfg(windows)]
mod windows;

use crate::models::display::DisplayInfo;

pub fn collect(app: &tauri::AppHandle) -> Vec<DisplayInfo> {
    #[cfg(target_os = "macos")]
    {
        let _ = app;
        macos::collect()
    }
    #[cfg(windows)]
    {
        windows::collect(app)
    }
    #[cfg(not(any(target_os = "macos", windows)))]
    {
        let _ = app;
        Vec::new()
    }
}
