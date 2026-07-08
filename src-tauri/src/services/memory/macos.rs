use super::StaticMemory;
use crate::models::Field;
use crate::util::macos::run_cmd;
use serde_json::Value;

pub fn fill_static(cached: &mut StaticMemory) {
    let apple_silicon = crate::platform::detect().is_apple_silicon;
    cached.is_unified = Field::Ok(apple_silicon);

    let Some(out) = run_cmd("system_profiler", &["SPMemoryDataType", "-json"]) else {
        return;
    };
    let Ok(parsed) = serde_json::from_str::<Value>(&out) else {
        return;
    };
    let Some(entries) = parsed.get("SPMemoryDataType").and_then(Value::as_array) else {
        return;
    };

    if apple_silicon {
        // Unified memory: a single entry with dimm_type/dimm_manufacturer.
        if let Some(entry) = entries.first() {
            cached.memory_type = entry
                .get("dimm_type")
                .and_then(Value::as_str)
                .map(|s| s.to_string())
                .into();
        }
        cached.module_count = Field::Unavailable;
    } else {
        // Intel Macs list one entry per DIMM slot.
        let modules: Vec<_> = entries
            .iter()
            .filter(|e| {
                e.get("dimm_size")
                    .and_then(Value::as_str)
                    .map(|s| s.to_lowercase() != "empty")
                    .unwrap_or(false)
            })
            .map(|e| {
                let get = |key: &str| {
                    e.get(key)
                        .and_then(Value::as_str)
                        .map(|s| s.to_string())
                };
                crate::models::memory::MemoryModule {
                    locator: e
                        .get("_name")
                        .and_then(Value::as_str)
                        .map(|s| s.to_string())
                        .into(),
                    bank: Field::Unavailable,
                    size_bytes: get("dimm_size")
                        .and_then(|s| parse_size(&s))
                        .into(),
                    manufacturer: get("dimm_manufacturer").into(),
                    part_number: get("dimm_part_number").into(),
                    speed_mts: get("dimm_speed").and_then(|s| parse_speed(&s)).into(),
                    configured_speed_mts: Field::Unavailable,
                    memory_type: get("dimm_type").into(),
                }
            })
            .collect();
        cached.module_count = Field::Ok(modules.len() as u32);
        if let Some(first) = entries.first() {
            cached.memory_type = first
                .get("dimm_type")
                .and_then(Value::as_str)
                .map(|s| s.to_string())
                .into();
        }
        cached.modules = modules;
    }
}

/// "16 GB" -> bytes
fn parse_size(text: &str) -> Option<u64> {
    let mut parts = text.split_whitespace();
    let value: u64 = parts.next()?.parse().ok()?;
    let unit = parts.next()?.to_uppercase();
    let mult = match unit.as_str() {
        "GB" => 1024u64.pow(3),
        "MB" => 1024u64.pow(2),
        "TB" => 1024u64.pow(4),
        _ => return None,
    };
    Some(value * mult)
}

/// "2400 MHz" -> 2400
fn parse_speed(text: &str) -> Option<u32> {
    text.split_whitespace().next()?.parse().ok()
}
