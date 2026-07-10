use crate::models::apps::{AppInstallResult, PackageManagerStatus};
use std::path::Path;
use std::process::Command;

/// GUI apps don't inherit the shell PATH, so resolve brew explicitly.
/// Apple Silicon first, then Intel.
fn brew_path() -> Option<&'static str> {
    ["/opt/homebrew/bin/brew", "/usr/local/bin/brew"]
        .into_iter()
        .find(|p| Path::new(p).exists())
}

fn brew(args: &[&str]) -> Option<std::process::Output> {
    Command::new(brew_path()?)
        .args(args)
        // Keep batch installs fast and predictable.
        .env("HOMEBREW_NO_AUTO_UPDATE", "1")
        .env("HOMEBREW_NO_INSTALL_CLEANUP", "1")
        .env("HOMEBREW_NO_ENV_HINTS", "1")
        .output()
        .ok()
}

pub fn status() -> PackageManagerStatus {
    let version = brew(&["--version"])
        .filter(|o| o.status.success())
        .and_then(|o| String::from_utf8(o.stdout).ok())
        .and_then(|s| {
            // First line is "Homebrew 4.x.y".
            s.lines()
                .next()
                .map(|l| l.trim_start_matches("Homebrew").trim().to_string())
        })
        .filter(|s| !s.is_empty());
    PackageManagerStatus {
        manager: Some("Homebrew".to_string()),
        available: version.is_some(),
        version,
    }
}

pub fn installed_ids(ids: &[String]) -> Vec<String> {
    let Some(output) = brew(&["list", "--cask", "-1"]) else {
        return Vec::new();
    };
    let stdout = String::from_utf8_lossy(&output.stdout);
    let installed: std::collections::HashSet<&str> =
        stdout.lines().map(str::trim).collect();
    ids.iter()
        .filter(|id| installed.contains(id.as_str()))
        .cloned()
        .collect()
}

/// Cask tokens only ever contain these characters; anything else is rejected
/// rather than passed to brew.
fn valid_id(id: &str) -> bool {
    !id.is_empty()
        && id
            .chars()
            .all(|c| c.is_ascii_lowercase() || c.is_ascii_digit() || matches!(c, '-' | '@' | '.' | '+'))
}

pub fn install(package_id: &str) -> AppInstallResult {
    if !valid_id(package_id) {
        return AppInstallResult {
            package_id: package_id.to_string(),
            status: "failed".to_string(),
            exit_code: None,
            message: Some("invalid package id".to_string()),
        };
    }

    let Some(output) = brew(&["install", "--cask", package_id]) else {
        return AppInstallResult {
            package_id: package_id.to_string(),
            status: "failed".to_string(),
            exit_code: None,
            message: Some("Homebrew not found".to_string()),
        };
    };

    let code = output.status.code();
    let stderr = String::from_utf8_lossy(&output.stderr).to_lowercase();
    // brew exits non-zero when the cask (or the app bundle itself) is already
    // present; report that as its own state rather than a failure.
    let already = stderr.contains("already installed")
        || stderr.contains("already an app at");
    let status = match code {
        Some(0) => "installed",
        _ if already => "already_installed",
        _ => "failed",
    };

    AppInstallResult {
        package_id: package_id.to_string(),
        status: status.to_string(),
        exit_code: code,
        message: last_line(&output.stderr).or_else(|| last_line(&output.stdout)),
    }
}

/// Last non-empty output line for diagnostics.
fn last_line(bytes: &[u8]) -> Option<String> {
    String::from_utf8_lossy(bytes)
        .lines()
        .map(str::trim)
        .filter(|l| !l.is_empty() && l.chars().any(|c| c.is_ascii_alphanumeric()))
        .next_back()
        .map(str::to_string)
}
