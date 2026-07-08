import type { Field } from "@/lib/field";

export interface SystemInfo {
  computerName: Field<string>;
  username: Field<string>;
  osName: Field<string>;
  osVersion: Field<string>;
  osBuild: Field<string>;
  arch: Field<string>;
  kernelVersion: Field<string>;
  locale: Field<string>;
  timezone: Field<string>;
  manufacturer: Field<string>;
  modelName: Field<string>;
  modelIdentifier: Field<string>;
  serialNumber: Field<string>;
  hardwareUuid: Field<string>;
  firmwareVersion: Field<string>;
  bootTime: Field<number>;
  uptimeSeconds: Field<number>;
  isElevated: Field<boolean>;
}
