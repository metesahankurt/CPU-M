#[cfg(target_os = "macos")]
mod macos;
#[cfg(windows)]
mod windows;

use crate::models::mainboard::MainboardInfo;
use crate::models::Field;

pub fn collect() -> MainboardInfo {
    #[cfg(target_os = "macos")]
    {
        return macos::collect();
    }
    #[cfg(windows)]
    {
        return windows::collect();
    }
    #[allow(unreachable_code)]
    MainboardInfo {
        board_manufacturer: Field::Unavailable,
        board_model: Field::Unavailable,
        board_serial_number: Field::Unavailable,
        bios_vendor: Field::Unavailable,
        bios_version: Field::Unavailable,
        bios_date: Field::Unavailable,
        firmware_version: Field::Unavailable,
        boot_mode: Field::Unavailable,
        uefi: Field::Unavailable,
        secure_boot: Field::Unavailable,
        secure_boot_level: Field::Unavailable,
        tpm_present: Field::Unavailable,
        tpm_version: Field::Unavailable,
    }
}

#[cfg(test)]
mod tests {
    #[test]
    fn mainboard_collects() {
        let info = super::collect();
        let json = serde_json::to_string_pretty(&info).expect("serializes");
        println!("{json}");
    }
}
