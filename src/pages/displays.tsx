import { Monitor } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/shared/badge";
import { FieldRow } from "@/components/shared/field-row";
import { InfoCard } from "@/components/shared/info-card";
import { PageSkeleton } from "@/components/shared/page-skeleton";
import { useInvoke } from "@/hooks/use-invoke";
import { fieldValue } from "@/lib/field";
import type { Field } from "@/lib/field";
import type { DisplayInfo } from "@/types/hardware";

function hzField(field: Field<number>): Field<string> {
  return field.status === "ok"
    ? { status: "ok", value: `${field.value.toFixed(0)} Hz` }
    : field;
}

function scaleField(field: Field<number>): Field<string> {
  return field.status === "ok"
    ? { status: "ok", value: `${field.value.toFixed(1)}x` }
    : field;
}

export function DisplaysPage() {
  const { t } = useTranslation("Displays");
  const { data, loading } = useInvoke<DisplayInfo[]>("get_display_info");

  if (loading || !data) {
    return <PageSkeleton />;
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {data.map((display, i) => {
        const isMain = fieldValue(display.isMain);
        const isInternal = fieldValue(display.isInternal);
        return (
          <InfoCard
            icon={Monitor}
            key={`display-${i.toFixed()}`}
            title={fieldValue(display.name) ?? `${t("display")} ${i + 1}`}
          >
            <div className="flex gap-1.5 py-1">
              {isMain && <Badge variant="success">{t("mainDisplay")}</Badge>}
              {isInternal !== undefined && (
                <Badge variant="muted">
                  {isInternal ? t("internal") : t("external")}
                </Badge>
              )}
            </div>
            <FieldRow field={display.resolution} label={t("nativeResolution")} />
            <FieldRow
              field={display.logicalResolution}
              label={t("logicalResolution")}
            />
            <FieldRow
              field={hzField(display.refreshRateHz)}
              label={t("refreshRate")}
            />
            <FieldRow
              field={scaleField(display.scaleFactor)}
              label={t("scaleFactor")}
            />
            <FieldRow
              field={
                display.colorDepthBits.status === "ok"
                  ? { status: "ok", value: `${display.colorDepthBits.value}-bit` }
                  : display.colorDepthBits
              }
              label={t("colorDepth")}
            />
            <FieldRow field={display.displayType} label={t("displayType")} />
            <FieldRow field={display.connection} label={t("connection")} />
            <FieldRow field={display.hdr} label={t("hdr")} />
          </InfoCard>
        );
      })}
    </div>
  );
}
