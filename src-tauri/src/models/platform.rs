use serde::Serialize;

/// Detected at startup; drives the welcome screen and tells every service
/// which OS-specific collector to use.
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PlatformInfo {
    /// Machine-readable OS id: "macos" | "windows" | "linux" | ...
    pub os: String,
    /// Human-readable OS name, e.g. "macOS" or "Windows".
    pub os_name: String,
    pub os_version: String,
    /// CPU architecture the app runs on, e.g. "aarch64" or "x86_64".
    pub arch: String,
    pub is_apple_silicon: bool,
    /// CPU brand string, e.g. "Apple M3" — shown on the welcome screen.
    pub chip_name: Option<String>,
    pub hostname: Option<String>,
    /// Whether the app itself runs with elevated privileges.
    pub is_elevated: bool,
}
