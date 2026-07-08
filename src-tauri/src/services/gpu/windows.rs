use crate::models::gpu::GpuInfo;
use crate::models::Field;
use crate::util::windows::wmi_query;
use serde::Deserialize;

#[derive(Deserialize)]
#[serde(rename_all = "PascalCase")]
struct Win32VideoController {
    name: Option<String>,
    adapter_compatibility: Option<String>,
    driver_version: Option<String>,
    #[serde(rename = "PNPDeviceID")]
    pnp_device_id: Option<String>,
}

pub fn collect() -> Vec<GpuInfo> {
    let dxgi = dxgi_adapters();
    let controllers: Vec<Win32VideoController> = wmi_query(
        None,
        "SELECT Name, AdapterCompatibility, DriverVersion, PNPDeviceID \
         FROM Win32_VideoController",
    );

    controllers
        .into_iter()
        .map(|c| {
            // Match DXGI adapter by name for accurate VRAM (AdapterRAM caps at 4GB).
            let dxgi_match = c
                .name
                .as_deref()
                .and_then(|name| dxgi.iter().find(|a| a.description == name));
            let (vram, shared) = match dxgi_match {
                Some(a) if a.dedicated_video_memory > 0 => {
                    (Some(a.dedicated_video_memory), false)
                }
                Some(a) => (Some(a.shared_system_memory), true),
                None => (None, false),
            };
            let is_integrated = c
                .name
                .as_deref()
                .map(|n| {
                    let n = n.to_lowercase();
                    n.contains("intel") && !n.contains("arc")
                        || n.contains("radeon(tm) graphics")
                })
                .unwrap_or(false)
                || shared;

            GpuInfo {
                name: c.name.clone().into(),
                vendor: c.adapter_compatibility.into(),
                gpu_type: Field::Ok(
                    if is_integrated { "integrated" } else { "discrete" }.to_string(),
                ),
                vram_bytes: vram.into(),
                shared_memory: Field::Ok(shared),
                core_count: Field::Unavailable,
                metal_support: Field::Unavailable,
                driver_version: c.driver_version.into(),
                device_id: c.pnp_device_id.into(),
            }
        })
        .collect()
}

struct DxgiAdapter {
    description: String,
    dedicated_video_memory: u64,
    shared_system_memory: u64,
}

fn dxgi_adapters() -> Vec<DxgiAdapter> {
    use ::windows::Win32::Graphics::Dxgi::{CreateDXGIFactory1, IDXGIFactory1};

    let mut adapters = Vec::new();
    // SAFETY: standard DXGI factory enumeration; failures are swallowed.
    unsafe {
        let Ok(factory) = CreateDXGIFactory1::<IDXGIFactory1>() else {
            return adapters;
        };
        let mut i = 0;
        while let Ok(adapter) = factory.EnumAdapters1(i) {
            if let Ok(desc) = adapter.GetDesc1() {
                let name = String::from_utf16_lossy(
                    &desc.Description[..desc
                        .Description
                        .iter()
                        .position(|&c| c == 0)
                        .unwrap_or(desc.Description.len())],
                );
                // Skip the software rasterizer.
                if !name.contains("Microsoft Basic Render") {
                    adapters.push(DxgiAdapter {
                        description: name,
                        dedicated_video_memory: desc.DedicatedVideoMemory as u64,
                        shared_system_memory: desc.SharedSystemMemory as u64,
                    });
                }
            }
            i += 1;
        }
    }
    adapters
}
