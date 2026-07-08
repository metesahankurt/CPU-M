use super::Field;
use serde::Serialize;

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SensorReading {
    pub name: String,
    pub category: String,
    pub value: Field<f32>,
    pub unit: String,
    pub detail: Field<String>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SensorsInfo {
    pub readings: Vec<SensorReading>,
    pub thermal_state: Field<String>,
    pub fan_count: Field<u32>,
    pub notes: Vec<String>,
}
