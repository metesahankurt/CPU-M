use crate::models::display::DisplayInfo;
use crate::models::Field;
use crate::util::windows::wmi_query;
use serde::Deserialize;

#[derive(Deserialize)]
#[serde(rename_all = "PascalCase")]
struct Win32VideoController {
    current_refresh_rate: Option<u32>,
    current_bits_per_pixel: Option<u32>,
}

#[derive(Deserialize)]
#[serde(rename_all = "PascalCase")]
struct WmiMonitorId {
    user_friendly_name: Option<Vec<u16>>,
    manufacturer_name: Option<Vec<u16>>,
}

fn decode_utf16_name(codes: &[u16]) -> Option<String> {
    let trimmed: Vec<u16> = codes.iter().copied().take_while(|&c| c != 0).collect();
    let name = String::from_utf16_lossy(&trimmed).trim().to_string();
    if name.is_empty() {
        None
    } else {
        Some(name)
    }
}

pub fn collect(app: &tauri::AppHandle) -> Vec<DisplayInfo> {
    let controllers: Vec<Win32VideoController> = wmi_query(
        None,
        "SELECT CurrentRefreshRate, CurrentBitsPerPixel FROM Win32_VideoController",
    );
    let refresh = controllers
        .first()
        .and_then(|c| c.current_refresh_rate)
        .filter(|r| *r > 1);
    let depth = controllers.first().and_then(|c| c.current_bits_per_pixel);

    let monitor_ids: Vec<WmiMonitorId> = wmi_query(
        Some("root\\wmi"),
        "SELECT UserFriendlyName, ManufacturerName FROM WmiMonitorID",
    );

    let monitors = app.available_monitors().unwrap_or_default();
    monitors
        .iter()
        .enumerate()
        .map(|(i, m)| {
            let size = m.size();
            let scale = m.scale_factor();
            let logical_w = (f64::from(size.width) / scale).round() as u32;
            let logical_h = (f64::from(size.height) / scale).round() as u32;
            let friendly = monitor_ids
                .get(i)
                .and_then(|id| id.user_friendly_name.as_deref())
                .and_then(decode_utf16_name);
            let manufacturer = monitor_ids
                .get(i)
                .and_then(|id| id.manufacturer_name.as_deref())
                .and_then(decode_utf16_name);

            DisplayInfo {
                name: friendly
                    .or_else(|| m.name().cloned())
                    .into(),
                resolution: Field::Ok(format!("{} x {}", size.width, size.height)),
                logical_resolution: Field::Ok(format!("{logical_w} x {logical_h}")),
                refresh_rate_hz: refresh.map(f64::from).into(),
                scale_factor: Field::Ok(scale),
                color_depth_bits: depth.into(),
                is_main: Field::Ok(m.position().x == 0 && m.position().y == 0),
                is_internal: Field::Unavailable,
                display_type: manufacturer.into(),
                connection: Field::Unavailable,
                hdr: Field::Unavailable,
            }
        })
        .collect()
}
