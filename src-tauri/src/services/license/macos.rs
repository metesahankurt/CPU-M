use crate::models::license::LicenseInfo;
use crate::models::Field;
use crate::util::macos::{run_cmd, sysctl_string};
use serde_json::Value;

pub fn collect() -> LicenseInfo {
    let hardware = profiler_first("SPHardwareDataType");
    let software = profiler_first("SPSoftwareDataType");
    let bridge = profiler_first("SPiBridgeDataType");
    let model = sysctl_string("hw.model")
        .or_else(|| get(&hardware, "machine_model"))
        .unwrap_or_default();
    let manufacturer_is_apple = run_cmd("system_profiler", &["SPHardwareDataType"])
        .map(|out| out.contains("Apple"))
        .unwrap_or(false);
    let apple_model_recognized = model.starts_with("Mac") && manufacturer_is_apple;
    let sip_ok = run_cmd("csrutil", &["status"])
        .map(|out| out.to_lowercase().contains("enabled"))
        .unwrap_or(false);
    let ssv_ok = get(&bridge, "ibridge_sb_ssv")
        .map(|v| v == "Enabled")
        .unwrap_or_else(|| {
            get(&software, "system_integrity")
                .map(|v| v.contains("enabled"))
                .unwrap_or(false)
        });

    let mut checks = Vec::new();
    if sip_ok {
        checks.push("System Integrity Protection enabled".to_string());
    }
    if ssv_ok {
        checks.push("Signed system volume/integrity enabled".to_string());
    }
    if let Some(level) = get(&bridge, "ibridge_secure_boot") {
        checks.push(format!("Secure Boot: {level}"));
    }

    let mut indicators = Vec::new();
    if !model.starts_with("Mac") {
        indicators.push("Model identifier is not a Mac identifier".to_string());
    }
    if !manufacturer_is_apple {
        indicators.push("Apple hardware manufacturer could not be confirmed".to_string());
    }

    LicenseInfo {
        product_name: get(&software, "os_version")
            .or_else(|| Some("macOS".to_string()))
            .into(),
        edition: Field::Unavailable,
        activation_status: Field::Ok(
            "macOS does not expose a Windows-style activation state".to_string(),
        ),
        license_channel: Field::Unavailable,
        partial_product_key: Field::Unavailable,
        license_status: Field::Ok(
            "Authenticity cannot be conclusively verified from local public APIs".to_string(),
        ),
        authenticity_summary: Field::Ok(if indicators.is_empty() && apple_model_recognized {
            "No Hackintosh indicators found; authenticity still cannot be guaranteed".to_string()
        } else {
            "Authenticity could not be verified; technical indicators need review".to_string()
        }),
        apple_model_recognized: Field::Ok(apple_model_recognized),
        official_os_build: Field::Ok(ssv_ok || sip_ok),
        integrity_checks: checks,
        hackintosh_indicators: indicators,
    }
}

fn profiler_first(data_type: &str) -> Option<Value> {
    let output = run_cmd("system_profiler", &[data_type, "-json"])?;
    let parsed: Value = serde_json::from_str(&output).ok()?;
    parsed.get(data_type)?.as_array()?.first().cloned()
}

fn get(value: &Option<Value>, key: &str) -> Option<String> {
    value
        .as_ref()
        .and_then(|v| v.get(key))
        .and_then(Value::as_str)
        .map(ToString::to_string)
}
