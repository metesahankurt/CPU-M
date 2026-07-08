use super::Field;
use serde::Serialize;

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct BatteryDeviceInfo {
    pub vendor: Field<String>,
    pub model: Field<String>,
    pub serial_number: Field<String>,
    pub technology: Field<String>,
    pub state: Field<String>,
    pub percentage: Field<f32>,
    pub health_percent: Field<f32>,
    pub cycle_count: Field<u32>,
    pub energy_wh: Field<f32>,
    pub energy_full_wh: Field<f32>,
    pub energy_full_design_wh: Field<f32>,
    pub power_draw_w: Field<f32>,
    pub voltage_v: Field<f32>,
    pub temperature_celsius: Field<f32>,
    pub time_to_empty_seconds: Field<u64>,
    pub time_to_full_seconds: Field<u64>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct BatteryInfo {
    pub batteries: Vec<BatteryDeviceInfo>,
    pub power_source: Field<String>,
    pub ac_adapter_connected: Field<bool>,
    pub ac_adapter_watts: Field<u32>,
    pub low_power_mode: Field<bool>,
}
