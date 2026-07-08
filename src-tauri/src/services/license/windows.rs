use crate::models::license::LicenseInfo;
use crate::models::Field;
use crate::util::windows::wmi_query;
use serde::Deserialize;

#[derive(Deserialize)]
#[serde(rename_all = "PascalCase")]
struct SoftwareLicensingProduct {
    name: Option<String>,
    description: Option<String>,
    license_status: Option<u32>,
    partial_product_key: Option<String>,
}

#[derive(Deserialize)]
#[serde(rename_all = "PascalCase")]
struct Win32OperatingSystem {
    caption: Option<String>,
    operating_system_sku: Option<u32>,
}

pub fn collect() -> LicenseInfo {
    let os: Option<Win32OperatingSystem> =
        wmi_query(None, "SELECT Caption, OperatingSystemSKU FROM Win32_OperatingSystem")
            .into_iter()
            .next();
    let product: Option<SoftwareLicensingProduct> = wmi_query(
        None,
        "SELECT Name, Description, LicenseStatus, PartialProductKey \
         FROM SoftwareLicensingProduct \
         WHERE PartialProductKey IS NOT NULL AND Name LIKE 'Windows%'",
    )
    .into_iter()
    .next();

    let license_status = product.as_ref().and_then(|p| p.license_status);
    let description = product.as_ref().and_then(|p| p.description.clone());

    LicenseInfo {
        product_name: product
            .as_ref()
            .and_then(|p| p.name.clone())
            .or_else(|| os.as_ref().and_then(|o| o.caption.clone()))
            .into(),
        edition: os
            .and_then(|o| o.operating_system_sku.map(|sku| format!("SKU {sku}")))
            .into(),
        activation_status: license_status.map(activation_status).into(),
        license_channel: description.as_ref().and_then(|d| channel(d)).into(),
        partial_product_key: product.and_then(|p| p.partial_product_key).into(),
        license_status: license_status.map(|s| format!("Code {s}")).into(),
        authenticity_summary: Field::Unavailable,
        apple_model_recognized: Field::Unavailable,
        official_os_build: Field::Unavailable,
        integrity_checks: Vec::new(),
        hackintosh_indicators: Vec::new(),
    }
}

fn activation_status(code: u32) -> String {
    match code {
        0 => "Unlicensed",
        1 => "Licensed",
        2 => "Out-of-box grace period",
        3 => "Out-of-tolerance grace period",
        4 => "Non-genuine grace period",
        5 => "Notification",
        6 => "Extended grace period",
        _ => "Unknown",
    }
    .to_string()
}

fn channel(description: &str) -> Option<String> {
    let lower = description.to_lowercase();
    if lower.contains("volume") {
        Some("Volume".to_string())
    } else if lower.contains("oem") {
        Some("OEM".to_string())
    } else if lower.contains("retail") {
        Some("Retail".to_string())
    } else {
        None
    }
}
