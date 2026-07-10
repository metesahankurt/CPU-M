import { openUrl } from "@tauri-apps/plugin-opener";
import {
  CircuitBoard,
  Download,
  ExternalLink,
  MonitorCog,
  MonitorX,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/shared/badge";
import { FieldRow } from "@/components/shared/field-row";
import { InfoCard } from "@/components/shared/info-card";
import { PageSkeleton } from "@/components/shared/page-skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useInvoke } from "@/hooks/use-invoke";
import { buildDriverRecommendations } from "@/lib/drivers";
import { usePlatformStore } from "@/stores/platform-store";
import type { DriverRecommendation, DriverStatus } from "@/lib/drivers";
import type { CpuStaticInfo } from "@/types/cpu";
import type { GpuInfo } from "@/types/hardware";

const statusBadge: Record<
  DriverStatus,
  { variant: "success" | "warning" | "muted"; key: string }
> = {
  installed: { variant: "success", key: "statusInstalled" },
  missing: { variant: "warning", key: "statusMissing" },
  unknown: { variant: "muted", key: "statusUnknown" },
};

function RecommendationCard({ rec }: { rec: DriverRecommendation }) {
  const { t } = useTranslation("Drivers");
  const status = statusBadge[rec.status];

  return (
    <InfoCard
      icon={rec.kind === "gpu" ? MonitorCog : CircuitBoard}
      title={rec.deviceName ?? t(rec.kind === "gpu" ? "gpuDriver" : "chipsetDriver")}
    >
      <div className="flex flex-wrap gap-1.5 py-1">
        <Badge variant="muted">
          {t(rec.kind === "gpu" ? "gpuDriver" : "chipsetDriver")}
        </Badge>
        {rec.kind === "gpu" && (
          <Badge variant={status.variant}>{t(status.key)}</Badge>
        )}
      </div>
      {rec.vendorName && <FieldRow label={t("vendor")} value={rec.vendorName} />}
      {rec.driverVersion && (
        <FieldRow field={rec.driverVersion} label={t("installedVersion")} />
      )}
      {rec.deviceId && (
        <FieldRow label={t("deviceId")} mono={true} value={rec.deviceId} />
      )}
      <p className="py-2 text-muted-foreground text-sm">{t(rec.noteKey)}</p>
      <div className="flex flex-wrap gap-2 pt-2">
        {rec.links.map((link, i) => (
          <Button
            key={link.labelKey}
            onClick={() => {
              openUrl(link.url).catch(() => {
                // opener denied; nothing to recover
              });
            }}
            size="sm"
            variant={i === 0 ? "default" : "outline"}
          >
            {i === 0 ? (
              <Download className="size-4" />
            ) : (
              <ExternalLink className="size-4" />
            )}
            {t(link.labelKey)}
          </Button>
        ))}
      </div>
    </InfoCard>
  );
}

export function DriversPage() {
  const { t } = useTranslation("Drivers");
  const platform = usePlatformStore((s) => s.platform);
  const gpus = useInvoke<GpuInfo[]>("get_gpu_info");
  const cpu = useInvoke<CpuStaticInfo>("get_cpu_static");

  if (platform && platform.os !== "windows") {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
          <MonitorX className="size-8 text-muted-foreground" />
          <p className="text-muted-foreground text-sm">{t("windowsOnly")}</p>
        </CardContent>
      </Card>
    );
  }

  if (gpus.loading || cpu.loading) {
    return <PageSkeleton />;
  }

  const recommendations = buildDriverRecommendations(gpus.data, cpu.data);
  const missingCount = recommendations.filter(
    (r) => r.status === "missing",
  ).length;

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardContent className="flex flex-col gap-2 py-1">
          <p className="text-sm">{t("description")}</p>
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="muted">
              {t("detectedCount", { count: recommendations.length })}
            </Badge>
            {missingCount > 0 ? (
              <Badge variant="warning">
                {t("missingCount", { count: missingCount })}
              </Badge>
            ) : (
              <Badge variant="success">{t("allGood")}</Badge>
            )}
          </div>
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {recommendations.map((rec) => (
          <RecommendationCard key={rec.id} rec={rec} />
        ))}
      </div>
    </div>
  );
}
