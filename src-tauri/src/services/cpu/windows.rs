use crate::models::cpu::{CacheEntry, CpuDynamicInfo, CpuStaticInfo};
use crate::models::Field;
use crate::util::windows::wmi_query;
use serde::Deserialize;

#[derive(Deserialize)]
#[serde(rename_all = "PascalCase")]
struct Win32Processor {
    manufacturer: Option<String>,
    max_clock_speed: Option<u32>,
    number_of_cores: Option<u32>,
    number_of_logical_processors: Option<u32>,
    l2_cache_size: Option<u32>,
    l3_cache_size: Option<u32>,
    virtualization_firmware_enabled: Option<bool>,
}

pub fn fill_static(info: &mut CpuStaticInfo) {
    let processors: Vec<Win32Processor> = wmi_query(
        None,
        "SELECT Manufacturer, MaxClockSpeed, NumberOfCores, NumberOfLogicalProcessors, \
         L2CacheSize, L3CacheSize, VirtualizationFirmwareEnabled FROM Win32_Processor",
    );
    if let Some(p) = processors.into_iter().next() {
        if let Some(m) = p.manufacturer {
            info.vendor = Field::Ok(m);
        }
        // WMI MaxClockSpeed is the rated base clock in MHz.
        info.base_frequency_mhz = p.max_clock_speed.map(u64::from).into();
        if let Some(cores) = p.number_of_cores {
            info.physical_cores = Field::Ok(cores);
        }
        if let Some(logical) = p.number_of_logical_processors {
            info.logical_cores = Field::Ok(logical);
        }
        if let Some(kb) = p.l2_cache_size.filter(|v| *v > 0) {
            info.caches.push(CacheEntry {
                label: "L2".to_string(),
                size_bytes: u64::from(kb) * 1024,
            });
        }
        if let Some(kb) = p.l3_cache_size.filter(|v| *v > 0) {
            info.caches.push(CacheEntry {
                label: "L3".to_string(),
                size_bytes: u64::from(kb) * 1024,
            });
        }
        info.virtualization_support = p.virtualization_firmware_enabled.into();
    }

    #[cfg(target_arch = "x86_64")]
    {
        info.instruction_sets = Field::Ok(x86_instruction_sets());
    }
}

pub fn fill_dynamic(_info: &mut CpuDynamicInfo) {
    // Temperature/power need elevated drivers on Windows; left as RequiresAdmin.
}

#[cfg(target_arch = "x86_64")]
fn x86_instruction_sets() -> Vec<String> {
    let cpuid = raw_cpuid::CpuId::new();
    let mut sets = Vec::new();

    if let Some(f) = cpuid.get_feature_info() {
        let mut add = |cond: bool, name: &str| {
            if cond {
                sets.push(name.to_string());
            }
        };
        add(f.has_sse(), "SSE");
        add(f.has_sse2(), "SSE2");
        add(f.has_sse3(), "SSE3");
        add(f.has_ssse3(), "SSSE3");
        add(f.has_sse41(), "SSE4.1");
        add(f.has_sse42(), "SSE4.2");
        add(f.has_avx(), "AVX");
        add(f.has_fma(), "FMA");
        add(f.has_aesni(), "AES-NI");
        add(f.has_f16c(), "F16C");
        add(f.has_popcnt(), "POPCNT");
    }
    if let Some(ext) = cpuid.get_extended_feature_info() {
        let mut add = |cond: bool, name: &str| {
            if cond {
                sets.push(name.to_string());
            }
        };
        add(ext.has_avx2(), "AVX2");
        add(ext.has_avx512f(), "AVX-512F");
        add(ext.has_bmi1(), "BMI1");
        add(ext.has_bmi2(), "BMI2");
        add(ext.has_sha(), "SHA");
    }
    sets
}
