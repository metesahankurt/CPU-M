#[cfg(target_os = "macos")]
mod macos;
#[cfg(windows)]
mod windows;

use crate::models::memory::MemoryInfo;
use crate::models::Field;
use std::sync::OnceLock;
use sysinfo::{MemoryRefreshKind, RefreshKind, System};

/// Static part (type, modules, unified) is expensive on some platforms
/// (system_profiler / WMI), so it is collected once and cached.
struct StaticMemory {
    memory_type: Field<String>,
    is_unified: Field<bool>,
    module_count: Field<u32>,
    modules: Vec<crate::models::memory::MemoryModule>,
}

fn static_memory() -> &'static StaticMemory {
    static CACHE: OnceLock<StaticMemory> = OnceLock::new();
    CACHE.get_or_init(|| {
        let mut cached = StaticMemory {
            memory_type: Field::Unavailable,
            is_unified: Field::Ok(false),
            module_count: Field::Unavailable,
            modules: Vec::new(),
        };
        #[cfg(target_os = "macos")]
        macos::fill_static(&mut cached);
        #[cfg(windows)]
        windows::fill_static(&mut cached);
        cached
    })
}

pub fn collect() -> MemoryInfo {
    let mut sys = System::new_with_specifics(
        RefreshKind::nothing().with_memory(MemoryRefreshKind::everything()),
    );
    sys.refresh_memory();

    let total = sys.total_memory();
    let used = sys.used_memory();
    let cached = static_memory();

    MemoryInfo {
        total_bytes: Field::Ok(total),
        used_bytes: Field::Ok(used),
        available_bytes: Field::Ok(sys.available_memory()),
        free_bytes: Field::Ok(sys.free_memory()),
        usage_percent: if total > 0 {
            Field::Ok((used as f32 / total as f32) * 100.0)
        } else {
            Field::Unavailable
        },
        swap_total_bytes: Field::Ok(sys.total_swap()),
        swap_used_bytes: Field::Ok(sys.used_swap()),
        memory_type: cached.memory_type.clone(),
        is_unified: cached.is_unified.clone(),
        module_count: cached.module_count.clone(),
        modules: cached.modules.clone(),
    }
}

#[cfg(test)]
mod tests {
    #[test]
    fn memory_collects() {
        let info = super::collect();
        let json = serde_json::to_string_pretty(&info).expect("serializes");
        println!("{json}");
    }
}
