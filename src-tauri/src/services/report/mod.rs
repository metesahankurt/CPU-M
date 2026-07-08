use crate::models::report::SystemReport;
use serde_json::{json, Value};
use std::time::{SystemTime, UNIX_EPOCH};

pub fn generate(app: &tauri::AppHandle, mask_sensitive: bool) -> SystemReport {
    let mut value = json!({
        "generatedAtUnix": now_unix(),
        "platform": crate::platform::detect(),
        "system": crate::services::system::collect(),
        "cpuStatic": crate::services::cpu::collect_static(),
        "cpuDynamic": crate::services::cpu::collect_dynamic(),
        "memory": crate::services::memory::collect(),
        "gpus": crate::services::gpu::collect(),
        "storage": crate::services::storage::collect(),
        "displays": crate::services::display::collect(app),
        "network": crate::services::network::collect(),
        "battery": crate::services::battery::collect(),
        "mainboard": crate::services::mainboard::collect(),
        "security": crate::services::security::collect(),
        "license": crate::services::license::collect(),
        "sensors": crate::services::sensors::collect(),
    });

    if mask_sensitive {
        redact_sensitive(&mut value, None);
    }

    let json = serde_json::to_string_pretty(&value).unwrap_or_else(|_| "{}".to_string());
    let text = text_report(&value);
    SystemReport { json, text }
}

pub fn write_file(path: &str, contents: &str) -> Result<(), String> {
    std::fs::write(path, contents).map_err(|e| e.to_string())
}

fn now_unix() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_secs())
        .unwrap_or_default()
}

fn redact_sensitive(value: &mut Value, key: Option<&str>) {
    if key.is_some_and(is_sensitive_key) {
        *value = match value {
            Value::Array(_) => Value::Array(Vec::new()),
            Value::Object(map) if map.contains_key("status") => {
                json!({ "status": "ok", "value": "••••" })
            }
            _ => Value::String("••••".to_string()),
        };
        return;
    }

    match value {
        Value::Object(map) => {
            for (k, v) in map.iter_mut() {
                redact_sensitive(v, Some(k));
            }
        }
        Value::Array(items) => {
            for item in items {
                redact_sensitive(item, key);
            }
        }
        _ => {}
    }
}

fn is_sensitive_key(key: &str) -> bool {
    let key = key.to_lowercase();
    key.contains("username")
        || key.contains("computername")
        || key.contains("serialnumber")
        || key.contains("serial")
        || key.contains("macaddress")
        || key.contains("ipaddresses")
        || key.contains("hardwareuuid")
        || key.contains("uuid")
        || key.contains("partialproductkey")
}

fn text_report(value: &Value) -> String {
    let mut out = String::from("CPU-M System Report\n\n");
    write_value(&mut out, value, 0, None);
    out
}

fn write_value(out: &mut String, value: &Value, depth: usize, key: Option<&str>) {
    let indent = "  ".repeat(depth);
    match value {
        Value::Object(map) if is_field_object(map) => {
            let line_key = key.unwrap_or("value");
            let display = field_display(value);
            out.push_str(&format!("{indent}{line_key}: {display}\n"));
        }
        Value::Object(map) => {
            if let Some(key) = key {
                out.push_str(&format!("{indent}{key}\n"));
            }
            for (k, v) in map {
                write_value(out, v, depth + usize::from(key.is_some()), Some(k));
            }
        }
        Value::Array(items) => {
            let line_key = key.unwrap_or("items");
            if items.is_empty() {
                out.push_str(&format!("{indent}{line_key}: —\n"));
            } else if items.iter().all(Value::is_string) {
                let joined = items
                    .iter()
                    .filter_map(Value::as_str)
                    .collect::<Vec<_>>()
                    .join(", ");
                out.push_str(&format!("{indent}{line_key}: {joined}\n"));
            } else {
                out.push_str(&format!("{indent}{line_key}\n"));
                for item in items {
                    write_value(out, item, depth + 1, Some("-"));
                }
            }
        }
        _ => {
            let line_key = key.unwrap_or("value");
            out.push_str(&format!("{indent}{line_key}: {}\n", scalar_display(value)));
        }
    }
}

fn is_field_object(map: &serde_json::Map<String, Value>) -> bool {
    map.get("status").and_then(Value::as_str).is_some()
        && (map.contains_key("value") || map.len() == 1)
}

fn field_display(value: &Value) -> String {
    let status = value
        .get("status")
        .and_then(Value::as_str)
        .unwrap_or("unavailable");
    match status {
        "ok" => value
            .get("value")
            .map(scalar_display)
            .unwrap_or_else(|| "—".to_string()),
        "requires_admin" => "requires admin".to_string(),
        _ => "unavailable".to_string(),
    }
}

fn scalar_display(value: &Value) -> String {
    match value {
        Value::Null => "—".to_string(),
        Value::Bool(v) => v.to_string(),
        Value::Number(v) => v.to_string(),
        Value::String(v) => v.clone(),
        other => other.to_string(),
    }
}
