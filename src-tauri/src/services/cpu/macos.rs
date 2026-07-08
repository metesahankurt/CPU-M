use crate::models::cpu::{CacheEntry, CpuStaticInfo};
use crate::models::Field;
use crate::util::macos::{sysctl_string, sysctl_u64};

/// Curated list of ARM features worth surfacing (CPU-X style instruction list).
const ARM_FEATURES: &[(&str, &str)] = &[
    ("hw.optional.neon", "NEON"),
    ("hw.optional.arm.FEAT_AES", "AES"),
    ("hw.optional.arm.FEAT_SHA256", "SHA256"),
    ("hw.optional.arm.FEAT_SHA512", "SHA512"),
    ("hw.optional.arm.FEAT_SHA3", "SHA3"),
    ("hw.optional.arm.FEAT_CRC32", "CRC32"),
    ("hw.optional.arm.FEAT_DotProd", "DotProd"),
    ("hw.optional.arm.FEAT_FP16", "FP16"),
    ("hw.optional.arm.FEAT_BF16", "BF16"),
    ("hw.optional.arm.FEAT_I8MM", "I8MM"),
    ("hw.optional.arm.FEAT_LSE", "LSE"),
    ("hw.optional.arm.FEAT_RDM", "RDM"),
    ("hw.optional.arm.FEAT_SME", "SME"),
    ("hw.optional.arm.FEAT_SME2", "SME2"),
    ("hw.optional.arm.FEAT_PAuth", "PAuth"),
];

pub fn fill_static(info: &mut CpuStaticInfo) {
    if crate::platform::detect().is_apple_silicon {
        info.vendor = Field::Ok("Apple".to_string());
    } else if let Some(vendor) = sysctl_string("machdep.cpu.vendor") {
        info.vendor = Field::Ok(vendor);
    }

    if let Some(brand) = sysctl_string("machdep.cpu.brand_string") {
        info.brand = Field::Ok(brand);
    }

    info.performance_cores = sysctl_u64("hw.perflevel0.physicalcpu")
        .map(|v| v as u32)
        .into();
    info.efficiency_cores = sysctl_u64("hw.perflevel1.physicalcpu")
        .map(|v| v as u32)
        .into();

    // Intel Macs expose fixed frequencies; Apple Silicon does not.
    info.base_frequency_mhz = sysctl_u64("hw.cpufrequency")
        .map(|hz| hz / 1_000_000)
        .into();
    info.max_frequency_mhz = sysctl_u64("hw.cpufrequency_max")
        .map(|hz| hz / 1_000_000)
        .into();

    info.caches = caches();
    info.instruction_sets = Field::Ok(instruction_sets());
    info.virtualization_support = sysctl_u64("kern.hv_support").map(|v| v == 1).into();
}

fn caches() -> Vec<CacheEntry> {
    let mut caches = Vec::new();
    let mut push = |label: &str, key: &str| {
        if let Some(size) = sysctl_u64(key).filter(|s| *s > 0) {
            caches.push(CacheEntry {
                label: label.to_string(),
                size_bytes: size,
            });
        }
    };

    if sysctl_u64("hw.perflevel0.physicalcpu").is_some() {
        // Hybrid (Apple Silicon): per-perflevel caches.
        push("L1 Instruction (P-core)", "hw.perflevel0.l1icachesize");
        push("L1 Data (P-core)", "hw.perflevel0.l1dcachesize");
        push("L2 (P-cluster)", "hw.perflevel0.l2cachesize");
        push("L1 Instruction (E-core)", "hw.perflevel1.l1icachesize");
        push("L1 Data (E-core)", "hw.perflevel1.l1dcachesize");
        push("L2 (E-cluster)", "hw.perflevel1.l2cachesize");
    } else {
        push("L1 Instruction", "hw.l1icachesize");
        push("L1 Data", "hw.l1dcachesize");
        push("L2", "hw.l2cachesize");
        push("L3", "hw.l3cachesize");
    }
    caches
}

fn instruction_sets() -> Vec<String> {
    ARM_FEATURES
        .iter()
        .filter(|(key, _)| sysctl_u64(key).unwrap_or(0) == 1)
        .map(|(_, label)| label.to_string())
        .collect()
}
