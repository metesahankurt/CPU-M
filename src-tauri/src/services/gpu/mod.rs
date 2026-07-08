#[cfg(target_os = "macos")]
mod macos;
#[cfg(windows)]
mod windows;

use crate::models::gpu::GpuInfo;

pub fn collect() -> Vec<GpuInfo> {
    #[cfg(target_os = "macos")]
    {
        macos::collect()
    }
    #[cfg(windows)]
    {
        windows::collect()
    }
    #[cfg(not(any(target_os = "macos", windows)))]
    {
        Vec::new()
    }
}

#[cfg(test)]
mod tests {
    #[test]
    fn gpu_collects() {
        let info = super::collect();
        let json = serde_json::to_string_pretty(&info).expect("serializes");
        println!("{json}");
        assert!(!info.is_empty());
    }
}
