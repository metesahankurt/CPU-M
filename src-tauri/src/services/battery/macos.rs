use super::PowerInfo;
use crate::models::battery::BatteryDeviceInfo;
use crate::models::Field;
use crate::util::macos::run_cmd;
use serde_json::Value;
use std::process::Command;

pub fn fill_health_details(batteries: &mut [BatteryDeviceInfo]) {
    let Some(power) = system_profiler_power() else {
        return;
    };
    let Some(root) = power.get("SPPowerDataType").and_then(Value::as_array) else {
        return;
    };
    let Some(battery_info) = root
        .iter()
        .find(|item| item.get("_name").and_then(Value::as_str) == Some("spbattery_information"))
    else {
        return;
    };

    let health = battery_info.get("sppower_battery_health_info");
    let model = battery_info.get("sppower_battery_model_info");
    for battery in batteries {
        if let Some(cycles) = health
            .and_then(|h| h.get("sppower_battery_cycle_count"))
            .and_then(Value::as_u64)
        {
            battery.cycle_count = Field::Ok(cycles as u32);
        }
        if let Some(max_capacity) = health
            .and_then(|h| h.get("sppower_battery_health_maximum_capacity"))
            .and_then(Value::as_str)
            .and_then(parse_percent)
        {
            battery.health_percent = Field::Ok(max_capacity);
        }
        if matches!(battery.model, Field::Unavailable) {
            battery.model = model
                .and_then(|m| m.get("sppower_battery_device_name"))
                .and_then(Value::as_str)
                .map(ToString::to_string)
                .into();
        }
        if matches!(battery.serial_number, Field::Unavailable) {
            battery.serial_number = model
                .and_then(|m| m.get("sppower_battery_serial_number"))
                .and_then(Value::as_str)
                .map(ToString::to_string)
                .into();
        }
    }
}

pub fn power_info() -> PowerInfo {
    let power = system_profiler_power();
    let root = power
        .as_ref()
        .and_then(|v| v.get("SPPowerDataType"))
        .and_then(Value::as_array);

    let ac_adapter = root.and_then(|items| {
        items.iter().find(|item| {
            item.get("_name").and_then(Value::as_str) == Some("sppower_ac_charger_information")
        })
    });
    let power_settings = root.and_then(|items| {
        items
            .iter()
            .find(|item| item.get("_name").and_then(Value::as_str) == Some("sppower_information"))
    });

    let ac_connected = ac_adapter
        .and_then(|a| a.get("sppower_battery_charger_connected"))
        .and_then(Value::as_str)
        .map(|v| v == "TRUE");
    let ac_watts = ac_adapter
        .and_then(|a| a.get("sppower_ac_charger_watts"))
        .and_then(Value::as_str)
        .and_then(|v| v.parse::<u32>().ok());
    let low_power_mode = pmset_low_power_mode().or_else(|| {
        power_settings
            .and_then(|p| p.get("Battery Power"))
            .and_then(|p| p.get("LowPowerMode"))
            .and_then(Value::as_str)
            .map(|v| v == "Yes")
    });

    PowerInfo {
        power_source: match ac_connected {
            Some(true) => Some("AC Power".to_string()),
            Some(false) => Some("Battery Power".to_string()),
            None => None,
        },
        ac_adapter_connected: ac_connected,
        ac_adapter_watts: ac_watts,
        low_power_mode,
    }
}

fn system_profiler_power() -> Option<Value> {
    let output = Command::new("system_profiler")
        .args(["SPPowerDataType", "-json"])
        .output()
        .ok()?;
    if !output.status.success() {
        return None;
    }
    serde_json::from_slice(&output.stdout).ok()
}

fn pmset_low_power_mode() -> Option<bool> {
    let output = run_cmd("pmset", &["-g", "custom"])?;
    output.lines().find_map(|line| {
        let trimmed = line.trim();
        if trimmed.starts_with("lowpowermode") {
            trimmed
                .split_whitespace()
                .nth(1)
                .and_then(|v| v.parse::<u8>().ok())
                .map(|v| v == 1)
        } else {
            None
        }
    })
}

fn parse_percent(value: &str) -> Option<f32> {
    value
        .trim()
        .trim_start_matches('%')
        .trim_end_matches('%')
        .parse::<f32>()
        .ok()
}
