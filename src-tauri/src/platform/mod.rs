use crate::models::platform::PlatformInfo;

pub fn detect() -> PlatformInfo {
    PlatformInfo {
        os: std::env::consts::OS.to_string(),
        os_name: os_name(),
        os_version: sysinfo::System::os_version().unwrap_or_default(),
        arch: std::env::consts::ARCH.to_string(),
        is_apple_silicon: is_apple_silicon(),
        chip_name: chip_name(),
        hostname: sysinfo::System::host_name(),
        is_elevated: is_elevated(),
    }
}

fn os_name() -> String {
    match std::env::consts::OS {
        "macos" => "macOS".to_string(),
        "windows" => "Windows".to_string(),
        other => other.to_string(),
    }
}

#[cfg(target_os = "macos")]
fn is_apple_silicon() -> bool {
    // Covers running under Rosetta too: the translated process reports x86_64
    // but hw.optional.arm64 is still 1 on Apple Silicon hardware.
    cfg!(target_arch = "aarch64")
        || crate::util::macos::sysctl_u64("hw.optional.arm64").unwrap_or(0) == 1
}

#[cfg(not(target_os = "macos"))]
fn is_apple_silicon() -> bool {
    false
}

#[cfg(target_os = "macos")]
fn chip_name() -> Option<String> {
    crate::util::macos::sysctl_string("machdep.cpu.brand_string")
}

#[cfg(windows)]
fn chip_name() -> Option<String> {
    let sys = sysinfo::System::new_with_specifics(
        sysinfo::RefreshKind::nothing().with_cpu(sysinfo::CpuRefreshKind::everything()),
    );
    sys.cpus().first().map(|c| c.brand().trim().to_string())
}

#[cfg(not(any(target_os = "macos", windows)))]
fn chip_name() -> Option<String> {
    None
}

#[cfg(unix)]
fn is_elevated() -> bool {
    // SAFETY: geteuid has no preconditions.
    unsafe { libc::geteuid() == 0 }
}

#[cfg(windows)]
fn is_elevated() -> bool {
    // SAFETY: IsUserAnAdmin has no preconditions.
    unsafe { ::windows::Win32::UI::Shell::IsUserAnAdmin().as_bool() }
}
