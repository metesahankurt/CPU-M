use crate::models::mainboard::MainboardInfo;
use crate::models::Field;
use crate::util::macos::{run_cmd, sysctl_string};
use serde_json::Value;

pub fn collect() -> MainboardInfo {
    let hardware = profiler_first("SPHardwareDataType");
    let software = profiler_first("SPSoftwareDataType");
    let bridge = profiler_first("SPiBridgeDataType");

    let get = |value: &Option<Value>, key: &str| {
        value
            .as_ref()
            .and_then(|v| v.get(key))
            .and_then(Value::as_str)
            .map(ToString::to_string)
    };
    let secure_boot_level = get(&bridge, "ibridge_secure_boot");

    MainboardInfo {
        board_manufacturer: Field::Ok("Apple".to_string()),
        board_model: sysctl_string("hw.model")
            .or_else(|| get(&hardware, "machine_model"))
            .into(),
        board_serial_number: get(&hardware, "serial_number").into(),
        bios_vendor: Field::Ok("Apple".to_string()),
        bios_version: get(&hardware, "boot_rom_version")
            .or_else(|| get(&hardware, "os_loader_version"))
            .or_else(|| get(&bridge, "ibridge_build"))
            .into(),
        bios_date: Field::Unavailable,
        firmware_version: get(&hardware, "os_loader_version")
            .or_else(|| get(&bridge, "ibridge_build"))
            .into(),
        boot_mode: get(&software, "boot_mode").into(),
        uefi: Field::Ok(true),
        secure_boot: secure_boot_level
            .as_ref()
            .map(|level| !level.eq_ignore_ascii_case("no security"))
            .into(),
        secure_boot_level: secure_boot_level.into(),
        tpm_present: Field::Unavailable,
        tpm_version: Field::Unavailable,
    }
}

fn profiler_first(data_type: &str) -> Option<Value> {
    let output = run_cmd("system_profiler", &[data_type, "-json"])?;
    let parsed: Value = serde_json::from_str(&output).ok()?;
    parsed.get(data_type)?.as_array()?.first().cloned()
}
