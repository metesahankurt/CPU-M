import { Gauge, Thermometer, Zap } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/shared/badge";
import { FieldRow } from "@/components/shared/field-row";
import { InfoCard } from "@/components/shared/info-card";
import { PageSkeleton } from "@/components/shared/page-skeleton";
import { usePolling } from "@/hooks/use-polling";
import type { Field } from "@/lib/field";
import type { SensorsInfo } from "@/types/hardware";

function readingField(field: Field<number>, unit: string): Field<string> {
  return field.status === "ok"
    ? { status: "ok", value: `${field.value.toFixed(1)} ${unit}` }
    : field;
}

export function SensorsPage() {
  const { t } = useTranslation("Sensors");
  const data = usePolling<SensorsInfo>("get_sensors_info");

  if (!data) {
    return <PageSkeleton />;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <InfoCard icon={Gauge} title={t("thermal")}>
          <FieldRow field={data.thermalState} label={t("thermalState")} />
          <FieldRow field={data.fanCount} label={t("fanCount")} />
          <FieldRow
            field={
              data.notes.length > 0
                ? { status: "ok", value: data.notes.join(" · ") }
                : { status: "unavailable" }
            }
            label={t("notes")}
          />
        </InfoCard>
      </div>

      <h2 className="font-semibold text-muted-foreground text-sm uppercase tracking-wide">
        {t("readings")}
      </h2>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {data.readings.map((reading, i) => (
          <InfoCard
            icon={reading.category === "Power" || reading.category === "Voltage" ? Zap : Thermometer}
            key={`${reading.name}-${i.toFixed()}`}
            title={reading.name}
          >
            <div className="py-1">
              <Badge variant="muted">{reading.category}</Badge>
            </div>
            <FieldRow
              field={readingField(reading.value, reading.unit)}
              label={t("value")}
            />
            <FieldRow field={reading.detail} label={t("detail")} />
          </InfoCard>
        ))}
      </div>
    </div>
  );
}
