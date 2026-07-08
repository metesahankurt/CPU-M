import { HardDrive, Layers } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/shared/badge";
import { FieldRow } from "@/components/shared/field-row";
import { InfoCard } from "@/components/shared/info-card";
import { PageSkeleton } from "@/components/shared/page-skeleton";
import { UsageBar } from "@/components/shared/usage-bar";
import { useInvoke } from "@/hooks/use-invoke";
import { fieldValue } from "@/lib/field";
import { formatBytes, formatPercent } from "@/lib/format";
import type { Field } from "@/lib/field";
import type { StorageInfo } from "@/types/hardware";

function bytesField(field: Field<number>): Field<string> {
  return field.status === "ok"
    ? { status: "ok", value: formatBytes(field.value) }
    : field;
}

export function StoragePage() {
  const { t } = useTranslation("Storage");
  const { data, loading } = useInvoke<StorageInfo>("get_storage_info");

  if (loading || !data) {
    return <PageSkeleton />;
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
        {t("physicalDisks")}
      </h2>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {data.disks.map((disk, i) => {
          const internal = fieldValue(disk.internal);
          const removable = fieldValue(disk.removable);
          return (
            <InfoCard
              icon={HardDrive}
              key={`disk-${i.toFixed()}`}
              title={fieldValue(disk.model) ?? `${t("disk")} ${i + 1}`}
            >
              <div className="flex gap-1.5 py-1">
                {internal !== undefined && (
                  <Badge variant="muted">
                    {internal ? t("internal") : t("external")}
                  </Badge>
                )}
                {removable && <Badge variant="warning">{t("removable")}</Badge>}
              </div>
              <FieldRow field={disk.identifier} label={t("identifier")} mono={true} />
              <FieldRow field={disk.kind} label={t("kind")} />
              <FieldRow field={disk.bus} label={t("bus")} />
              <FieldRow field={bytesField(disk.sizeBytes)} label={t("size")} />
              <FieldRow
                field={disk.serialNumber}
                label={t("serialNumber")}
                mono={true}
              />
              <FieldRow field={disk.smartStatus} label={t("smartStatus")} />
            </InfoCard>
          );
        })}
      </div>

      <h2 className="mt-2 font-semibold text-sm text-muted-foreground uppercase tracking-wide">
        {t("volumes")}
      </h2>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {data.volumes.map((volume, i) => {
          const usage = fieldValue(volume.usagePercent);
          const isSystem = fieldValue(volume.isSystem);
          const removable = fieldValue(volume.isRemovable);
          return (
            <InfoCard
              icon={Layers}
              key={`vol-${i.toFixed()}`}
              title={fieldValue(volume.name) ?? `${t("volume")} ${i + 1}`}
            >
              <div className="flex gap-1.5 py-1">
                {isSystem && <Badge variant="success">{t("systemVolume")}</Badge>}
                {removable && <Badge variant="warning">{t("removable")}</Badge>}
              </div>
              <div className="flex flex-col gap-2 py-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t("usage")}</span>
                  <span className="font-medium">
                    {usage !== undefined ? formatPercent(usage, 1) : "—"}
                  </span>
                </div>
                <UsageBar percent={usage ?? 0} />
              </div>
              <FieldRow field={volume.mountPoint} label={t("mountPoint")} mono={true} />
              <FieldRow field={volume.filesystem} label={t("filesystem")} />
              <FieldRow field={bytesField(volume.totalBytes)} label={t("total")} />
              <FieldRow field={bytesField(volume.usedBytes)} label={t("used")} />
              <FieldRow
                field={bytesField(volume.availableBytes)}
                label={t("available")}
              />
            </InfoCard>
          );
        })}
      </div>
    </div>
  );
}
