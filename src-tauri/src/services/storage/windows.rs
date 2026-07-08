use crate::models::storage::PhysicalDisk;
use crate::models::Field;
use crate::util::windows::wmi_query;
use serde::Deserialize;

#[derive(Deserialize)]
#[serde(rename_all = "PascalCase")]
struct MsftPhysicalDisk {
    friendly_name: Option<String>,
    device_id: Option<String>,
    media_type: Option<u16>,
    bus_type: Option<u16>,
    size: Option<String>,
    serial_number: Option<String>,
    health_status: Option<u16>,
}

/// MSFT_PhysicalDisk.MediaType
fn media_type_name(code: u16, bus: Option<u16>) -> Option<String> {
    match code {
        3 => Some("HDD".to_string()),
        4 => Some(if bus == Some(17) {
            "NVMe SSD".to_string()
        } else {
            "SSD".to_string()
        }),
        5 => Some("SCM".to_string()),
        _ => None,
    }
}

/// MSFT_PhysicalDisk.BusType
fn bus_type_name(code: u16) -> Option<&'static str> {
    match code {
        1 => Some("SCSI"),
        2 => Some("ATAPI"),
        3 => Some("ATA"),
        7 => Some("USB"),
        8 => Some("RAID"),
        10 => Some("SAS"),
        11 => Some("SATA"),
        12 => Some("SD"),
        17 => Some("NVMe"),
        _ => None,
    }
}

/// MSFT_PhysicalDisk.HealthStatus
fn health_name(code: u16) -> &'static str {
    match code {
        0 => "Healthy",
        1 => "Warning",
        2 => "Unhealthy",
        _ => "Unknown",
    }
}

pub fn physical_disks() -> Vec<PhysicalDisk> {
    let rows: Vec<MsftPhysicalDisk> = wmi_query(
        Some("root\\microsoft\\windows\\storage"),
        "SELECT FriendlyName, DeviceId, MediaType, BusType, Size, SerialNumber, \
         HealthStatus FROM MSFT_PhysicalDisk",
    );

    rows.into_iter()
        .map(|d| {
            let removable = d.bus_type == Some(7) || d.bus_type == Some(12);
            PhysicalDisk {
                identifier: d
                    .device_id
                    .map(|id| format!("PhysicalDrive{id}"))
                    .into(),
                model: d.friendly_name.into(),
                size_bytes: d.size.and_then(|s| s.parse().ok()).into(),
                kind: d
                    .media_type
                    .and_then(|m| media_type_name(m, d.bus_type))
                    .into(),
                bus: d
                    .bus_type
                    .and_then(bus_type_name)
                    .map(|s| s.to_string())
                    .into(),
                internal: Field::Ok(!removable),
                removable: Field::Ok(removable),
                serial_number: d
                    .serial_number
                    .map(|s| s.trim().to_string())
                    .filter(|s| !s.is_empty())
                    .into(),
                smart_status: d.health_status.map(|h| health_name(h).to_string()).into(),
            }
        })
        .collect()
}
