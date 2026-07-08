import { LockKeyhole, ShieldCheck, ShieldQuestion } from "lucide-react";
import { useTranslation } from "react-i18next";
import { FieldRow } from "@/components/shared/field-row";
import { InfoCard } from "@/components/shared/info-card";
import { PageSkeleton } from "@/components/shared/page-skeleton";
import { useInvoke } from "@/hooks/use-invoke";
import type { SecurityInfo } from "@/types/hardware";

export function SecurityPage() {
  const { t } = useTranslation("Security");
  const { data, loading } = useInvoke<SecurityInfo>("get_security_info");

  if (loading || !data) {
    return <PageSkeleton />;
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <InfoCard icon={ShieldCheck} title={t("systemProtection")}>
        <FieldRow field={data.firewallEnabled} label={t("firewall")} />
        <FieldRow field={data.antivirusStatus} label={t("antivirus")} />
        <FieldRow field={data.defenderStatus} label={t("defender")} />
        <FieldRow field={data.osUpdateStatus} label={t("updates")} />
      </InfoCard>

      <InfoCard icon={LockKeyhole} title={t("diskAndBoot")}>
        <FieldRow field={data.secureBootEnabled} label={t("secureBoot")} />
        <FieldRow field={data.bitlockerStatus} label={t("bitlocker")} />
        <FieldRow field={data.filevaultEnabled} label={t("filevault")} />
        <FieldRow field={data.systemIntegrity} label={t("systemIntegrity")} />
      </InfoCard>

      <InfoCard icon={ShieldQuestion} title={t("platformSecurity")}>
        <FieldRow field={data.tpmPresent} label={t("tpmPresent")} />
        <FieldRow field={data.tpmVersion} label={t("tpmVersion")} />
        <FieldRow field={data.sipEnabled} label={t("sip")} />
        <FieldRow field={data.gatekeeperEnabled} label={t("gatekeeper")} />
      </InfoCard>
    </div>
  );
}
