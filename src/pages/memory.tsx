import { Info, MemoryStick } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/shared/badge";
import { FieldRow } from "@/components/shared/field-row";
import { InfoCard } from "@/components/shared/info-card";
import { PageSkeleton } from "@/components/shared/page-skeleton";
import { UsageBar } from "@/components/shared/usage-bar";
import { usePolling } from "@/hooks/use-polling";
import { fieldValue } from "@/lib/field";
import { formatBytes, formatPercent } from "@/lib/format";
import type { Field } from "@/lib/field";
import type { MemoryInfo } from "@/types/memory";

function bytesField(field: Field<number>): Field<string> {
  return field.status === "ok"
    ? { status: "ok", value: formatBytes(field.value) }
    : field;
}

function mtsField(field: Field<number>): Field<string> {
  return field.status === "ok"
    ? { status: "ok", value: `${field.value} MT/s` }
    : field;
}

export function MemoryPage() {
  const { t } = useTranslation("Memory");
  const data = usePolling<MemoryInfo>("get_memory_info");

  if (!data) {
    return <PageSkeleton />;
  }

  const usage = fieldValue(data.usagePercent);
  const unified = fieldValue(data.isUnified);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <InfoCard icon={MemoryStick} title={t("usage")}>
        <div className="flex flex-col gap-3 py-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{t("usagePercent")}</span>
            <span className="font-medium">
              {usage !== undefined ? formatPercent(usage, 1) : "—"}
            </span>
          </div>
          <UsageBar percent={usage ?? 0} />
        </div>
        <FieldRow field={bytesField(data.totalBytes)} label={t("total")} />
        <FieldRow field={bytesField(data.usedBytes)} label={t("used")} />
        <FieldRow
          field={bytesField(data.availableBytes)}
          label={t("available")}
        />
        <FieldRow field={bytesField(data.freeBytes)} label={t("free")} />
        <FieldRow
          field={bytesField(data.swapTotalBytes)}
          label={t("swapTotal")}
        />
        <FieldRow field={bytesField(data.swapUsedBytes)} label={t("swapUsed")} />
      </InfoCard>

      <InfoCard icon={Info} title={t("details")}>
        <div className="py-1">
          {unified && <Badge variant="success">{t("unifiedMemory")}</Badge>}
        </div>
        <FieldRow field={data.memoryType} label={t("memoryType")} />
        <FieldRow field={data.moduleCount} label={t("moduleCount")} />
      </InfoCard>

      {data.modules.map((module, i) => (
        <InfoCard
          icon={MemoryStick}
          key={`module-${i.toFixed()}`}
          title={`${t("module")} ${i + 1}`}
        >
          <FieldRow field={module.locator} label={t("locator")} />
          <FieldRow field={module.bank} label={t("bank")} />
          <FieldRow field={bytesField(module.sizeBytes)} label={t("size")} />
          <FieldRow field={module.manufacturer} label={t("manufacturer")} />
          <FieldRow field={module.partNumber} label={t("partNumber")} mono={true} />
          <FieldRow field={module.memoryType} label={t("memoryType")} />
          <FieldRow field={mtsField(module.speedMts)} label={t("speed")} />
          <FieldRow
            field={mtsField(module.configuredSpeedMts)}
            label={t("configuredSpeed")}
          />
        </InfoCard>
      ))}
    </div>
  );
}
