export interface PlatformInfo {
  os: string;
  osName: string;
  osVersion: string;
  arch: string;
  isAppleSilicon: boolean;
  chipName: string | null;
  hostname: string | null;
  isElevated: boolean;
}
