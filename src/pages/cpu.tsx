import { Activity, Cpu, Gauge, Layers, ListChecks } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/shared/badge";
import { FieldRow } from "@/components/shared/field-row";
import { InfoCard } from "@/components/shared/info-card";
import { PageSkeleton } from "@/components/shared/page-skeleton";
import { UsageBar } from "@/components/shared/usage-bar";
import { useInvoke } from "@/hooks/use-invoke";
import { usePolling } from "@/hooks/use-polling";
import { fieldValue, isOk } from "@/lib/field";
import { formatBytes, formatMhz, formatPercent } from "@/lib/format";
import type { Field } from "@/lib/field";
import type { CpuDynamicInfo, CpuStaticInfo } from "@/types/cpu";

function mhzField(field: Field<number>): Field<string> {
  return field.status === "ok"
    ? { status: "ok", value: formatMhz(field.value) }
    : field;
}

export function CpuPage() {
  const { t } = useTranslation("Cpu");
  const { data, loading } = useInvoke<CpuStaticInfo>("get_cpu_static");
  const dynamic = usePolling<CpuDynamicInfo>("get_cpu_dynamic");

  if (loading || !data) {
    return <PageSkeleton />;
  }

  const globalUsage = dynamic ? fieldValue(dynamic.globalUsagePercent) : undefined;
  const instructionSets = fieldValue(data.instructionSets) ?? [];

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <InfoCard icon={Cpu} title={t("processor")}>
        <FieldRow field={data.brand} label={t("brand")} />
        <FieldRow field={data.vendor} label={t("vendor")} />
        <FieldRow field={data.architecture} label={t("architecture")} />
        <FieldRow
          field={data.virtualizationSupport}
          label={t("virtualization")}
        />
        <FieldRow field={data.physicalCores} label={t("physicalCores")} />
        <FieldRow field={data.logicalCores} label={t("logicalCores")} />
        <FieldRow field={data.performanceCores} label={t("performanceCores")} />
        <FieldRow field={data.efficiencyCores} label={t("efficiencyCores")} />
      </InfoCard>

      <InfoCard icon={Gauge} title={t("clocks")}>
        <FieldRow
          field={mhzField(data.baseFrequencyMhz)}
          label={t("baseFrequency")}
        />
        <FieldRow
          field={mhzField(data.maxFrequencyMhz)}
          label={t("maxFrequency")}
        />
        <FieldRow
          field={dynamic ? mhzField(dynamic.currentFrequencyMhz) : undefined}
          label={t("currentFrequency")}
        />
        <FieldRow
          field={
            dynamic && isOk(dynamic.temperatureCelsius)
              ? {
                  status: "ok",
                  value: `${dynamic.temperatureCelsius.value.toFixed(1)} °C`,
                }
              : dynamic?.temperatureCelsius
          }
          label={t("temperature")}
        />
        <FieldRow
          field={
            dynamic && isOk(dynamic.powerWatts)
              ? {
                  status: "ok",
                  value: `${dynamic.powerWatts.value.toFixed(1)} W`,
                }
              : dynamic?.powerWatts
          }
          label={t("power")}
        />
      </InfoCard>

      <InfoCard icon={Activity} title={t("usage")}>
        <div className="flex flex-col gap-3 py-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{t("globalUsage")}</span>
            <span className="font-medium">
              {globalUsage !== undefined ? formatPercent(globalUsage) : "—"}
            </span>
          </div>
          <UsageBar percent={globalUsage ?? 0} />
          {dynamic && dynamic.perCoreUsagePercent.length > 0 && (
            <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-4">
              {dynamic.perCoreUsagePercent.map((usage, i) => (
                <div className="flex flex-col gap-1" key={`core-${i.toFixed()}`}>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">
                      {t("core")} {i + 1}
                    </span>
                    <span>{formatPercent(usage)}</span>
                  </div>
                  <UsageBar className="h-1.5" percent={usage} />
                </div>
              ))}
            </div>
          )}
        </div>
      </InfoCard>

      <InfoCard icon={Layers} title={t("caches")}>
        {data.caches.length === 0 && (
          <FieldRow field={{ status: "unavailable" }} label={t("caches")} />
        )}
        {data.caches.map((cache) => (
          <FieldRow
            key={cache.label}
            label={cache.label}
            value={formatBytes(cache.sizeBytes, 0)}
          />
        ))}
      </InfoCard>

      <InfoCard
        className="lg:col-span-2"
        icon={ListChecks}
        title={t("instructionSets")}
      >
        <div className="flex flex-wrap gap-1.5 py-2">
          {instructionSets.length > 0 ? (
            instructionSets.map((set) => (
              <Badge key={set} variant="muted">
                {set}
              </Badge>
            ))
          ) : (
            <FieldRow
              field={{ status: "unavailable" }}
              label={t("instructionSets")}
            />
          )}
        </div>
      </InfoCard>
    </div>
  );
}
