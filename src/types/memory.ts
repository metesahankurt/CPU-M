import type { Field } from "@/lib/field";

export interface MemoryModule {
  locator: Field<string>;
  bank: Field<string>;
  sizeBytes: Field<number>;
  manufacturer: Field<string>;
  partNumber: Field<string>;
  speedMts: Field<number>;
  configuredSpeedMts: Field<number>;
  memoryType: Field<string>;
}

export interface MemoryInfo {
  totalBytes: Field<number>;
  usedBytes: Field<number>;
  availableBytes: Field<number>;
  freeBytes: Field<number>;
  usagePercent: Field<number>;
  swapTotalBytes: Field<number>;
  swapUsedBytes: Field<number>;
  memoryType: Field<string>;
  isUnified: Field<boolean>;
  moduleCount: Field<number>;
  modules: MemoryModule[];
}
