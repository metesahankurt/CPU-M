use super::Field;
use serde::Serialize;

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct LicenseInfo {
    pub product_name: Field<String>,
    pub edition: Field<String>,
    pub activation_status: Field<String>,
    pub license_channel: Field<String>,
    pub partial_product_key: Field<String>,
    pub license_status: Field<String>,
    pub authenticity_summary: Field<String>,
    pub apple_model_recognized: Field<bool>,
    pub official_os_build: Field<bool>,
    pub integrity_checks: Vec<String>,
    pub hackintosh_indicators: Vec<String>,
}
