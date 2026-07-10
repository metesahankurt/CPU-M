#[cfg(target_os = "macos")]
mod macos;
#[cfg(windows)]
mod windows;

use crate::models::apps::{AppInstallResult, PackageManagerStatus};

pub fn status() -> PackageManagerStatus {
    #[cfg(windows)]
    {
        windows::status()
    }
    #[cfg(target_os = "macos")]
    {
        macos::status()
    }
    #[cfg(not(any(target_os = "macos", windows)))]
    {
        PackageManagerStatus {
            manager: None,
            available: false,
            version: None,
        }
    }
}

/// Which of the given package ids are already installed.
pub fn installed_ids(ids: &[String]) -> Vec<String> {
    #[cfg(windows)]
    {
        windows::installed_ids(ids)
    }
    #[cfg(target_os = "macos")]
    {
        macos::installed_ids(ids)
    }
    #[cfg(not(any(target_os = "macos", windows)))]
    {
        let _ = ids;
        Vec::new()
    }
}

#[cfg(test)]
mod tests {
    #[test]
    fn status_reports_manager() {
        let status = super::status();
        let json = serde_json::to_string_pretty(&status).expect("serializes");
        println!("{json}");
    }

    #[test]
    fn installed_ids_matches_exact_tokens() {
        let ids = vec![
            "google-chrome".to_string(),
            "definitely-not-a-real-cask-xyz".to_string(),
        ];
        let installed = super::installed_ids(&ids);
        println!("installed: {installed:?}");
        assert!(!installed.contains(&"definitely-not-a-real-cask-xyz".to_string()));
    }

    #[test]
    fn install_rejects_invalid_id() {
        let result = super::install("evil; rm -rf /", None);
        assert_eq!(result.status, "failed");
    }
}

pub fn install(package_id: &str, source: Option<&str>) -> AppInstallResult {
    #[cfg(windows)]
    {
        windows::install(package_id, source)
    }
    #[cfg(target_os = "macos")]
    {
        let _ = source;
        macos::install(package_id)
    }
    #[cfg(not(any(target_os = "macos", windows)))]
    {
        let _ = source;
        AppInstallResult {
            package_id: package_id.to_string(),
            status: "failed".to_string(),
            exit_code: None,
            message: Some("no package manager on this platform".to_string()),
        }
    }
}
