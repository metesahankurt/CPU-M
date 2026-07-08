import { CircuitBoard, Cpu, ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { FieldRow } from "@/components/shared/field-row";
import { InfoCard } from "@/components/shared/info-card";
import { PageSkeleton } from "@/components/shared/page-skeleton";
import { useInvoke } from "@/hooks/use-invoke";
import type { MainboardInfo } from "@/types/hardware";

export function MainboardPage() {
  const { t } = useTranslation("Mainboard");
  const { data, loading } = useInvoke<MainboardInfo>("get_mainboard_info");

  if (loading || !data) {
    return <PageSkeleton />;
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <InfoCard icon={CircuitBoard} title={t("board")}>
        <FieldRow field={data.boardManufacturer} label={t("boardManufacturer")} />
        <FieldRow field={data.boardModel} label={t("boardModel")} />
        <FieldRow
          field={data.boardSerialNumber}
          label={t("boardSerialNumber")}
          mono={true}
        />
      </InfoCard>

      <InfoCard icon={Cpu} title={t("firmware")}>
        <FieldRow field={data.biosVendor} label={t("biosVendor")} />
        <FieldRow field={data.biosVersion} label={t("biosVersion")} />
        <FieldRow field={data.biosDate} label={t("biosDate")} />
        <FieldRow field={data.firmwareVersion} label={t("firmwareVersion")} />
        <FieldRow field={data.bootMode} label={t("bootMode")} />
      </InfoCard>

      <InfoCard icon={ShieldCheck} title={t("securityHardware")}>
        <FieldRow field={data.uefi} label={t("uefi")} />
        <FieldRow field={data.secureBoot} label={t("secureBoot")} />
        <FieldRow field={data.secureBootLevel} label={t("secureBootLevel")} />
        <FieldRow field={data.tpmPresent} label={t("tpmPresent")} />
        <FieldRow field={data.tpmVersion} label={t("tpmVersion")} />
      </InfoCard>
    </div>
  );
}
