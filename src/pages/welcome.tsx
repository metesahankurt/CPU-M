import { Activity, ArrowRight, Cpu, Lock, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/shared/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getPlatformInfo } from "@/lib/tauri";
import { usePlatformStore } from "@/stores/platform-store";

const features = [
  { key: "hardware", icon: Search },
  { key: "realtime", icon: Activity },
  { key: "privacy", icon: Lock },
] as const;

export function WelcomePage() {
  const { t } = useTranslation("Welcome");
  const navigate = useNavigate();
  const { platform, setPlatform } = usePlatformStore();
  const [analyzing, setAnalyzing] = useState(!platform);

  useEffect(() => {
    if (platform) {
      return;
    }
    let cancelled = false;
    // Detect the platform while the analysis animation plays; keep the
    // animation visible for a moment so the transition doesn't flash.
    const started = Date.now();
    getPlatformInfo()
      .then((info) => {
        if (cancelled) {
          return;
        }
        const elapsed = Date.now() - started;
        setTimeout(
          () => {
            setPlatform(info);
            setAnalyzing(false);
          },
          Math.max(0, 900 - elapsed),
        );
      })
      .catch(() => {
        if (!cancelled) {
          setAnalyzing(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [platform, setPlatform]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 bg-background p-8">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex size-20 items-center justify-center rounded-3xl bg-primary shadow-lg">
          <Cpu className="size-10 text-primary-foreground" />
        </div>
        <div>
          <h1 className="font-bold text-4xl tracking-tight">{t("title")}</h1>
          <p className="mt-1 text-lg text-muted-foreground">{t("tagline")}</p>
        </div>
        <p className="max-w-xl text-balance text-muted-foreground text-sm">
          {t("description")}
        </p>
      </div>

      <div className="grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3">
        {features.map(({ key, icon: Icon }) => (
          <Card className="py-4" key={key}>
            <CardContent className="flex flex-col items-center gap-2 px-4 text-center">
              <Icon className="size-5 text-primary" />
              <span className="font-medium text-sm">
                {t(`features.${key}`)}
              </span>
              <span className="text-muted-foreground text-xs">
                {t(`features.${key}Desc`)}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">{t("detectedOs")}:</span>
          {platform ? (
            <Badge variant="success">
              {platform.osName} {platform.osVersion}
              {platform.chipName ? ` · ${platform.chipName}` : ""}
            </Badge>
          ) : (
            <Skeleton className="h-5 w-40" />
          )}
        </div>

        {analyzing ? (
          <div className="flex items-center gap-3">
            <div className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span className="text-muted-foreground text-sm">
              {t("analyzing")}
            </span>
          </div>
        ) : (
          <Button
            className="gap-2"
            onClick={() => navigate("/app/overview")}
            size="lg"
          >
            {t("start")}
            <ArrowRight className="size-4" />
          </Button>
        )}
      </div>
    </main>
  );
}
