use super::PowerInfo;
use crate::models::battery::BatteryDeviceInfo;
use crate::models::Field;
use crate::util::windows::wmi_query;
use serde::Deserialize;

#[derive(Deserialize)]
#[serde(rename_all = "PascalCase")]
struct Win32Battery {
    estimated_charge_remaining: Option<u16>,
    battery_status: Option<u16>,
}

#[derive(Deserialize)]
#[serde(rename_all = "PascalCase")]
struct Win32PortableBattery {
    design_capacity: Option<u32>,
    design_voltage: Option<u64>,
}

pub fn fill_health_details(batteries: &mut [BatteryDeviceInfo]) {
    let rows: Vec<Win32PortableBattery> = wmi_query(
        None,
        "SELECT DesignCapacity, DesignVoltage FROM Win32_PortableBattery",
    );
    let Some(row) = rows.into_iter().next() else {
        return;
    };
    for battery in batteries {
        if matches!(battery.energy_full_design_wh, Field::Unavailable) {
            battery.energy_full_design_wh = row
                .design_capacity
                .map(|mah| {
                    let volts = row.design_voltage.unwrap_or(0) as f32 / 1000.0;
                    (mah as f32 * volts) / 1000.0
                })
                .into();
        }
    }
}

pub fn power_info() -> PowerInfo {
    let rows: Vec<Win32Battery> = wmi_query(
        None,
        "SELECT EstimatedChargeRemaining, BatteryStatus FROM Win32_Battery",
    );
    let status = rows.first().and_then(|row| row.battery_status);
    PowerInfo {
        power_source: status.map(windows_battery_status),
        ac_adapter_connected: status.map(|s| matches!(s, 2 | 6 | 7 | 8 | 9 | 11)),
        ac_adapter_watts: None,
        low_power_mode: None,
    }
}

fn windows_battery_status(code: u16) -> String {
    match code {
        1 => "Discharging",
        2 => "AC Power",
        3 => "Fully Charged",
        4 => "Low",
        5 => "Critical",
        6 => "Charging",
        7 => "Charging and High",
        8 => "Charging and Low",
        9 => "Charging and Critical",
        10 => "Undefined",
        11 => "Partially Charged",
        _ => "Unknown",
    }
    .to_string()
}
