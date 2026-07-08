#[cfg(target_os = "macos")]
mod macos;
#[cfg(windows)]
mod windows;

use crate::models::network::{NetworkInfo, NetworkInterfaceInfo, WifiInfo};
use crate::models::Field;
use sysinfo::Networks;

pub fn collect() -> NetworkInfo {
    let mut networks = Networks::new_with_refreshed_list();
    // A second refresh gives per-interval counters a chance to populate while
    // keeping totals available even on an idle interface.
    networks.refresh(true);

    let default_route = platform_default_route();
    let metadata = platform_interface_metadata();

    let mut interfaces: Vec<NetworkInterfaceInfo> = (&networks)
        .into_iter()
        .map(|(name, data)| {
            let meta = metadata.iter().find(|m| m.name == *name);
            let mac = data.mac_address();
            NetworkInterfaceInfo {
                name: Field::Ok(name.clone()),
                display_name: meta
                    .and_then(|m| m.display_name.clone())
                    .or_else(|| Some(name.clone()))
                    .into(),
                kind: meta.and_then(|m| m.kind.clone()).into(),
                mac_address: if mac.is_unspecified() {
                    Field::Unavailable
                } else {
                    Field::Ok(mac.to_string())
                },
                ip_addresses: data.ip_networks().iter().map(ToString::to_string).collect(),
                mtu: Field::Ok(data.mtu()),
                received_bytes: Field::Ok(data.total_received()),
                transmitted_bytes: Field::Ok(data.total_transmitted()),
                packets_received: Field::Ok(data.total_packets_received()),
                packets_transmitted: Field::Ok(data.total_packets_transmitted()),
                errors_received: Field::Ok(data.total_errors_on_received()),
                errors_transmitted: Field::Ok(data.total_errors_on_transmitted()),
                is_loopback: Field::Ok(
                    name == "lo0" || name == "lo" || name.starts_with("Loopback"),
                ),
                is_default: Field::Ok(
                    default_route
                        .interface_name
                        .as_deref()
                        .is_some_and(|default| default == name),
                ),
            }
        })
        .collect();

    interfaces.sort_by_key(|iface| {
        let is_default = matches!(iface.is_default, Field::Ok(true));
        let name = match &iface.name {
            Field::Ok(name) => name.clone(),
            _ => String::new(),
        };
        (!is_default, name)
    });

    let dns = platform_dns();
    NetworkInfo {
        interfaces,
        default_interface: default_route.interface_name.into(),
        default_gateway: default_route.gateway.into(),
        dns_servers: dns.servers,
        search_domains: dns.search_domains,
        wifi: platform_wifi(),
    }
}

#[derive(Debug, Clone, Default)]
struct DefaultRoute {
    interface_name: Option<String>,
    gateway: Option<String>,
}

#[derive(Debug, Clone, Default)]
struct DnsInfo {
    servers: Vec<String>,
    search_domains: Vec<String>,
}

#[derive(Debug, Clone, Default)]
struct InterfaceMetadata {
    name: String,
    display_name: Option<String>,
    kind: Option<String>,
}

fn platform_default_route() -> DefaultRoute {
    #[cfg(target_os = "macos")]
    {
        return macos::default_route();
    }
    #[cfg(windows)]
    {
        return windows::default_route();
    }
    #[allow(unreachable_code)]
    DefaultRoute::default()
}

fn platform_dns() -> DnsInfo {
    #[cfg(target_os = "macos")]
    {
        return macos::dns_info();
    }
    #[cfg(windows)]
    {
        return windows::dns_info();
    }
    #[allow(unreachable_code)]
    DnsInfo::default()
}

fn platform_interface_metadata() -> Vec<InterfaceMetadata> {
    #[cfg(target_os = "macos")]
    {
        return macos::interface_metadata();
    }
    #[cfg(windows)]
    {
        return windows::interface_metadata();
    }
    #[allow(unreachable_code)]
    Vec::new()
}

fn platform_wifi() -> WifiInfo {
    #[cfg(target_os = "macos")]
    {
        return macos::wifi_info();
    }
    #[cfg(windows)]
    {
        return windows::wifi_info();
    }
    #[allow(unreachable_code)]
    WifiInfo {
        interface_name: Field::Unavailable,
        ssid: Field::Unavailable,
        signal_quality_percent: Field::Unavailable,
        channel: Field::Unavailable,
        security: Field::Unavailable,
    }
}

#[cfg(test)]
mod tests {
    #[test]
    fn network_collects() {
        let info = super::collect();
        let json = serde_json::to_string_pretty(&info).expect("serializes");
        println!("{json}");
        assert!(!info.interfaces.is_empty());
    }
}
