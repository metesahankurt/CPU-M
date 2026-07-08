#[cfg(target_os = "macos")]
mod macos;
#[cfg(windows)]
mod windows;

use crate::models::system::SystemInfo;
use crate::models::Field;

/// Collect general system information. Cross-platform basics come from
/// sysinfo/std; device identity is filled in by the per-OS collector.
pub fn collect() -> SystemInfo {
    let mut info = SystemInfo {
        computer_name: sysinfo::System::host_name().into(),
        username: username().into(),
        os_name: os_display_name().into(),
        os_version: sysinfo::System::os_version().into(),
        os_build: Field::Unavailable,
        arch: Field::Ok(std::env::consts::ARCH.to_string()),
        kernel_version: sysinfo::System::kernel_version().into(),
        locale: locale().into(),
        timezone: Field::Unavailable,
        manufacturer: Field::Unavailable,
        model_name: Field::Unavailable,
        model_identifier: Field::Unavailable,
        serial_number: Field::Unavailable,
        hardware_uuid: Field::Unavailable,
        firmware_version: Field::Unavailable,
        boot_time: Field::Ok(sysinfo::System::boot_time()),
        uptime_seconds: Field::Ok(sysinfo::System::uptime()),
        is_elevated: Field::Ok(crate::platform::detect().is_elevated),
    };

    #[cfg(target_os = "macos")]
    macos::fill(&mut info);
    #[cfg(windows)]
    windows::fill(&mut info);

    info
}

fn os_display_name() -> Option<String> {
    let name = sysinfo::System::name()?;
    match std::env::consts::OS {
        "macos" => Some("macOS".to_string()),
        _ => Some(name),
    }
}

fn username() -> Option<String> {
    std::env::var("USER")
        .or_else(|_| std::env::var("USERNAME"))
        .ok()
}

fn locale() -> Option<String> {
    #[cfg(target_os = "macos")]
    {
        if let Ok(lang) = std::env::var("LANG") {
            if !lang.is_empty() {
                return Some(lang.split('.').next().unwrap_or(&lang).to_string());
            }
        }
        crate::util::macos::run_cmd("defaults", &["read", "-g", "AppleLocale"])
            .map(|s| s.trim().to_string())
    }
    #[cfg(not(target_os = "macos"))]
    {
        std::env::var("LANG").ok()
    }
}

#[cfg(test)]
mod tests {
    #[test]
    fn collects_without_panicking() {
        let info = super::collect();
        let json = serde_json::to_string_pretty(&info).expect("serializes");
        println!("{json}");
        assert!(json.contains("computerName"));
    }
}
