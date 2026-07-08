use super::{PlatformSensors, SensorReading};

pub fn fill_extra_readings(_readings: &mut Vec<SensorReading>) {}

pub fn platform_state() -> PlatformSensors {
    PlatformSensors {
        thermal_state: None,
        fan_count: None,
        notes: Vec::new(),
    }
}
