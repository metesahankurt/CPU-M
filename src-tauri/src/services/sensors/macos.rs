use super::{PlatformSensors, SensorReading};
use crate::models::Field;
use crate::services::battery;
use crate::util::macos::run_cmd;

pub fn fill_extra_readings(readings: &mut Vec<SensorReading>) {
    let battery = battery::collect();
    for (index, bat) in battery.batteries.into_iter().enumerate() {
        if let Field::Ok(value) = bat.temperature_celsius {
            readings.push(SensorReading {
                name: format!("Battery {}", index + 1),
                category: "Battery".to_string(),
                value: Field::Ok(value),
                unit: "C".to_string(),
                detail: bat.state.map(|state| format!("State: {state}")),
            });
        }
        if let Field::Ok(value) = bat.power_draw_w {
            readings.push(SensorReading {
                name: format!("Battery Power {}", index + 1),
                category: "Power".to_string(),
                value: Field::Ok(value),
                unit: "W".to_string(),
                detail: Field::Unavailable,
            });
        }
        if let Field::Ok(value) = bat.voltage_v {
            readings.push(SensorReading {
                name: format!("Battery Voltage {}", index + 1),
                category: "Voltage".to_string(),
                value: Field::Ok(value),
                unit: "V".to_string(),
                detail: Field::Unavailable,
            });
        }
    }
}

pub fn platform_state() -> PlatformSensors {
    let mut state = PlatformSensors::default();
    if let Some(output) = run_cmd("pmset", &["-g", "therm"]) {
        let notes: Vec<String> = output
            .lines()
            .map(str::trim)
            .filter(|line| !line.is_empty())
            .map(ToString::to_string)
            .collect();
        if notes
            .iter()
            .any(|line| line.to_lowercase().contains("no thermal warning"))
        {
            state.thermal_state = Some("Normal".to_string());
        }
        state.notes = notes;
    }
    state
}
