use super::Field;
use serde::Serialize;

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CacheEntry {
    /// Display label, e.g. "L1 Data (P-core)" or "L3".
    pub label: String,
    pub size_bytes: u64,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CpuStaticInfo {
    pub vendor: Field<String>,
    /// Brand string, e.g. "Apple M3" or "Intel Core i7-12700K".
    pub brand: Field<String>,
    pub architecture: Field<String>,
    pub physical_cores: Field<u32>,
    pub logical_cores: Field<u32>,
    pub performance_cores: Field<u32>,
    pub efficiency_cores: Field<u32>,
    pub base_frequency_mhz: Field<u64>,
    pub max_frequency_mhz: Field<u64>,
    pub caches: Vec<CacheEntry>,
    pub instruction_sets: Field<Vec<String>>,
    pub virtualization_support: Field<bool>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CpuDynamicInfo {
    /// 0..100
    pub global_usage_percent: Field<f32>,
    /// 0..100 per logical core, in core order.
    pub per_core_usage_percent: Vec<f32>,
    pub current_frequency_mhz: Field<u64>,
    pub temperature_celsius: Field<f32>,
    pub power_watts: Field<f32>,
}
