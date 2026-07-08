import type { Field } from "@/lib/field";

export interface GpuInfo {
  name: Field<string>;
  vendor: Field<string>;
  gpuType: Field<string>;
  vramBytes: Field<number>;
  sharedMemory: Field<boolean>;
  coreCount: Field<number>;
  metalSupport: Field<string>;
  driverVersion: Field<string>;
  deviceId: Field<string>;
}

export interface PhysicalDisk {
  identifier: Field<string>;
  model: Field<string>;
  sizeBytes: Field<number>;
  kind: Field<string>;
  bus: Field<string>;
  internal: Field<boolean>;
  removable: Field<boolean>;
  serialNumber: Field<string>;
  smartStatus: Field<string>;
}

export interface VolumeInfo {
  name: Field<string>;
  mountPoint: Field<string>;
  filesystem: Field<string>;
  totalBytes: Field<number>;
  availableBytes: Field<number>;
  usedBytes: Field<number>;
  usagePercent: Field<number>;
  isRemovable: Field<boolean>;
  isSystem: Field<boolean>;
}

export interface StorageInfo {
  disks: PhysicalDisk[];
  volumes: VolumeInfo[];
}

export interface DisplayInfo {
  name: Field<string>;
  resolution: Field<string>;
  logicalResolution: Field<string>;
  refreshRateHz: Field<number>;
  scaleFactor: Field<number>;
  colorDepthBits: Field<number>;
  isMain: Field<boolean>;
  isInternal: Field<boolean>;
  displayType: Field<string>;
  connection: Field<string>;
  hdr: Field<boolean>;
}

export interface NetworkInterfaceInfo {
  name: Field<string>;
  displayName: Field<string>;
  kind: Field<string>;
  macAddress: Field<string>;
  ipAddresses: string[];
  mtu: Field<number>;
  receivedBytes: Field<number>;
  transmittedBytes: Field<number>;
  packetsReceived: Field<number>;
  packetsTransmitted: Field<number>;
  errorsReceived: Field<number>;
  errorsTransmitted: Field<number>;
  isLoopback: Field<boolean>;
  isDefault: Field<boolean>;
}

export interface WifiInfo {
  interfaceName: Field<string>;
  ssid: Field<string>;
  signalQualityPercent: Field<number>;
  channel: Field<string>;
  security: Field<string>;
}

export interface NetworkInfo {
  interfaces: NetworkInterfaceInfo[];
  defaultInterface: Field<string>;
  defaultGateway: Field<string>;
  dnsServers: string[];
  searchDomains: string[];
  wifi: WifiInfo;
}

export interface BatteryDeviceInfo {
  vendor: Field<string>;
  model: Field<string>;
  serialNumber: Field<string>;
  technology: Field<string>;
  state: Field<string>;
  percentage: Field<number>;
  healthPercent: Field<number>;
  cycleCount: Field<number>;
  energyWh: Field<number>;
  energyFullWh: Field<number>;
  energyFullDesignWh: Field<number>;
  powerDrawW: Field<number>;
  voltageV: Field<number>;
  temperatureCelsius: Field<number>;
  timeToEmptySeconds: Field<number>;
  timeToFullSeconds: Field<number>;
}

export interface BatteryInfo {
  batteries: BatteryDeviceInfo[];
  powerSource: Field<string>;
  acAdapterConnected: Field<boolean>;
  acAdapterWatts: Field<number>;
  lowPowerMode: Field<boolean>;
}
