use super::Field;
use serde::Serialize;

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct MainboardInfo {
    pub board_manufacturer: Field<String>,
    pub board_model: Field<String>,
    pub board_serial_number: Field<String>,
    pub bios_vendor: Field<String>,
    pub bios_version: Field<String>,
    pub bios_date: Field<String>,
    pub firmware_version: Field<String>,
    pub boot_mode: Field<String>,
    pub uefi: Field<bool>,
    pub secure_boot: Field<bool>,
    pub secure_boot_level: Field<String>,
    pub tpm_present: Field<bool>,
    pub tpm_version: Field<String>,
}
