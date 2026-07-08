import { MonitorCog } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/shared/badge";
import { FieldRow } from "@/components/shared/field-row";
import { InfoCard } from "@/components/shared/info-card";
import { PageSkeleton } from "@/components/shared/page-skeleton";
import { useInvoke } from "@/hooks/use-invoke";
import { fieldValue } from "@/lib/field";
import { formatBytes } from "@/lib/format";
import type { Field } from "@/lib/field";
import type { GpuInfo } from "@/types/hardware";

function bytesField(field: Field<number>): Field<string> {
  return field.status === "ok"
    ? { status: "ok", value: formatBytes(field.value, 0) }
    : field;
}

export function GpuPage() {
  const { t } = useTranslation("Gpu");
  const { data, loading } = useInvoke<GpuInfo[]>("get_gpu_info");

  if (loading || !data) {
    return <PageSkeleton />;
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {data.map((gpu, i) => {
        const gpuType = fieldValue(gpu.gpuType);
        const shared = fieldValue(gpu.sharedMemory);
        return (
          <InfoCard
            icon={MonitorCog}
            key={`gpu-${i.toFixed()}`}
            title={fieldValue(gpu.name) ?? `${t("gpu")} ${i + 1}`}
          >
            <div className="flex gap-1.5 py-1">
              {gpuType && (
                <Badge variant="muted">
                  {gpuType === "integrated" ? t("integrated") : t("discrete")}
                </Badge>
              )}
              {shared && <Badge variant="success">{t("sharedMemory")}</Badge>}
            </div>
            <FieldRow field={gpu.vendor} label={t("vendor")} />
            <FieldRow field={gpu.name} label={t("model")} />
            <FieldRow
              field={
                shared && gpu.vramBytes.status !== "ok"
                  ? { status: "ok", value: t("sharedWithSystem") }
                  : bytesField(gpu.vramBytes)
              }
              label={t("vram")}
            />
            <FieldRow field={gpu.coreCount} label={t("coreCount")} />
            <FieldRow field={gpu.metalSupport} label={t("metalSupport")} />
            <FieldRow field={gpu.driverVersion} label={t("driverVersion")} />
            <FieldRow field={gpu.deviceId} label={t("deviceId")} mono={true} />
          </InfoCard>
        );
      })}
    </div>
  );
}
