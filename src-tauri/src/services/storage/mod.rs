#[cfg(target_os = "macos")]
mod macos;
#[cfg(windows)]
mod windows;

use crate::models::storage::{StorageInfo, VolumeInfo};
use crate::models::Field;
use sysinfo::Disks;

pub fn collect() -> StorageInfo {
    let mut info = StorageInfo {
        disks: Vec::new(),
        volumes: volumes(),
    };

    #[cfg(target_os = "macos")]
    {
        info.disks = macos::physical_disks();
    }
    #[cfg(windows)]
    {
        info.disks = windows::physical_disks();
    }

    info
}

/// Mounted volumes via sysinfo — cross-platform (drive letters on Windows,
/// mount points on macOS).
fn volumes() -> Vec<VolumeInfo> {
    let disks = Disks::new_with_refreshed_list();
    disks
        .iter()
        // APFS mounts many system snapshots; hide the read-only system ones.
        .filter(|d| {
            let mount = d.mount_point().to_string_lossy().to_string();
            !mount.starts_with("/System/Volumes/")
                || mount == "/System/Volumes/Data"
        })
        .map(|d| {
            let total = d.total_space();
            let available = d.available_space();
            let used = total.saturating_sub(available);
            VolumeInfo {
                name: Field::Ok(d.name().to_string_lossy().to_string()),
                mount_point: Field::Ok(d.mount_point().to_string_lossy().to_string()),
                filesystem: Field::Ok(d.file_system().to_string_lossy().to_string()),
                total_bytes: Field::Ok(total),
                available_bytes: Field::Ok(available),
                used_bytes: Field::Ok(used),
                usage_percent: if total > 0 {
                    Field::Ok((used as f32 / total as f32) * 100.0)
                } else {
                    Field::Unavailable
                },
                is_removable: Field::Ok(d.is_removable()),
                is_system: Field::Ok({
                    let mount = d.mount_point().to_string_lossy().to_string();
                    mount == "/" || mount == "/System/Volumes/Data" || mount == "C:\\"
                }),
            }
        })
        .collect()
}

#[cfg(test)]
mod tests {
    #[test]
    fn storage_collects() {
        let info = super::collect();
        let json = serde_json::to_string_pretty(&info).expect("serializes");
        println!("{json}");
        assert!(!info.volumes.is_empty());
    }
}
