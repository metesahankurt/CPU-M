use super::Field;
use serde::Serialize;

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DisplayInfo {
    pub name: Field<String>,
    /// Native pixels, e.g. "2940 x 1912".
    pub resolution: Field<String>,
    /// Logical (scaled) resolution, e.g. "1470 x 956".
    pub logical_resolution: Field<String>,
    pub refresh_rate_hz: Field<f64>,
    pub scale_factor: Field<f64>,
    pub color_depth_bits: Field<u32>,
    pub is_main: Field<bool>,
    pub is_internal: Field<bool>,
    /// e.g. "Built-in Liquid Retina".
    pub display_type: Field<String>,
    pub connection: Field<String>,
    pub hdr: Field<bool>,
}
