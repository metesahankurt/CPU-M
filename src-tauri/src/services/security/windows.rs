use crate::models::security::SecurityInfo;
use crate::models::Field;
use crate::util::windows::wmi_query;
use serde::Deserialize;
use std::process::Command;

#[derive(Deserialize)]
#[serde(rename_all = "PascalCase")]
struct Win32Tpm {
    #[serde(rename = "SpecVersion")]
    spec_version: Option<String>,
    #[serde(rename = "IsEnabled_InitialValue")]
    is_enabled_initial_value: Option<bool>,
}

#[derive(Deserialize)]
#[serde(rename_all = "PascalCase")]
struct AntivirusProduct {
    display_name: Option<String>,
}

pub fn collect() -> SecurityInfo {
    let tpm: Option<Win32Tpm> =
        wmi_query(Some("root\\cimv2\\security\\microsofttpm"), "SELECT SpecVersion, IsEnabled_InitialValue FROM Win32_Tpm")
            .into_iter()
            .next();
    let av: Vec<AntivirusProduct> = wmi_query(
        Some("root\\SecurityCenter2"),
        "SELECT displayName FROM AntiVirusProduct",
    );

    SecurityInfo {
        firewall_enabled: powershell_bool(
            "(Get-NetFirewallProfile | Where-Object {$_.Enabled -eq $true}).Count -gt 0",
        )
        .into(),
        antivirus_status: if av.is_empty() {
            Field::Unavailable
        } else {
            Field::Ok(
                av.into_iter()
                    .filter_map(|p| p.display_name)
                    .collect::<Vec<_>>()
                    .join(", "),
            )
        },
        defender_status: powershell_string(
            "(Get-MpComputerStatus).AMServiceEnabled",
        )
        .into(),
        secure_boot_enabled: powershell_bool("Confirm-SecureBootUEFI").into(),
        tpm_present: tpm
            .as_ref()
            .map(|t| t.is_enabled_initial_value.unwrap_or(true))
            .into(),
        tpm_version: tpm.and_then(|t| t.spec_version).into(),
        bitlocker_status: powershell_string(
            "(Get-BitLockerVolume -MountPoint $env:SystemDrive).ProtectionStatus",
        )
        .into(),
        filevault_enabled: Field::Unavailable,
        sip_enabled: Field::Unavailable,
        gatekeeper_enabled: Field::Unavailable,
        system_integrity: Field::Unavailable,
        os_update_status: Field::Unavailable,
    }
}

fn powershell_bool(script: &str) -> Option<bool> {
    powershell_string(script).and_then(|value| match value.to_lowercase().as_str() {
        "true" | "1" | "on" => Some(true),
        "false" | "0" | "off" => Some(false),
        _ => None,
    })
}

fn powershell_string(script: &str) -> Option<String> {
    let output = Command::new("powershell")
        .args(["-NoProfile", "-Command", script])
        .output()
        .ok()?;
    if !output.status.success() {
        return None;
    }
    String::from_utf8(output.stdout)
        .ok()
        .map(|s| s.trim().to_string())
        .filter(|s| !s.is_empty())
}
