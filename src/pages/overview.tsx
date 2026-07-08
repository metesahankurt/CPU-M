import { Laptop, MonitorCheck, ShieldCheck, UserRound } from "lucide-react";
import { useTranslation } from "react-i18next";
import { FieldRow } from "@/components/shared/field-row";
import { InfoCard } from "@/components/shared/info-card";
import { PageSkeleton } from "@/components/shared/page-skeleton";
import { useInvoke } from "@/hooks/use-invoke";
import { fieldValue } from "@/lib/field";
import { formatUptime } from "@/lib/format";
import type { Field } from "@/lib/field";
import type { SystemInfo } from "@/types/system";

function formatBootTime(field: Field<number>, locale: string): Field<string> {
  if (field.status !== "ok") {
    return field;
  }
  return {
    status: "ok",
    value: new Date(field.value * 1000).toLocaleString(locale),
  };
}

export function OverviewPage() {
  const { t, i18n } = useTranslation("Overview");
  const { t: tCommon } = useTranslation("Common");
  const { data, loading } = useInvoke<SystemInfo>("get_system_info");

  if (loading || !data) {
    return <PageSkeleton />;
  }

  const uptime = fieldValue(data.uptimeSeconds);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <InfoCard icon={Laptop} title={t("device")}>
        <FieldRow field={data.manufacturer} label={t("manufacturer")} />
        <FieldRow field={data.modelName} label={t("modelName")} />
        <FieldRow field={data.modelIdentifier} label={t("modelIdentifier")} />
        <FieldRow field={data.serialNumber} label={t("serialNumber")} mono={true} />
        <FieldRow field={data.hardwareUuid} label={t("hardwareUuid")} mono={true} />
        <FieldRow field={data.firmwareVersion} label={t("firmwareVersion")} mono={true} />
      </InfoCard>

      <InfoCard icon={MonitorCheck} title={t("operatingSystem")}>
        <FieldRow field={data.osName} label={t("osName")} />
        <FieldRow field={data.osVersion} label={t("osVersion")} />
        <FieldRow field={data.osBuild} label={t("osBuild")} mono={true} />
        <FieldRow field={data.arch} label={t("arch")} />
        <FieldRow field={data.kernelVersion} label={t("kernelVersion")} mono={true} />
        <FieldRow field={data.locale} label={t("locale")} />
        <FieldRow field={data.timezone} label={t("timezone")} />
      </InfoCard>

      <InfoCard icon={UserRound} title={t("session")}>
        <FieldRow field={data.computerName} label={t("computerName")} />
        <FieldRow field={data.username} label={t("username")} />
        <FieldRow
          field={formatBootTime(data.bootTime, i18n.language)}
          label={t("bootTime")}
        />
        <FieldRow
          label={t("uptime")}
          value={
            uptime !== undefined ? formatUptime(uptime, tCommon) : undefined
          }
        />
      </InfoCard>

      <InfoCard icon={ShieldCheck} title={t("privileges")}>
        <FieldRow field={data.isElevated} label={t("isElevated")} />
      </InfoCard>
    </div>
  );
}
