import { BadgeCheck, KeyRound, SearchCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/shared/badge";
import { FieldRow } from "@/components/shared/field-row";
import { InfoCard } from "@/components/shared/info-card";
import { PageSkeleton } from "@/components/shared/page-skeleton";
import { useInvoke } from "@/hooks/use-invoke";
import type { LicenseInfo } from "@/types/hardware";

export function LicensePage() {
  const { t } = useTranslation("License");
  const { data, loading } = useInvoke<LicenseInfo>("get_license_info");

  if (loading || !data) {
    return <PageSkeleton />;
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <InfoCard icon={KeyRound} title={t("activation")}>
        <FieldRow field={data.productName} label={t("productName")} />
        <FieldRow field={data.edition} label={t("edition")} />
        <FieldRow field={data.activationStatus} label={t("activationStatus")} />
        <FieldRow field={data.licenseStatus} label={t("licenseStatus")} />
        <FieldRow field={data.licenseChannel} label={t("licenseChannel")} />
        <FieldRow
          field={data.partialProductKey}
          label={t("partialProductKey")}
          mono={true}
        />
      </InfoCard>

      <InfoCard icon={BadgeCheck} title={t("authenticity")}>
        <FieldRow field={data.authenticitySummary} label={t("summary")} />
        <FieldRow field={data.appleModelRecognized} label={t("appleModel")} />
        <FieldRow field={data.officialOsBuild} label={t("officialOs")} />
      </InfoCard>

      <InfoCard icon={SearchCheck} title={t("checks")}>
        <div className="flex flex-wrap gap-1.5 py-1">
          {data.integrityChecks.length > 0 ? (
            data.integrityChecks.map((check) => (
              <Badge key={check} variant="success">
                {check}
              </Badge>
            ))
          ) : (
            <Badge variant="muted">{t("noChecks")}</Badge>
          )}
        </div>
        <FieldRow
          field={
            data.hackintoshIndicators.length > 0
              ? { status: "ok", value: data.hackintoshIndicators.join(", ") }
              : { status: "ok", value: t("noIndicators") }
          }
          label={t("indicators")}
        />
      </InfoCard>
    </div>
  );
}
