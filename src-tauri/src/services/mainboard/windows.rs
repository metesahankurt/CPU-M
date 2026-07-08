use crate::models::mainboard::MainboardInfo;
use crate::models::Field;
use crate::util::windows::wmi_query;
use serde::Deserialize;

#[derive(Deserialize)]
#[serde(rename_all = "PascalCase")]
struct Win32BaseBoard {
    manufacturer: Option<String>,
    product: Option<String>,
    serial_number: Option<String>,
}

#[derive(Deserialize)]
#[serde(rename_all = "PascalCase")]
struct Win32Bios {
    manufacturer: Option<String>,
    #[serde(rename = "SMBIOSBIOSVersion")]
    smbios_bios_version: Option<String>,
    release_date: Option<String>,
}

#[derive(Deserialize)]
#[serde(rename_all = "PascalCase")]
struct Win32ComputerSystem {
    bootup_state: Option<String>,
}

#[derive(Deserialize)]
#[serde(rename_all = "PascalCase")]
struct Win32Tpm {
    #[serde(rename = "SpecVersion")]
    spec_version: Option<String>,
    #[serde(rename = "IsEnabled_InitialValue")]
    is_enabled_initial_value: Option<bool>,
}

pub fn collect() -> MainboardInfo {
    let board: Option<Win32BaseBoard> =
        wmi_query(None, "SELECT Manufacturer, Product, SerialNumber FROM Win32_BaseBoard")
            .into_iter()
            .next();
    let bios: Option<Win32Bios> =
        wmi_query(None, "SELECT Manufacturer, SMBIOSBIOSVersion, ReleaseDate FROM Win32_BIOS")
            .into_iter()
            .next();
    let computer: Option<Win32ComputerSystem> =
        wmi_query(None, "SELECT BootupState FROM Win32_ComputerSystem")
            .into_iter()
            .next();
    let tpm: Option<Win32Tpm> =
        wmi_query(Some("root\\cimv2\\security\\microsofttpm"), "SELECT SpecVersion, IsEnabled_InitialValue FROM Win32_Tpm")
            .into_iter()
            .next();

    MainboardInfo {
        board_manufacturer: board.as_ref().and_then(|b| clean(b.manufacturer.clone())).into(),
        board_model: board.as_ref().and_then(|b| clean(b.product.clone())).into(),
        board_serial_number: board
            .as_ref()
            .and_then(|b| clean(b.serial_number.clone()))
            .into(),
        bios_vendor: bios.as_ref().and_then(|b| clean(b.manufacturer.clone())).into(),
        bios_version: bios
            .as_ref()
            .and_then(|b| clean(b.smbios_bios_version.clone()))
            .into(),
        bios_date: bios.as_ref().and_then(|b| clean(b.release_date.clone())).into(),
        firmware_version: Field::Unavailable,
        boot_mode: computer.and_then(|c| clean(c.bootup_state)).into(),
        uefi: Field::Unavailable,
        secure_boot: Field::Unavailable,
        secure_boot_level: Field::Unavailable,
        tpm_present: tpm.as_ref().map(|t| t.is_enabled_initial_value.unwrap_or(true)).into(),
        tpm_version: tpm.and_then(|t| clean(t.spec_version)).into(),
    }
}

fn clean(value: Option<String>) -> Option<String> {
    value
        .map(|v| v.trim().to_string())
        .filter(|v| !v.is_empty() && v != "To be filled by O.E.M.")
}
