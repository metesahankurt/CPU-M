use crate::models::apps::{AppInstallResult, PackageManagerStatus};
use std::os::windows::process::CommandExt;
use std::process::Command;

/// Keep winget from flashing a console window inside the GUI app.
const CREATE_NO_WINDOW: u32 = 0x0800_0000;

/// winget: APPINSTALLER_CLI_ERROR_PACKAGE_ALREADY_INSTALLED
const ALREADY_INSTALLED: u32 = 0x8A15_0061;
/// winget: APPINSTALLER_CLI_ERROR_UPDATE_NOT_APPLICABLE — returned when the
/// installed version is already current.
const UPDATE_NOT_APPLICABLE: u32 = 0x8A15_002B;

fn winget(args: &[&str]) -> Option<std::process::Output> {
    Command::new("winget")
        .args(args)
        .creation_flags(CREATE_NO_WINDOW)
        .output()
        .ok()
}

pub fn status() -> PackageManagerStatus {
    let version = winget(&["--version"])
        .filter(|o| o.status.success())
        .and_then(|o| String::from_utf8(o.stdout).ok())
        .map(|s| s.trim().to_string())
        .filter(|s| !s.is_empty());
    PackageManagerStatus {
        manager: Some("winget".to_string()),
        available: version.is_some(),
        version,
    }
}

pub fn installed_ids(ids: &[String]) -> Vec<String> {
    // One `winget list` pass; package ids are unique enough for substring match.
    let Some(output) = winget(&[
        "list",
        "--accept-source-agreements",
        "--disable-interactivity",
    ]) else {
        return Vec::new();
    };
    let stdout = String::from_utf8_lossy(&output.stdout).to_lowercase();
    ids.iter()
        .filter(|id| stdout.contains(&id.to_lowercase()))
        .cloned()
        .collect()
}

/// Package ids only ever contain these characters; anything else is rejected
/// rather than passed to winget.
fn valid_id(id: &str) -> bool {
    !id.is_empty()
        && id
            .chars()
            .all(|c| c.is_ascii_alphanumeric() || matches!(c, '.' | '+' | '-' | '_'))
}

pub fn install(package_id: &str, source: Option<&str>) -> AppInstallResult {
    if !valid_id(package_id) {
        return AppInstallResult {
            package_id: package_id.to_string(),
            status: "failed".to_string(),
            exit_code: None,
            message: Some("invalid package id".to_string()),
        };
    }

    let mut args = vec![
        "install",
        "--id",
        package_id,
        "--exact",
        "--silent",
        "--accept-source-agreements",
        "--accept-package-agreements",
        "--disable-interactivity",
    ];
    if let Some(source) = source {
        if matches!(source, "winget" | "msstore") {
            args.push("--source");
            args.push(source);
        }
    }

    let Some(output) = winget(&args) else {
        return AppInstallResult {
            package_id: package_id.to_string(),
            status: "failed".to_string(),
            exit_code: None,
            message: Some("failed to launch winget".to_string()),
        };
    };

    let code = output.status.code();
    let status = match code {
        Some(0) => "installed",
        Some(c) if matches!(c as u32, ALREADY_INSTALLED | UPDATE_NOT_APPLICABLE) => {
            "already_installed"
        }
        _ => "failed",
    };

    AppInstallResult {
        package_id: package_id.to_string(),
        status: status.to_string(),
        exit_code: code,
        message: last_line(&output.stdout).or_else(|| last_line(&output.stderr)),
    }
}

/// Last non-empty output line, skipping winget's progress spinner glyphs.
fn last_line(bytes: &[u8]) -> Option<String> {
    String::from_utf8_lossy(bytes)
        .lines()
        .map(str::trim)
        .filter(|l| !l.is_empty() && l.chars().any(|c| c.is_ascii_alphanumeric()))
        .next_back()
        .map(str::to_string)
}
