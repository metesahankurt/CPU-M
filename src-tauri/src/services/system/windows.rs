use crate::models::system::SystemInfo;
use crate::models::Field;
use crate::util::windows::wmi_query;
use serde::Deserialize;

#[derive(Deserialize)]
#[serde(rename_all = "PascalCase")]
struct Win32ComputerSystem {
    manufacturer: Option<String>,
    model: Option<String>,
    #[serde(rename = "UserName")]
    user_name: Option<String>,
}

#[derive(Deserialize)]
#[serde(rename_all = "PascalCase")]
struct Win32OperatingSystem {
    caption: Option<String>,
    build_number: Option<String>,
    #[serde(rename = "OSArchitecture")]
    os_architecture: Option<String>,
}

#[derive(Deserialize)]
#[serde(rename_all = "PascalCase")]
struct Win32Bios {
    serial_number: Option<String>,
}

#[derive(Deserialize)]
#[serde(rename_all = "PascalCase")]
struct Win32ComputerSystemProduct {
    #[serde(rename = "UUID")]
    uuid: Option<String>,
    version: Option<String>,
}

#[derive(Deserialize)]
#[serde(rename_all = "PascalCase")]
struct Win32TimeZone {
    caption: Option<String>,
}

pub fn fill(info: &mut SystemInfo) {
    let systems: Vec<Win32ComputerSystem> = wmi_query(
        None,
        "SELECT Manufacturer, Model, UserName FROM Win32_ComputerSystem",
    );
    if let Some(cs) = systems.into_iter().next() {
        info.manufacturer = cs.manufacturer.into();
        info.model_identifier = cs.model.into();
        if let Some(user) = cs.user_name {
            // DOMAIN\user -> user
            let short = user.rsplit('\\').next().unwrap_or(&user).to_string();
            info.username = Field::Ok(short);
        }
    }

    let oses: Vec<Win32OperatingSystem> = wmi_query(
        None,
        "SELECT Caption, BuildNumber, OSArchitecture FROM Win32_OperatingSystem",
    );
    if let Some(os) = oses.into_iter().next() {
        if let Some(caption) = os.caption {
            info.os_name = Field::Ok(caption.trim().to_string());
        }
        info.os_build = os.build_number.into();
        if let Some(arch) = os.os_architecture {
            info.arch = Field::Ok(arch);
        }
    }

    let bios: Vec<Win32Bios> = wmi_query(None, "SELECT SerialNumber FROM Win32_BIOS");
    if let Some(b) = bios.into_iter().next() {
        info.serial_number = b
            .serial_number
            .filter(|s| !s.trim().is_empty() && s != "To be filled by O.E.M.")
            .into();
    }

    let products: Vec<Win32ComputerSystemProduct> = wmi_query(
        None,
        "SELECT UUID, Version FROM Win32_ComputerSystemProduct",
    );
    if let Some(p) = products.into_iter().next() {
        info.hardware_uuid = p.uuid.into();
        // On many laptops Version holds the marketing name (e.g. "ThinkPad X1").
        info.model_name = p
            .version
            .filter(|v| !v.trim().is_empty() && v != "System Version")
            .into();
    }

    let zones: Vec<Win32TimeZone> = wmi_query(None, "SELECT Caption FROM Win32_TimeZone");
    if let Some(z) = zones.into_iter().next() {
        info.timezone = z.caption.into();
    }
}
