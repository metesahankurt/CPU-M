import { fieldValue, isOk } from "@/lib/field";
import type { Field } from "@/lib/field";
import type { CpuStaticInfo } from "@/types/cpu";
import type { GpuInfo } from "@/types/hardware";

export type DriverVendor = "nvidia" | "amd" | "intel" | "unknown";
export type DriverStatus = "installed" | "missing" | "unknown";

export interface DriverLink {
  /** i18n key under "Drivers", e.g. "links.nvidiaDrivers". */
  labelKey: string;
  url: string;
}

export interface DriverRecommendation {
  id: string;
  kind: "gpu" | "chipset";
  vendor: DriverVendor;
  deviceName: string | undefined;
  vendorName: string | undefined;
  deviceId: string | undefined;
  driverVersion: Field<string> | undefined;
  status: DriverStatus;
  /** i18n key under "Drivers", e.g. "notes.nvidiaGpu". */
  noteKey: string;
  links: DriverLink[];
}

/** PCI vendor ids as they appear in PNPDeviceID (VEN_xxxx). */
const PCI_VENDOR_IDS: Record<string, DriverVendor> = {
  "10DE": "nvidia",
  "1002": "amd",
  "1022": "amd",
  "8086": "intel",
};

/**
 * Vendor download catalog. Extend these tables to support more vendors or
 * swap URLs — the page renders whatever is listed here, first link first.
 */
const GPU_LINKS: Record<Exclude<DriverVendor, "unknown">, DriverLink[]> = {
  nvidia: [
    {
      labelKey: "links.nvidiaDrivers",
      url: "https://www.nvidia.com/en-us/drivers/",
    },
    {
      labelKey: "links.nvidiaApp",
      url: "https://www.nvidia.com/en-us/software/nvidia-app/",
    },
  ],
  amd: [
    {
      labelKey: "links.amdDrivers",
      url: "https://www.amd.com/en/support/download/drivers.html",
    },
  ],
  intel: [
    {
      labelKey: "links.intelGpuDriver",
      url: "https://www.intel.com/content/www/us/en/download/785597/intel-arc-iris-xe-graphics-windows.html",
    },
    {
      labelKey: "links.intelDsa",
      url: "https://www.intel.com/content/www/us/en/support/detect.html",
    },
  ],
};

const CHIPSET_LINKS: Record<Exclude<DriverVendor, "unknown">, DriverLink[]> = {
  intel: [
    {
      labelKey: "links.intelDsa",
      url: "https://www.intel.com/content/www/us/en/support/detect.html",
    },
    {
      labelKey: "links.intelChipsetInf",
      url: "https://www.intel.com/content/www/us/en/download/19347/chipset-inf-utility.html",
    },
  ],
  amd: [
    {
      labelKey: "links.amdChipset",
      url: "https://www.amd.com/en/support/download/drivers.html",
    },
  ],
  nvidia: [],
};

const WINDOWS_UPDATE_LINK: DriverLink = {
  labelKey: "links.windowsUpdate",
  url: "https://support.microsoft.com/en-us/windows/update-drivers-manually-in-windows-ec62f46c-ff14-c91d-eead-d7126dc1f7b6",
};

function vendorFromPnpId(pnpId: string | undefined): DriverVendor | undefined {
  const match = pnpId?.toUpperCase().match(/VEN_([0-9A-F]{4})/);
  return match ? PCI_VENDOR_IDS[match[1]] : undefined;
}

function vendorFromText(text: string): DriverVendor | undefined {
  const lower = text.toLowerCase();
  if (
    lower.includes("nvidia") ||
    lower.includes("geforce") ||
    lower.includes("quadro")
  ) {
    return "nvidia";
  }
  if (
    lower.includes("amd") ||
    lower.includes("radeon") ||
    lower.includes("advanced micro")
  ) {
    return "amd";
  }
  if (lower.includes("intel") || lower.includes("genuineintel")) {
    return "intel";
  }
  if (lower.includes("authenticamd")) {
    return "amd";
  }
  return undefined;
}

/**
 * The PNP device id carries the real PCI vendor even when Windows runs the
 * device on the Basic Display Adapter fallback driver, so it wins over the
 * reported name/vendor strings.
 */
export function detectGpuVendor(gpu: GpuInfo): DriverVendor {
  return (
    vendorFromPnpId(fieldValue(gpu.deviceId)) ??
    vendorFromText(
      `${fieldValue(gpu.vendor) ?? ""} ${fieldValue(gpu.name) ?? ""}`,
    ) ??
    "unknown"
  );
}

function gpuDriverStatus(gpu: GpuInfo): DriverStatus {
  const name = fieldValue(gpu.name)?.toLowerCase() ?? "";
  // Fresh Windows installs run GPUs on Microsoft's fallback driver.
  if (name.includes("microsoft basic display")) {
    return "missing";
  }
  return isOk(gpu.driverVersion) ? "installed" : "unknown";
}

export function buildDriverRecommendations(
  gpus: GpuInfo[] | null,
  cpu: CpuStaticInfo | null,
): DriverRecommendation[] {
  const recommendations: DriverRecommendation[] = [];

  for (const [i, gpu] of (gpus ?? []).entries()) {
    const vendor = detectGpuVendor(gpu);
    const links = vendor === "unknown" ? [] : GPU_LINKS[vendor];
    recommendations.push({
      id: `gpu-${i.toFixed()}`,
      kind: "gpu",
      vendor,
      deviceName: fieldValue(gpu.name),
      vendorName: fieldValue(gpu.vendor),
      deviceId: fieldValue(gpu.deviceId),
      driverVersion: gpu.driverVersion,
      status: gpuDriverStatus(gpu),
      noteKey: vendor === "unknown" ? "notes.unknownGpu" : `notes.${vendor}Gpu`,
      links: links.length > 0 ? links : [WINDOWS_UPDATE_LINK],
    });
  }

  if (cpu) {
    const vendor =
      vendorFromText(
        `${fieldValue(cpu.vendor) ?? ""} ${fieldValue(cpu.brand) ?? ""}`,
      ) ?? "unknown";
    if (vendor === "intel" || vendor === "amd") {
      recommendations.push({
        id: "chipset",
        kind: "chipset",
        vendor,
        deviceName: fieldValue(cpu.brand),
        vendorName: fieldValue(cpu.vendor),
        deviceId: undefined,
        driverVersion: undefined,
        status: "unknown",
        noteKey: `notes.${vendor}Chipset`,
        links: CHIPSET_LINKS[vendor],
      });
    }
  }

  // Missing drivers first so a fresh install sees what to fix at the top.
  return recommendations.sort(
    (a, b) => Number(b.status === "missing") - Number(a.status === "missing"),
  );
}
