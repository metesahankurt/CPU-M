#[cfg(target_os = "macos")]
mod macos;
#[cfg(windows)]
mod windows;

use crate::models::battery::{BatteryDeviceInfo, BatteryInfo};
use crate::models::Field;
use starship_battery::units::{
    electric_potential::volt, energy::watt_hour, power::watt, ratio::percent,
    thermodynamic_temperature::degree_celsius, time::second,
};

pub fn collect() -> BatteryInfo {
    let mut batteries = collect_batteries();

    #[cfg(target_os = "macos")]
    {
        macos::fill_health_details(&mut batteries);
    }
    #[cfg(windows)]
    {
        windows::fill_health_details(&mut batteries);
    }

    let power = platform_power_info();
    BatteryInfo {
        batteries,
        power_source: power.power_source.into(),
        ac_adapter_connected: power.ac_adapter_connected.into(),
        ac_adapter_watts: power.ac_adapter_watts.into(),
        low_power_mode: power.low_power_mode.into(),
    }
}

#[derive(Debug, Clone, Default)]
struct PowerInfo {
    power_source: Option<String>,
    ac_adapter_connected: Option<bool>,
    ac_adapter_watts: Option<u32>,
    low_power_mode: Option<bool>,
}

fn collect_batteries() -> Vec<BatteryDeviceInfo> {
    let Ok(manager) = starship_battery::Manager::new() else {
        return Vec::new();
    };
    let Ok(iter) = manager.batteries() else {
        return Vec::new();
    };

    iter.filter_map(Result::ok)
        .map(|battery| BatteryDeviceInfo {
            vendor: battery.vendor().map(ToString::to_string).into(),
            model: battery.model().map(ToString::to_string).into(),
            serial_number: battery.serial_number().map(ToString::to_string).into(),
            technology: Field::Ok(format!("{:?}", battery.technology())),
            state: Field::Ok(format!("{:?}", battery.state())),
            percentage: Field::Ok(battery.state_of_charge().get::<percent>()),
            health_percent: Field::Ok(battery.state_of_health().get::<percent>()),
            cycle_count: battery.cycle_count().into(),
            energy_wh: Field::Ok(battery.energy().get::<watt_hour>()),
            energy_full_wh: Field::Ok(battery.energy_full().get::<watt_hour>()),
            energy_full_design_wh: Field::Ok(battery.energy_full_design().get::<watt_hour>()),
            power_draw_w: Field::Ok(battery.energy_rate().get::<watt>()),
            voltage_v: Field::Ok(battery.voltage().get::<volt>()),
            temperature_celsius: battery
                .temperature()
                .map(|temp| temp.get::<degree_celsius>())
                .into(),
            time_to_empty_seconds: battery
                .time_to_empty()
                .map(|time| time.get::<second>() as u64)
                .into(),
            time_to_full_seconds: battery
                .time_to_full()
                .map(|time| time.get::<second>() as u64)
                .into(),
        })
        .collect()
}

fn platform_power_info() -> PowerInfo {
    #[cfg(target_os = "macos")]
    {
        return macos::power_info();
    }
    #[cfg(windows)]
    {
        return windows::power_info();
    }
    #[allow(unreachable_code)]
    PowerInfo::default()
}

#[cfg(test)]
mod tests {
    #[test]
    fn battery_collects() {
        let info = super::collect();
        let json = serde_json::to_string_pretty(&info).expect("serializes");
        println!("{json}");
    }
}
