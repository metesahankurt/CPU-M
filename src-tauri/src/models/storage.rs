use super::Field;
use serde::Serialize;

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PhysicalDisk {
    /// OS identifier, e.g. "disk0" or "\\\\.\\PHYSICALDRIVE0".
    pub identifier: Field<String>,
    pub model: Field<String>,
    pub size_bytes: Field<u64>,
    /// "SSD" | "HDD" | "NVMe SSD" ...
    pub kind: Field<String>,
    pub bus: Field<String>,
    pub internal: Field<bool>,
    pub removable: Field<bool>,
    pub serial_number: Field<String>,
    /// e.g. "Verified", "Healthy", "Not Supported".
    pub smart_status: Field<String>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct VolumeInfo {
    pub name: Field<String>,
    pub mount_point: Field<String>,
    pub filesystem: Field<String>,
    pub total_bytes: Field<u64>,
    pub available_bytes: Field<u64>,
    pub used_bytes: Field<u64>,
    pub usage_percent: Field<f32>,
    pub is_removable: Field<bool>,
    /// True for the volume the OS booted from.
    pub is_system: Field<bool>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct StorageInfo {
    pub disks: Vec<PhysicalDisk>,
    pub volumes: Vec<VolumeInfo>,
}
