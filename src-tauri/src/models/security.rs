use super::Field;
use serde::Serialize;

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SecurityInfo {
    pub firewall_enabled: Field<bool>,
    pub antivirus_status: Field<String>,
    pub defender_status: Field<String>,
    pub secure_boot_enabled: Field<bool>,
    pub tpm_present: Field<bool>,
    pub tpm_version: Field<String>,
    pub bitlocker_status: Field<String>,
    pub filevault_enabled: Field<bool>,
    pub sip_enabled: Field<bool>,
    pub gatekeeper_enabled: Field<bool>,
    pub system_integrity: Field<String>,
    pub os_update_status: Field<String>,
}
