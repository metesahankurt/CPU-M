#[cfg(target_os = "macos")]
mod macos;
#[cfg(windows)]
mod windows;

use crate::models::sensors::{SensorReading, SensorsInfo};
use crate::models::Field;
use sysinfo::Components;

pub fn collect() -> SensorsInfo {
    let mut readings = component_readings();

    #[cfg(target_os = "macos")]
    {
        macos::fill_extra_readings(&mut readings);
    }
    #[cfg(windows)]
    {
        windows::fill_extra_readings(&mut readings);
    }

    if !readings.iter().any(|r| r.category == "CPU") {
        readings.push(requires_admin("CPU Temperature", "CPU", "C"));
    }
    if !readings.iter().any(|r| r.category == "GPU") {
        readings.push(unavailable("GPU Temperature", "GPU", "C"));
    }
    if !readings.iter().any(|r| r.category == "Fan") {
        readings.push(requires_admin("Fan Speed", "Fan", "RPM"));
    }

    let platform = platform_state();
    SensorsInfo {
        readings,
        thermal_state: platform.thermal_state.into(),
        fan_count: platform.fan_count.into(),
        notes: platform.notes,
    }
}

#[derive(Debug, Clone, Default)]
struct PlatformSensors {
    thermal_state: Option<String>,
    fan_count: Option<u32>,
    notes: Vec<String>,
}

fn component_readings() -> Vec<SensorReading> {
    let mut components = Components::new_with_refreshed_list();
    components.refresh(true);
    components
        .iter()
        .filter_map(|component| {
            let temp = component.temperature()?;
            if !temp.is_finite() {
                return None;
            }
            let label = component.label().to_string();
            Some(SensorReading {
                category: infer_category(&label),
                name: label,
                value: Field::Ok(temp),
                unit: "C".to_string(),
                detail: component
                    .critical()
                    .map(|c| format!("Critical: {c:.1} C"))
                    .into(),
            })
        })
        .collect()
}

fn platform_state() -> PlatformSensors {
    #[cfg(target_os = "macos")]
    {
        return macos::platform_state();
    }
    #[cfg(windows)]
    {
        return windows::platform_state();
    }
    #[allow(unreachable_code)]
    PlatformSensors::default()
}

fn infer_category(label: &str) -> String {
    let lower = label.to_lowercase();
    if lower.contains("cpu") || lower.contains("package") {
        "CPU"
    } else if lower.contains("gpu") {
        "GPU"
    } else if lower.contains("disk") || lower.contains("ssd") || lower.contains("nvme") {
        "Disk"
    } else {
        "Thermal"
    }
    .to_string()
}

fn unavailable(name: &str, category: &str, unit: &str) -> SensorReading {
    SensorReading {
        name: name.to_string(),
        category: category.to_string(),
        value: Field::Unavailable,
        unit: unit.to_string(),
        detail: Field::Unavailable,
    }
}

fn requires_admin(name: &str, category: &str, unit: &str) -> SensorReading {
    SensorReading {
        name: name.to_string(),
        category: category.to_string(),
        value: Field::RequiresAdmin,
        unit: unit.to_string(),
        detail: Field::RequiresAdmin,
    }
}

#[cfg(test)]
mod tests {
    #[test]
    fn sensors_collects() {
        let info = super::collect();
        let json = serde_json::to_string_pretty(&info).expect("serializes");
        println!("{json}");
    }
}
