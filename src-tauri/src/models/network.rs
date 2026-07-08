use super::Field;
use serde::Serialize;

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct NetworkInterfaceInfo {
    pub name: Field<String>,
    pub display_name: Field<String>,
    pub kind: Field<String>,
    pub mac_address: Field<String>,
    pub ip_addresses: Vec<String>,
    pub mtu: Field<u64>,
    pub received_bytes: Field<u64>,
    pub transmitted_bytes: Field<u64>,
    pub packets_received: Field<u64>,
    pub packets_transmitted: Field<u64>,
    pub errors_received: Field<u64>,
    pub errors_transmitted: Field<u64>,
    pub is_loopback: Field<bool>,
    pub is_default: Field<bool>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct WifiInfo {
    pub interface_name: Field<String>,
    pub ssid: Field<String>,
    pub signal_quality_percent: Field<f32>,
    pub channel: Field<String>,
    pub security: Field<String>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct NetworkInfo {
    pub interfaces: Vec<NetworkInterfaceInfo>,
    pub default_interface: Field<String>,
    pub default_gateway: Field<String>,
    pub dns_servers: Vec<String>,
    pub search_domains: Vec<String>,
    pub wifi: WifiInfo,
}
