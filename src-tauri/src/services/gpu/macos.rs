use crate::models::gpu::GpuInfo;
use crate::models::Field;
use crate::util::macos::run_cmd;
use serde_json::Value;

pub fn collect() -> Vec<GpuInfo> {
    let Some(out) = run_cmd("system_profiler", &["SPDisplaysDataType", "-json"]) else {
        return Vec::new();
    };
    let Ok(parsed) = serde_json::from_str::<Value>(&out) else {
        return Vec::new();
    };
    let Some(cards) = parsed.get("SPDisplaysDataType").and_then(Value::as_array) else {
        return Vec::new();
    };

    cards.iter().map(parse_card).collect()
}

fn parse_card(card: &Value) -> GpuInfo {
    let get = |key: &str| {
        card.get(key)
            .and_then(Value::as_str)
            .map(|s| s.to_string())
    };

    let vendor = get("spdisplays_vendor")
        .map(|v| v.trim_start_matches("sppci_vendor_").to_string());
    let integrated = get("sppci_bus")
        .map(|b| b.contains("builtin"))
        .unwrap_or(false);
    let apple_silicon = crate::platform::detect().is_apple_silicon;

    // Intel Macs report VRAM as a display string, e.g. "1536 MB".
    let vram = get("spdisplays_vram")
        .or_else(|| get("spdisplays_vram_shared"))
        .and_then(|s| parse_vram(&s));

    GpuInfo {
        name: get("sppci_model").into(),
        vendor: vendor.into(),
        gpu_type: Field::Ok(if integrated { "integrated" } else { "discrete" }.to_string()),
        vram_bytes: vram.into(),
        shared_memory: Field::Ok(apple_silicon || integrated),
        core_count: get("sppci_cores").and_then(|c| c.parse().ok()).into(),
        metal_support: get("spdisplays_mtlgpufamilysupport")
            .map(|m| prettify_metal(&m))
            .into(),
        driver_version: Field::Unavailable,
        device_id: get("spdisplays_device-id").into(),
    }
}

/// "spdisplays_metal4" -> "Metal 4", "spdisplays_metal3" -> "Metal 3"
fn prettify_metal(raw: &str) -> String {
    let tail = raw.trim_start_matches("spdisplays_");
    if let Some(version) = tail.strip_prefix("metal") {
        if version.is_empty() {
            "Metal".to_string()
        } else {
            format!("Metal {version}")
        }
    } else {
        tail.to_string()
    }
}

/// "1536 MB" -> bytes
fn parse_vram(text: &str) -> Option<u64> {
    let mut parts = text.split_whitespace();
    let value: u64 = parts.next()?.parse().ok()?;
    match parts.next()?.to_uppercase().as_str() {
        "GB" => Some(value * 1024 * 1024 * 1024),
        "MB" => Some(value * 1024 * 1024),
        _ => None,
    }
}
