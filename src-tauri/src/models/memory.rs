use super::Field;
use serde::Serialize;

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct MemoryModule {
    pub locator: Field<String>,
    pub bank: Field<String>,
    pub size_bytes: Field<u64>,
    pub manufacturer: Field<String>,
    pub part_number: Field<String>,
    /// Speed in MT/s as reported by SMBIOS.
    pub speed_mts: Field<u32>,
    pub configured_speed_mts: Field<u32>,
    pub memory_type: Field<String>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct MemoryInfo {
    pub total_bytes: Field<u64>,
    pub used_bytes: Field<u64>,
    pub available_bytes: Field<u64>,
    pub free_bytes: Field<u64>,
    pub usage_percent: Field<f32>,
    pub swap_total_bytes: Field<u64>,
    pub swap_used_bytes: Field<u64>,
    /// e.g. "LPDDR5", "DDR4".
    pub memory_type: Field<String>,
    /// Apple Silicon unified memory.
    pub is_unified: Field<bool>,
    pub module_count: Field<u32>,
    pub modules: Vec<MemoryModule>,
}
