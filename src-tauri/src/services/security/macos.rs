use crate::models::security::SecurityInfo;
use crate::models::Field;
use crate::util::macos::run_cmd;
use serde_json::Value;

pub fn collect() -> SecurityInfo {
    let bridge = profiler_first("SPiBridgeDataType");
    let software = profiler_first("SPSoftwareDataType");
    let secure_boot = bridge
        .as_ref()
        .and_then(|v| v.get("ibridge_secure_boot"))
        .and_then(Value::as_str)
        .map(|level| !level.eq_ignore_ascii_case("no security"));

    SecurityInfo {
        firewall_enabled: firewall_enabled().into(),
        antivirus_status: Field::Unavailable,
        defender_status: Field::Unavailable,
        secure_boot_enabled: secure_boot.into(),
        tpm_present: Field::Unavailable,
        tpm_version: Field::Unavailable,
        bitlocker_status: Field::Unavailable,
        filevault_enabled: filevault_enabled().into(),
        sip_enabled: sip_enabled().into(),
        gatekeeper_enabled: gatekeeper_enabled().into(),
        system_integrity: software
            .as_ref()
            .and_then(|v| v.get("system_integrity"))
            .and_then(Value::as_str)
            .map(ToString::to_string)
            .or_else(|| {
                bridge
                    .as_ref()
                    .and_then(|v| v.get("ibridge_sb_ssv"))
                    .and_then(Value::as_str)
                    .map(|v| format!("Signed System Volume: {v}"))
            })
            .into(),
        os_update_status: software_update_status().into(),
    }
}

fn sip_enabled() -> Option<bool> {
    let output = run_cmd("csrutil", &["status"])?;
    Some(output.to_lowercase().contains("enabled"))
}

fn gatekeeper_enabled() -> Option<bool> {
    let output = run_cmd("spctl", &["--status"])?;
    Some(output.to_lowercase().contains("enabled"))
}

fn filevault_enabled() -> Option<bool> {
    let output = run_cmd("fdesetup", &["status"])?;
    Some(output.to_lowercase().contains("is on"))
}

fn firewall_enabled() -> Option<bool> {
    let output = run_cmd(
        "/usr/libexec/ApplicationFirewall/socketfilterfw",
        &["--getglobalstate"],
    )?;
    Some(output.contains("enabled") || output.contains("State = 1"))
}

fn software_update_status() -> Option<String> {
    let output = run_cmd("softwareupdate", &["--list"])?;
    let lower = output.to_lowercase();
    if lower.contains("no new software available") {
        Some("Up to date".to_string())
    } else if lower.contains("software update found") || lower.contains('*') {
        Some("Updates available".to_string())
    } else {
        Some(output.lines().next().unwrap_or("Unknown").trim().to_string())
    }
}

fn profiler_first(data_type: &str) -> Option<Value> {
    let output = run_cmd("system_profiler", &[data_type, "-json"])?;
    let parsed: Value = serde_json::from_str(&output).ok()?;
    parsed.get(data_type)?.as_array()?.first().cloned()
}
