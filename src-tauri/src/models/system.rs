use super::Field;
use serde::Serialize;

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SystemInfo {
    pub computer_name: Field<String>,
    pub username: Field<String>,
    pub os_name: Field<String>,
    pub os_version: Field<String>,
    pub os_build: Field<String>,
    pub arch: Field<String>,
    pub kernel_version: Field<String>,
    pub locale: Field<String>,
    pub timezone: Field<String>,
    pub manufacturer: Field<String>,
    /// Marketing name, e.g. "MacBook Air" or "ThinkPad X1 Carbon".
    pub model_name: Field<String>,
    /// Machine identifier, e.g. "Mac15,12".
    pub model_identifier: Field<String>,
    pub serial_number: Field<String>,
    pub hardware_uuid: Field<String>,
    pub firmware_version: Field<String>,
    /// Unix epoch seconds of the last boot.
    pub boot_time: Field<u64>,
    pub uptime_seconds: Field<u64>,
    pub is_elevated: Field<bool>,
}
