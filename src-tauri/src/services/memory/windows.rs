use super::StaticMemory;
use crate::models::memory::MemoryModule;
use crate::models::Field;
use crate::util::windows::wmi_query;
use serde::Deserialize;

#[derive(Deserialize)]
#[serde(rename_all = "PascalCase")]
struct Win32PhysicalMemory {
    device_locator: Option<String>,
    bank_label: Option<String>,
    capacity: Option<String>,
    manufacturer: Option<String>,
    part_number: Option<String>,
    speed: Option<u32>,
    configured_clock_speed: Option<u32>,
    #[serde(rename = "SMBIOSMemoryType")]
    smbios_memory_type: Option<u32>,
}

/// SMBIOS memory type codes (SMBIOS spec 7.18.2).
fn memory_type_name(code: u32) -> Option<&'static str> {
    match code {
        20 => Some("DDR"),
        21 => Some("DDR2"),
        24 => Some("DDR3"),
        26 => Some("DDR4"),
        27 => Some("LPDDR"),
        28 => Some("LPDDR2"),
        29 => Some("LPDDR3"),
        30 => Some("LPDDR4"),
        34 => Some("DDR5"),
        35 => Some("LPDDR5"),
        _ => None,
    }
}

pub fn fill_static(cached: &mut StaticMemory) {
    let rows: Vec<Win32PhysicalMemory> = wmi_query(
        None,
        "SELECT DeviceLocator, BankLabel, Capacity, Manufacturer, PartNumber, Speed, \
         ConfiguredClockSpeed, SMBIOSMemoryType FROM Win32_PhysicalMemory",
    );

    let modules: Vec<MemoryModule> = rows
        .into_iter()
        .map(|row| {
            let type_name = row
                .smbios_memory_type
                .and_then(memory_type_name)
                .map(|s| s.to_string());
            MemoryModule {
                locator: row.device_locator.into(),
                bank: row.bank_label.into(),
                size_bytes: row.capacity.and_then(|c| c.parse().ok()).into(),
                manufacturer: row
                    .manufacturer
                    .filter(|m| !m.trim().is_empty())
                    .into(),
                part_number: row.part_number.map(|p| p.trim().to_string()).into(),
                speed_mts: row.speed.into(),
                configured_speed_mts: row.configured_clock_speed.into(),
                memory_type: type_name.into(),
            }
        })
        .collect();

    if let Some(first) = modules.first() {
        cached.memory_type = first.memory_type.clone();
    }
    cached.module_count = Field::Ok(modules.len() as u32);
    cached.modules = modules;
}
