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

export interface MainboardInfo {
  boardManufacturer: Field<string>;
  boardModel: Field<string>;
  boardSerialNumber: Field<string>;
  biosVendor: Field<string>;
  biosVersion: Field<string>;
  biosDate: Field<string>;
  firmwareVersion: Field<string>;
  bootMode: Field<string>;
  uefi: Field<boolean>;
  secureBoot: Field<boolean>;
  secureBootLevel: Field<string>;
  tpmPresent: Field<boolean>;
  tpmVersion: Field<string>;
}

export interface SecurityInfo {
  firewallEnabled: Field<boolean>;
  antivirusStatus: Field<string>;
  defenderStatus: Field<string>;
  secureBootEnabled: Field<boolean>;
  tpmPresent: Field<boolean>;
  tpmVersion: Field<string>;
  bitlockerStatus: Field<string>;
  filevaultEnabled: Field<boolean>;
  sipEnabled: Field<boolean>;
  gatekeeperEnabled: Field<boolean>;
  systemIntegrity: Field<string>;
  osUpdateStatus: Field<string>;
}

export interface LicenseInfo {
  productName: Field<string>;
  edition: Field<string>;
  activationStatus: Field<string>;
  licenseChannel: Field<string>;
  partialProductKey: Field<string>;
  licenseStatus: Field<string>;
  authenticitySummary: Field<string>;
  appleModelRecognized: Field<boolean>;
  officialOsBuild: Field<boolean>;
  integrityChecks: string[];
  hackintoshIndicators: string[];
}

export interface SensorReading {
  name: string;
  category: string;
  value: Field<number>;
  unit: string;
  detail: Field<string>;
}

export interface SensorsInfo {
  readings: SensorReading[];
  thermalState: Field<string>;
  fanCount: Field<number>;
  notes: string[];
}

export interface SystemReport {
  json: string;
  text: string;
}
