#[cfg(target_os = "macos")]
mod macos;
#[cfg(windows)]
mod windows;

use crate::models::security::SecurityInfo;
use crate::models::Field;

pub fn collect() -> SecurityInfo {
    #[cfg(target_os = "macos")]
    {
        return macos::collect();
    }
    #[cfg(windows)]
    {
        return windows::collect();
    }
    #[allow(unreachable_code)]
    SecurityInfo {
        firewall_enabled: Field::Unavailable,
        antivirus_status: Field::Unavailable,
        defender_status: Field::Unavailable,
        secure_boot_enabled: Field::Unavailable,
        tpm_present: Field::Unavailable,
        tpm_version: Field::Unavailable,
        bitlocker_status: Field::Unavailable,
        filevault_enabled: Field::Unavailable,
        sip_enabled: Field::Unavailable,
        gatekeeper_enabled: Field::Unavailable,
        system_integrity: Field::Unavailable,
        os_update_status: Field::Unavailable,
    }
}

#[cfg(test)]
mod tests {
    #[test]
    fn security_collects() {
        let info = super::collect();
        let json = serde_json::to_string_pretty(&info).expect("serializes");
        println!("{json}");
    }
}
