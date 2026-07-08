use super::{DefaultRoute, DnsInfo, InterfaceMetadata};
use crate::models::network::WifiInfo;
use crate::models::Field;
use crate::util::macos::run_cmd;
use std::collections::BTreeSet;

pub fn default_route() -> DefaultRoute {
    let Some(output) = run_cmd("route", &["-n", "get", "default"]) else {
        return DefaultRoute::default();
    };
    let mut route = DefaultRoute::default();
    for line in output.lines() {
        let trimmed = line.trim();
        if let Some(value) = trimmed.strip_prefix("gateway:") {
            route.gateway = non_empty(value);
        } else if let Some(value) = trimmed.strip_prefix("interface:") {
            route.interface_name = non_empty(value);
        }
    }
    route
}

pub fn dns_info() -> DnsInfo {
    let Some(output) = run_cmd("scutil", &["--dns"]) else {
        return DnsInfo::default();
    };
    let mut servers = BTreeSet::new();
    let mut search_domains = BTreeSet::new();
    for line in output.lines() {
        let trimmed = line.trim();
        if let Some(value) = trimmed.split(':').nth(1).map(str::trim) {
            if trimmed.starts_with("nameserver[") {
                servers.insert(value.to_string());
            } else if trimmed.starts_with("search domain[") {
                search_domains.insert(value.to_string());
            }
        }
    }
    DnsInfo {
        servers: servers.into_iter().collect(),
        search_domains: search_domains.into_iter().collect(),
    }
}

pub fn interface_metadata() -> Vec<InterfaceMetadata> {
    let Some(output) = run_cmd("networksetup", &["-listallhardwareports"]) else {
        return Vec::new();
    };
    let mut result = Vec::new();
    let mut display_name: Option<String> = None;

    for line in output.lines() {
        let trimmed = line.trim();
        if let Some(value) = trimmed.strip_prefix("Hardware Port:") {
            display_name = non_empty(value);
        } else if let Some(value) = trimmed.strip_prefix("Device:") {
            if let Some(name) = non_empty(value) {
                let kind = display_name.as_deref().map(interface_kind);
                result.push(InterfaceMetadata {
                    name,
                    display_name: display_name.clone(),
                    kind,
                });
            }
        }
    }

    result
}

pub fn wifi_info() -> WifiInfo {
    let wifi_interface = interface_metadata()
        .into_iter()
        .find(|m| m.display_name.as_deref() == Some("Wi-Fi"))
        .map(|m| m.name);

    let ssid = wifi_interface.as_deref().and_then(|iface| {
        let output = run_cmd("networksetup", &["-getairportnetwork", iface])?;
        output
            .trim()
            .strip_prefix("Current Wi-Fi Network:")
            .map(str::trim)
            .filter(|s| !s.is_empty())
            .map(ToString::to_string)
    });

    WifiInfo {
        interface_name: wifi_interface.into(),
        ssid: ssid.into(),
        signal_quality_percent: Field::Unavailable,
        channel: Field::Unavailable,
        security: Field::Unavailable,
    }
}

fn interface_kind(display_name: &str) -> String {
    let lower = display_name.to_lowercase();
    if lower.contains("wi-fi") || lower.contains("airport") {
        "Wi-Fi".to_string()
    } else if lower.contains("bluetooth") {
        "Bluetooth".to_string()
    } else if lower.contains("thunderbolt") {
        "Thunderbolt".to_string()
    } else if lower.contains("ethernet") {
        "Ethernet".to_string()
    } else {
        display_name.to_string()
    }
}

fn non_empty(value: &str) -> Option<String> {
    let trimmed = value.trim();
    if trimmed.is_empty() {
        None
    } else {
        Some(trimmed.to_string())
    }
}
