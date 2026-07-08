#[cfg(target_os = "macos")]
mod macos;
#[cfg(windows)]
mod windows;

use crate::models::cpu::{CpuDynamicInfo, CpuStaticInfo};
use crate::models::Field;
use std::sync::{Mutex, OnceLock};
use sysinfo::{CpuRefreshKind, RefreshKind, System};

/// Persistent System instance so successive refreshes yield usage deltas
/// (sysinfo computes usage between two refresh calls).
fn cpu_system() -> &'static Mutex<System> {
    static SYSTEM: OnceLock<Mutex<System>> = OnceLock::new();
    SYSTEM.get_or_init(|| {
        Mutex::new(System::new_with_specifics(
            RefreshKind::nothing().with_cpu(CpuRefreshKind::everything()),
        ))
    })
}

pub fn collect_static() -> CpuStaticInfo {
    let sys = cpu_system().lock().expect("cpu system lock");
    let first = sys.cpus().first();

    let mut info = CpuStaticInfo {
        vendor: first
            .map(|c| c.vendor_id().to_string())
            .filter(|v| !v.is_empty())
            .into(),
        brand: first
            .map(|c| c.brand().trim().to_string())
            .filter(|b| !b.is_empty())
            .into(),
        architecture: Field::Ok(std::env::consts::ARCH.to_string()),
        physical_cores: System::physical_core_count()
            .map(|c| c as u32)
            .into(),
        logical_cores: Field::Ok(sys.cpus().len() as u32),
        performance_cores: Field::Unavailable,
        efficiency_cores: Field::Unavailable,
        base_frequency_mhz: Field::Unavailable,
        max_frequency_mhz: Field::Unavailable,
        caches: Vec::new(),
        instruction_sets: Field::Unavailable,
        virtualization_support: Field::Unavailable,
    };
    drop(sys);

    #[cfg(target_os = "macos")]
    macos::fill_static(&mut info);
    #[cfg(windows)]
    windows::fill_static(&mut info);

    info
}

pub fn collect_dynamic() -> CpuDynamicInfo {
    let mut sys = cpu_system().lock().expect("cpu system lock");
    sys.refresh_cpu_all();

    let per_core: Vec<f32> = sys.cpus().iter().map(|c| c.cpu_usage()).collect();
    let global = sys.global_cpu_usage();
    // sysinfo reports 0 for frequency on platforms where it cannot read it.
    let freq = sys.cpus().first().map(|c| c.frequency()).unwrap_or(0);

    let info = CpuDynamicInfo {
        global_usage_percent: Field::Ok(global),
        per_core_usage_percent: per_core,
        current_frequency_mhz: if freq > 0 {
            Field::Ok(freq)
        } else {
            Field::Unavailable
        },
        temperature_celsius: Field::RequiresAdmin,
        power_watts: Field::RequiresAdmin,
    };
    drop(sys);

    #[cfg(windows)]
    {
        let mut info = info;
        windows::fill_dynamic(&mut info);
        info
    }
    #[cfg(not(windows))]
    {
        info
    }
}

#[cfg(test)]
mod tests {
    #[test]
    fn static_info_collects() {
        let info = super::collect_static();
        let json = serde_json::to_string_pretty(&info).expect("serializes");
        println!("{json}");
    }

    #[test]
    fn dynamic_info_collects() {
        super::collect_dynamic();
        std::thread::sleep(std::time::Duration::from_millis(250));
        let info = super::collect_dynamic();
        let json = serde_json::to_string_pretty(&info).expect("serializes");
        println!("{json}");
    }
}
