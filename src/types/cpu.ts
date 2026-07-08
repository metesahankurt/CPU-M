import type { Field } from "@/lib/field";

export interface CacheEntry {
  label: string;
  sizeBytes: number;
}

export interface CpuStaticInfo {
  vendor: Field<string>;
  brand: Field<string>;
  architecture: Field<string>;
  physicalCores: Field<number>;
  logicalCores: Field<number>;
  performanceCores: Field<number>;
  efficiencyCores: Field<number>;
  baseFrequencyMhz: Field<number>;
  maxFrequencyMhz: Field<number>;
  caches: CacheEntry[];
  instructionSets: Field<string[]>;
  virtualizationSupport: Field<boolean>;
}

export interface CpuDynamicInfo {
  globalUsagePercent: Field<number>;
  perCoreUsagePercent: number[];
  currentFrequencyMhz: Field<number>;
  temperatureCelsius: Field<number>;
  powerWatts: Field<number>;
}
