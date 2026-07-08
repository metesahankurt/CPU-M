use super::{DefaultRoute, DnsInfo, InterfaceMetadata};
use crate::models::network::WifiInfo;
use crate::models::Field;
use crate::util::windows::wmi_query;
use serde::Deserialize;
use std::collections::BTreeSet;
use std::process::Command;

#[derive(Deserialize)]
#[serde(rename_all = "PascalCase")]
struct Win32NetworkAdapterConfiguration {
    description: Option<String>,
    #[serde(rename = "SettingID")]
    setting_id: Option<String>,
    #[serde(rename = "DefaultIPGateway")]
    default_ip_gateway: Option<Vec<String>>,
    #[serde(rename = "DNSServerSearchOrder")]
    dns_server_search_order: Option<Vec<String>>,
    #[serde(rename = "DNSDomainSuffixSearchOrder")]
    dns_domain_suffix_search_order: Option<Vec<String>>,
    #[serde(rename = "IPEnabled")]
    ip_enabled: Option<bool>,
}

#[derive(Deserialize)]
#[serde(rename_all = "PascalCase")]
struct Win32NetworkAdapter {
    name: Option<String>,
    #[serde(rename = "NetConnectionID")]
    net_connection_id: Option<String>,
    #[serde(rename = "GUID")]
    guid: Option<String>,
    adapter_type: Option<String>,
}

pub fn default_route() -> DefaultRoute {
    let rows: Vec<Win32NetworkAdapterConfiguration> = wmi_query(
        None,
        "SELECT Description, SettingID, DefaultIPGateway, IPEnabled \
         FROM Win32_NetworkAdapterConfiguration WHERE IPEnabled = TRUE",
    );
    rows.into_iter()
        .find_map(|row| {
            let gateway = row
                .default_ip_gateway
                .and_then(|g| g.into_iter().find(|s| !s.trim().is_empty()))?;
            Some(DefaultRoute {
                interface_name: row.description.or(row.setting_id),
                gateway: Some(gateway),
            })
        })
        .unwrap_or_default()
}

pub fn dns_info() -> DnsInfo {
    let rows: Vec<Win32NetworkAdapterConfiguration> = wmi_query(
        None,
        "SELECT DNSServerSearchOrder, DNSDomainSuffixSearchOrder, IPEnabled \
         FROM Win32_NetworkAdapterConfiguration WHERE IPEnabled = TRUE",
    );
    let mut servers = BTreeSet::new();
    let mut search_domains = BTreeSet::new();
    for row in rows {
        if row.ip_enabled != Some(true) {
            continue;
        }
        if let Some(values) = row.dns_server_search_order {
            servers.extend(values.into_iter().filter(|s| !s.trim().is_empty()));
        }
        if let Some(values) = row.dns_domain_suffix_search_order {
            search_domains.extend(values.into_iter().filter(|s| !s.trim().is_empty()));
        }
    }
    DnsInfo {
        servers: servers.into_iter().collect(),
        search_domains: search_domains.into_iter().collect(),
    }
}

pub fn interface_metadata() -> Vec<InterfaceMetadata> {
    let rows: Vec<Win32NetworkAdapter> = wmi_query(
        None,
        "SELECT Name, NetConnectionID, GUID, AdapterType FROM Win32_NetworkAdapter",
    );
    rows.into_iter()
        .filter_map(|row| {
            let name = row.net_connection_id.or(row.name)?;
            Some(InterfaceMetadata {
                name,
                display_name: row.guid,
                kind: row.adapter_type,
            })
        })
        .collect()
}

pub fn wifi_info() -> WifiInfo {
    let output = Command::new("netsh")
        .args(["wlan", "show", "interfaces"])
        .output()
        .ok()
        .filter(|out| out.status.success())
        .and_then(|out| String::from_utf8(out.stdout).ok());

    let Some(output) = output else {
        return empty_wifi();
    };

    let value = |label: &str| -> Option<String> {
        output.lines().find_map(|line| {
            let trimmed = line.trim();
            let (key, value) = trimmed.split_once(':')?;
            if key.trim().eq_ignore_ascii_case(label) {
                let value = value.trim();
                (!value.is_empty()).then(|| value.to_string())
            } else {
                None
            }
        })
    };

    WifiInfo {
        interface_name: value("Name").into(),
        ssid: value("SSID")
            .filter(|ssid| !ssid.eq_ignore_ascii_case("BSSID"))
            .into(),
        signal_quality_percent: value("Signal")
            .and_then(|s| s.trim_end_matches('%').parse::<f32>().ok())
            .into(),
        channel: value("Channel").into(),
        security: value("Authentication").into(),
    }
}

fn empty_wifi() -> WifiInfo {
    WifiInfo {
        interface_name: Field::Unavailable,
        ssid: Field::Unavailable,
        signal_quality_percent: Field::Unavailable,
        channel: Field::Unavailable,
        security: Field::Unavailable,
    }
}
