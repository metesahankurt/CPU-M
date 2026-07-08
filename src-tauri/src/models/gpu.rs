use super::Field;
use serde::Serialize;

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct GpuInfo {
    pub name: Field<String>,
    pub vendor: Field<String>,
    /// "integrated" | "discrete"
    pub gpu_type: Field<String>,
    pub vram_bytes: Field<u64>,
    /// Shared with system RAM (Apple Silicon / iGPUs).
    pub shared_memory: Field<bool>,
    /// Apple GPU core count.
    pub core_count: Field<u32>,
    /// e.g. "Metal 4"
    pub metal_support: Field<String>,
    pub driver_version: Field<String>,
    pub device_id: Field<String>,
}
