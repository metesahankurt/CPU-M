#[cfg(target_os = "macos")]
mod macos;
#[cfg(windows)]
mod windows;

use crate::models::license::LicenseInfo;
use crate::models::Field;

pub fn collect() -> LicenseInfo {
    #[cfg(target_os = "macos")]
    {
        return macos::collect();
    }
    #[cfg(windows)]
    {
        return windows::collect();
    }
    #[allow(unreachable_code)]
    LicenseInfo {
        product_name: Field::Unavailable,
        edition: Field::Unavailable,
        activation_status: Field::Unavailable,
        license_channel: Field::Unavailable,
        partial_product_key: Field::Unavailable,
        license_status: Field::Unavailable,
        authenticity_summary: Field::Unavailable,
        apple_model_recognized: Field::Unavailable,
        official_os_build: Field::Unavailable,
        integrity_checks: Vec::new(),
        hackintosh_indicators: Vec::new(),
    }
}

#[cfg(test)]
mod tests {
    #[test]
    fn license_collects() {
        let info = super::collect();
        let json = serde_json::to_string_pretty(&info).expect("serializes");
        println!("{json}");
    }
}
