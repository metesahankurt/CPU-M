use crate::models::display::DisplayInfo;
use crate::models::Field;
use crate::util::macos::run_cmd;
use serde_json::Value;

pub fn collect() -> Vec<DisplayInfo> {
    let Some(out) = run_cmd("system_profiler", &["SPDisplaysDataType", "-json"]) else {
        return Vec::new();
    };
    let Ok(parsed) = serde_json::from_str::<Value>(&out) else {
        return Vec::new();
    };
    let Some(cards) = parsed.get("SPDisplaysDataType").and_then(Value::as_array) else {
        return Vec::new();
    };

    cards
        .iter()
        .flat_map(|card| {
            card.get("spdisplays_ndrvs")
                .and_then(Value::as_array)
                .map(|displays| displays.iter().map(parse_display).collect::<Vec<_>>())
                .unwrap_or_default()
        })
        .collect()
}

fn parse_display(display: &Value) -> DisplayInfo {
    let get = |key: &str| {
        display
            .get(key)
            .and_then(Value::as_str)
            .map(|s| s.to_string())
    };
    let flag = |key: &str| get(key).map(|v| v.ends_with("_yes"));

    // "1470 x 956 @ 60.00Hz" -> logical resolution + refresh rate
    let resolution_text = get("_spdisplays_resolution");
    let (logical, refresh) = resolution_text
        .as_deref()
        .map(parse_resolution)
        .unwrap_or((None, None));
    let pixels = get("_spdisplays_pixels");

    // Scale = native width / logical width (e.g. 2940/1470 = 2).
    let scale = match (pixels.as_deref(), logical.as_deref()) {
        (Some(native), Some(log)) => {
            let nw: Option<f64> = native.split(' ').next().and_then(|v| v.parse().ok());
            let lw: Option<f64> = log.split(' ').next().and_then(|v| v.parse().ok());
            match (nw, lw) {
                (Some(n), Some(l)) if l > 0.0 => Some(n / l),
                _ => None,
            }
        }
        _ => None,
    };

    let connection = get("spdisplays_connection_type")
        .map(|c| c.trim_start_matches("spdisplays_").to_string());
    let internal = connection.as_deref().map(|c| c == "internal");

    DisplayInfo {
        name: get("_name").into(),
        resolution: pixels.into(),
        logical_resolution: logical.into(),
        refresh_rate_hz: refresh.into(),
        scale_factor: scale.into(),
        color_depth_bits: get("spdisplays_depth").and_then(|d| parse_depth(&d)).into(),
        is_main: flag("spdisplays_main").into(),
        is_internal: internal.into(),
        display_type: get("spdisplays_display_type")
            .map(|t| prettify(t.trim_start_matches("spdisplays_")))
            .into(),
        connection: connection.into(),
        hdr: Field::Unavailable,
    }
}

/// "1470 x 956 @ 60.00Hz" -> (Some("1470 x 956"), Some(60.0))
fn parse_resolution(text: &str) -> (Option<String>, Option<f64>) {
    let mut parts = text.split('@');
    let res = parts.next().map(|s| s.trim().to_string());
    let refresh = parts
        .next()
        .and_then(|s| s.trim().trim_end_matches("Hz").parse().ok());
    (res, refresh)
}

/// "CGSThirtyBitColor" -> 30, "CGSThirtytwoBitColor" -> 32
fn parse_depth(raw: &str) -> Option<u32> {
    let lower = raw.to_lowercase();
    if lower.contains("thirtytwo") {
        Some(32)
    } else if lower.contains("thirty") {
        Some(30)
    } else if lower.contains("twentyfour") {
        Some(24)
    } else {
        None
    }
}

/// "built-in-liquid-retina" -> "Built-in Liquid Retina"
fn prettify(raw: &str) -> String {
    raw.split('-')
        .map(|word| {
            let mut chars = word.chars();
            match chars.next() {
                Some(first) => first.to_uppercase().collect::<String>() + chars.as_str(),
                None => String::new(),
            }
        })
        .collect::<Vec<_>>()
        .join(" ")
}
