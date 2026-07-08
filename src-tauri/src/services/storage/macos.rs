use crate::models::storage::PhysicalDisk;
use crate::models::Field;
use crate::util::macos::run_cmd;
use serde_json::Value;
use std::process::Command;

pub fn physical_disks() -> Vec<PhysicalDisk> {
    whole_disk_identifiers()
        .into_iter()
        .filter_map(|id| disk_info(&id))
        .collect()
}

fn whole_disk_identifiers() -> Vec<String> {
    let Some(plist) = run_plist(&["list", "-plist", "physical"]) else {
        return Vec::new();
    };
    plist
        .get("WholeDisks")
        .and_then(Value::as_array)
        .map(|arr| {
            arr.iter()
                .filter_map(Value::as_str)
                .map(|s| s.to_string())
                .collect()
        })
        .unwrap_or_default()
}

fn disk_info(identifier: &str) -> Option<PhysicalDisk> {
    let info = run_plist(&["info", "-plist", identifier])?;
    let str_of = |key: &str| {
        info.get(key)
            .and_then(Value::as_str)
            .filter(|s| !s.is_empty())
            .map(|s| s.to_string())
    };
    let bool_of = |key: &str| info.get(key).and_then(Value::as_bool);

    let solid_state = bool_of("SolidState");
    let bus = str_of("BusProtocol");
    let kind = match (solid_state, bus.as_deref()) {
        (Some(true), Some("Apple Fabric")) => Some("NVMe SSD (Apple)".to_string()),
        (Some(true), Some(b)) if b.contains("NVMe") || b.contains("PCI") => {
            Some("NVMe SSD".to_string())
        }
        (Some(true), _) => Some("SSD".to_string()),
        (Some(false), _) => Some("HDD".to_string()),
        (None, _) => None,
    };

    Some(PhysicalDisk {
        identifier: Field::Ok(identifier.to_string()),
        model: str_of("MediaName")
            .or_else(|| str_of("IORegistryEntryName"))
            .into(),
        size_bytes: info
            .get("TotalSize")
            .or_else(|| info.get("Size"))
            .and_then(Value::as_u64)
            .into(),
        kind: kind.into(),
        bus: bus.into(),
        internal: bool_of("Internal").into(),
        removable: bool_of("RemovableMediaOrExternalDevice")
            .or_else(|| bool_of("Removable"))
            .into(),
        serial_number: str_of("MediaSerialNumber").into(),
        smart_status: str_of("SMARTStatus").into(),
    })
}

/// Run diskutil with -plist and convert the XML plist output to JSON values.
fn run_plist(args: &[&str]) -> Option<Value> {
    let output = Command::new("diskutil").args(args).output().ok()?;
    if !output.status.success() {
        return None;
    }
    plist::from_bytes::<plist::Value>(&output.stdout)
        .ok()
        .and_then(|v| serde_json::to_value(v).ok())
}
