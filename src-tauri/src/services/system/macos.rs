use crate::models::system::SystemInfo;
use crate::models::Field;
use crate::util::macos::{run_cmd, sysctl_string};
use serde_json::Value;

pub fn fill(info: &mut SystemInfo) {
    info.manufacturer = Field::Ok("Apple".to_string());
    info.model_identifier = sysctl_string("hw.model").into();
    info.os_build = run_cmd("sw_vers", &["-buildVersion"])
        .map(|s| s.trim().to_string())
        .into();
    info.timezone = timezone().into();

    if let Some(hw) = hardware_overview() {
        let get = |key: &str| {
            hw.get(key)
                .and_then(Value::as_str)
                .map(|s| s.to_string())
        };
        info.model_name = get("machine_name").into();
        info.serial_number = get("serial_number").into();
        info.hardware_uuid = get("platform_UUID").into();
        // Apple Silicon reports os_loader_version; Intel reports boot_rom_version.
        info.firmware_version = get("os_loader_version")
            .or_else(|| get("boot_rom_version"))
            .into();
        if let Some(model_number) = get("model_number") {
            if let Field::Ok(name) = &info.model_name {
                info.model_name = Field::Ok(format!("{name} ({model_number})"));
            }
        }
    }
}

/// Parse `system_profiler SPHardwareDataType -json` and return the first
/// hardware overview object.
fn hardware_overview() -> Option<Value> {
    let out = run_cmd("system_profiler", &["SPHardwareDataType", "-json"])?;
    let parsed: Value = serde_json::from_str(&out).ok()?;
    parsed
        .get("SPHardwareDataType")?
        .as_array()?
        .first()
        .cloned()
}

fn timezone() -> Option<String> {
    let link = std::fs::read_link("/etc/localtime").ok()?;
    let path = link.to_string_lossy();
    let tz = path.split("zoneinfo/").nth(1)?;
    Some(tz.to_string())
}
