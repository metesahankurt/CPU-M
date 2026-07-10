use serde::Serialize;

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PackageManagerStatus {
    /// "winget" | "Homebrew"; None on unsupported platforms.
    pub manager: Option<String>,
    pub available: bool,
    pub version: Option<String>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AppInstallResult {
    pub package_id: String,
    /// "installed" | "already_installed" | "failed"
    pub status: String,
    pub exit_code: Option<i32>,
    /// Last meaningful line of package manager output, for failure diagnostics.
    pub message: Option<String>,
}
