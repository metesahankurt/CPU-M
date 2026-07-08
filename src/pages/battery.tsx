import { Battery, BatteryCharging, PlugZap } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/shared/badge";
import { FieldRow } from "@/components/shared/field-row";
import { InfoCard } from "@/components/shared/info-card";
import { PageSkeleton } from "@/components/shared/page-skeleton";
import { UsageBar } from "@/components/shared/usage-bar";
import { usePolling } from "@/hooks/use-polling";
import { fieldValue } from "@/lib/field";
import { formatPercent, formatUptime } from "@/lib/format";
import type { Field } from "@/lib/field";
import type { BatteryInfo } from "@/types/hardware";

function percentField(field: Field<number>): Field<string> {
  return field.status === "ok"
    ? { status: "ok", value: formatPercent(field.value, 1) }
    : field;
}

function fixedField(field: Field<number>, suffix: string, decimals = 1): Field<string> {
  return field.status === "ok"
    ? { status: "ok", value: `${field.value.toFixed(decimals)} ${suffix}` }
    : field;
}

function durationField(
  field: Field<number>,
  tCommon: (key: string) => string,
): Field<string> {
  return field.status === "ok"
    ? { status: "ok", value: formatUptime(field.value, tCommon) }
    : field;
}

export function BatteryPage() {
  const { t } = useTranslation("Battery");
  const { t: tCommon } = useTranslation("Common");
  const data = usePolling<BatteryInfo>("get_battery_info");

  if (!data) {
    return <PageSkeleton />;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <InfoCard icon={PlugZap} title={t("power")}>
          <FieldRow field={data.powerSource} label={t("powerSource")} />
          <FieldRow
            field={data.acAdapterConnected}
            label={t("acAdapterConnected")}
          />
          <FieldRow
            field={
              data.acAdapterWatts.status === "ok"
                ? { status: "ok", value: `${data.acAdapterWatts.value} W` }
                : data.acAdapterWatts
            }
            label={t("acAdapterWatts")}
          />
          <FieldRow field={data.lowPowerMode} label={t("lowPowerMode")} />
        </InfoCard>
      </div>

      <h2 className="font-semibold text-muted-foreground text-sm uppercase tracking-wide">
        {t("batteries")}
      </h2>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {data.batteries.map((battery, i) => {
          const percentage = fieldValue(battery.percentage);
          const state = fieldValue(battery.state);
          return (
            <InfoCard
              icon={state?.toLowerCase().includes("charging") ? BatteryCharging : Battery}
              key={`battery-${i.toFixed()}`}
              title={fieldValue(battery.model) ?? `${t("battery")} ${i + 1}`}
            >
              <div className="flex flex-wrap gap-1.5 py-1">
                {state && <Badge variant="muted">{state}</Badge>}
                {fieldValue(battery.technology) && (
                  <Badge variant="muted">{fieldValue(battery.technology)}</Badge>
                )}
              </div>
              <div className="flex flex-col gap-3 py-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t("charge")}</span>
                  <span className="font-medium">
                    {percentage !== undefined ? formatPercent(percentage, 1) : "—"}
                  </span>
                </div>
                <UsageBar percent={percentage ?? 0} />
              </div>
              <FieldRow field={percentField(battery.healthPercent)} label={t("health")} />
              <FieldRow field={battery.cycleCount} label={t("cycleCount")} />
              <FieldRow field={battery.vendor} label={t("vendor")} />
              <FieldRow field={battery.serialNumber} label={t("serialNumber")} mono={true} />
              <FieldRow field={fixedField(battery.energyWh, "Wh")} label={t("energy")} />
              <FieldRow
                field={fixedField(battery.energyFullWh, "Wh")}
                label={t("fullCapacity")}
              />
              <FieldRow
                field={fixedField(battery.energyFullDesignWh, "Wh")}
                label={t("designCapacity")}
              />
              <FieldRow
                field={fixedField(battery.powerDrawW, "W", 2)}
                label={t("powerDraw")}
              />
              <FieldRow field={fixedField(battery.voltageV, "V", 2)} label={t("voltage")} />
              <FieldRow
                field={fixedField(battery.temperatureCelsius, "C", 1)}
                label={t("temperature")}
              />
              <FieldRow
                field={durationField(battery.timeToEmptySeconds, tCommon)}
                label={t("timeToEmpty")}
              />
              <FieldRow
                field={durationField(battery.timeToFullSeconds, tCommon)}
                label={t("timeToFull")}
              />
            </InfoCard>
          );
        })}
      </div>
    </div>
  );
}
