import { invoke } from "@tauri-apps/api/core";
import { openUrl } from "@tauri-apps/plugin-opener";
import {
  CheckCircle2,
  Clock,
  Download,
  Loader2,
  MinusCircle,
  MonitorX,
  Search,
  X,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Badge } from "@/components/shared/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useInvoke } from "@/hooks/use-invoke";
import { appCatalog, allCatalogApps } from "@/config/app-catalog";
import { usePlatformStore } from "@/stores/platform-store";
import type { AppCategory, CatalogApp } from "@/config/app-catalog";
import type { AppInstallResult, PackageManagerStatus } from "@/types/apps";

type InstallPhase =
  | "queued"
  | "installing"
  | "installed"
  | "already"
  | "failed"
  | "cancelled";

interface InstallState {
  phase: InstallPhase;
  message?: string;
}

/** The catalog id used by the current platform's package manager. */
function packageIdFor(app: CatalogApp, os: string): string | undefined {
  if (os === "windows") {
    return app.wingetId;
  }
  if (os === "macos") {
    return app.brewId;
  }
  return undefined;
}

function StatusIcon({ state }: { state: InstallState | undefined }) {
  const { t } = useTranslation("Apps");
  if (!state) {
    return null;
  }
  switch (state.phase) {
    case "queued":
      return <Clock aria-label={t("statusQueued")} className="size-4 text-muted-foreground" />;
    case "installing":
      return (
        <Loader2
          aria-label={t("statusInstalling")}
          className="size-4 animate-spin text-primary"
        />
      );
    case "installed":
      return (
        <CheckCircle2
          aria-label={t("statusInstalled")}
          className="size-4 text-emerald-600 dark:text-emerald-400"
        />
      );
    case "already":
      return (
        <CheckCircle2
          aria-label={t("statusAlready")}
          className="size-4 text-muted-foreground"
        />
      );
    case "failed":
      return (
        <XCircle
          aria-label={t("statusFailed")}
          className="size-4 text-destructive"
        >
          <title>{state.message ?? t("statusFailed")}</title>
        </XCircle>
      );
    case "cancelled":
      return (
        <MinusCircle
          aria-label={t("statusCancelled")}
          className="size-4 text-muted-foreground"
        />
      );
  }
}

interface CategoryCardProps {
  category: AppCategory;
  apps: CatalogApp[];
  os: string;
  selected: Set<string>;
  statuses: Record<string, InstallState>;
  installedIds: Set<string>;
  running: boolean;
  onToggle: (id: string) => void;
  onToggleAll: (ids: string[], select: boolean) => void;
}

function CategoryCard({
  category,
  apps,
  os,
  selected,
  statuses,
  installedIds,
  running,
  onToggle,
  onToggleAll,
}: CategoryCardProps) {
  const { t, i18n } = useTranslation("Apps");
  const lang = i18n.language.toLowerCase().startsWith("tr") ? "tr" : "en";
  const Icon = category.icon;
  const selectedCount = apps.filter((a) => selected.has(a.id)).length;
  const allSelected = selectedCount === apps.length;

  return (
    <Card className="gap-3">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Checkbox
            aria-label={t("selectAll")}
            checked={allSelected ? true : selectedCount > 0 ? "indeterminate" : false}
            disabled={running}
            onCheckedChange={() => {
              onToggleAll(
                apps.map((a) => a.id),
                !allSelected,
              );
            }}
          />
          <Icon className="size-4 text-muted-foreground" />
          {t(`categories.${category.key}`)}
          <Badge variant="muted">{apps.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="divide-y divide-border/60">
        {apps.map((app) => {
          const state = statuses[app.id];
          const packageId = packageIdFor(app, os);
          return (
            <label
              className="flex min-h-9 cursor-pointer items-center gap-3 py-1.5"
              key={app.id}
            >
              <Checkbox
                checked={selected.has(app.id)}
                disabled={running}
                onCheckedChange={() => onToggle(app.id)}
              />
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="truncate font-medium text-sm">
                    {app.name}
                  </span>
                  {packageId !== undefined &&
                    installedIds.has(packageId) &&
                    !state && (
                      <Badge variant="success">{t("installed")}</Badge>
                    )}
                </span>
                <span
                  className="block truncate text-muted-foreground text-xs"
                  title={
                    state?.phase === "failed" && state.message
                      ? state.message
                      : app.description[lang]
                  }
                >
                  {state?.phase === "failed" && state.message
                    ? state.message
                    : app.description[lang]}
                </span>
              </span>
              <StatusIcon state={state} />
            </label>
          );
        })}
      </CardContent>
    </Card>
  );
}

export function AppsPage() {
  const { t } = useTranslation("Apps");
  const platform = usePlatformStore((s) => s.platform);
  const pm = useInvoke<PackageManagerStatus>("get_package_manager_status");

  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [statuses, setStatuses] = useState<Record<string, InstallState>>({});
  const [installedIds, setInstalledIds] = useState<Set<string>>(new Set());
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const cancelRef = useRef(false);

  const os = platform?.os ?? "";
  const supported = os === "windows" || os === "macos";

  useEffect(() => {
    if (!supported) {
      return;
    }
    let cancelled = false;
    const ids = allCatalogApps
      .map((a) => packageIdFor(a, os))
      .filter((id): id is string => id !== undefined);
    invoke<string[]>("get_installed_app_ids", { ids })
      .then((installed) => {
        if (!cancelled) {
          setInstalledIds(new Set(installed));
        }
      })
      .catch(() => {
        // package manager listing failed; badges simply don't show
      });
    return () => {
      cancelled = true;
    };
  }, [supported, os]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return appCatalog
      .map((c) => ({
        category: c,
        apps: c.apps.filter((a) => {
          if (packageIdFor(a, os) === undefined) {
            return false;
          }
          if (!query) {
            return true;
          }
          return (
            a.name.toLowerCase().includes(query) ||
            a.wingetId?.toLowerCase().includes(query) ||
            a.brewId?.toLowerCase().includes(query)
          );
        }),
      }))
      .filter((c) => c.apps.length > 0);
  }, [search, os]);

  if (platform && !supported) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
          <MonitorX className="size-8 text-muted-foreground" />
          <p className="text-muted-foreground text-sm">{t("unsupportedOs")}</p>
        </CardContent>
      </Card>
    );
  }

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleAll = (ids: string[], select: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      for (const id of ids) {
        if (select) {
          next.add(id);
        } else {
          next.delete(id);
        }
      }
      return next;
    });
  };

  const install = async () => {
    const queue = allCatalogApps.filter(
      (a) => selected.has(a.id) && packageIdFor(a, os) !== undefined,
    );
    if (queue.length === 0) {
      return;
    }
    setRunning(true);
    cancelRef.current = false;
    setProgress({ done: 0, total: queue.length });
    setStatuses(
      Object.fromEntries(queue.map((a) => [a.id, { phase: "queued" as const }])),
    );

    let ok = 0;
    let failed = 0;
    for (const app of queue) {
      if (cancelRef.current) {
        setStatuses((s) => ({ ...s, [app.id]: { phase: "cancelled" } }));
        continue;
      }
      const packageId = packageIdFor(app, os);
      if (packageId === undefined) {
        continue;
      }
      setStatuses((s) => ({ ...s, [app.id]: { phase: "installing" } }));
      try {
        const result = await invoke<AppInstallResult>("install_app", {
          packageId,
          source: os === "windows" ? (app.source ?? null) : null,
        });
        if (result.status === "failed") {
          failed += 1;
          setStatuses((s) => ({
            ...s,
            [app.id]: {
              phase: "failed",
              message: result.message ?? undefined,
            },
          }));
        } else {
          ok += 1;
          setStatuses((s) => ({
            ...s,
            [app.id]: {
              phase:
                result.status === "already_installed" ? "already" : "installed",
            },
          }));
          setInstalledIds((prev) => new Set(prev).add(packageId));
        }
      } catch (err) {
        failed += 1;
        setStatuses((s) => ({
          ...s,
          [app.id]: { phase: "failed", message: String(err) },
        }));
      }
      setProgress((p) => ({ ...p, done: p.done + 1 }));
    }

    setRunning(false);
    if (cancelRef.current) {
      toast.info(t("toastCancelled"));
    } else if (failed > 0) {
      toast.warning(t("toastDone", { ok, failed }));
    } else {
      toast.success(t("toastDone", { ok, failed }));
    }
  };

  const managerMissing = pm.data !== null && !pm.data.available;
  const managerName =
    pm.data?.manager ?? (os === "macos" ? "Homebrew" : "winget");
  const missingHint =
    os === "macos" ? t("brewMissingHint") : t("wingetMissingHint");
  const missingButton = os === "macos" ? t("brewInstall") : t("wingetInstall");
  const missingUrl =
    os === "macos"
      ? "https://brew.sh"
      : "https://apps.microsoft.com/detail/9nblggh4nns1";

  return (
    <div className="flex flex-col gap-4">
      <Card className="gap-3">
        <CardHeader>
          <CardTitle className="flex flex-wrap items-center gap-2 text-base">
            {t("title")}
            {pm.data?.available && (
              <Badge variant="success">
                {managerName} {pm.data.version}
              </Badge>
            )}
            {managerMissing && (
              <Badge variant="warning">
                {t("managerMissing", { name: managerName })}
              </Badge>
            )}
          </CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-48 flex-1">
            <Search className="-translate-y-1/2 absolute top-1/2 left-2.5 size-4 text-muted-foreground" />
            <Input
              className="pl-8"
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("searchPlaceholder")}
              value={search}
            />
          </div>
          <Badge variant="muted">
            {t("selectedCount", { count: selected.size })}
          </Badge>
          {running ? (
            <>
              <Badge variant="muted">
                {t("installingProgress", {
                  done: progress.done,
                  total: progress.total,
                })}
              </Badge>
              <Button
                onClick={() => {
                  cancelRef.current = true;
                }}
                size="sm"
                variant="outline"
              >
                <X className="size-4" />
                {t("cancel")}
              </Button>
            </>
          ) : (
            <>
              <Button
                disabled={selected.size === 0}
                onClick={() => setSelected(new Set())}
                size="sm"
                variant="outline"
              >
                {t("clearSelection")}
              </Button>
              <Button
                disabled={selected.size === 0 || managerMissing}
                onClick={() => {
                  void install();
                }}
                size="sm"
              >
                <Download className="size-4" />
                {t("installSelected")}
              </Button>
            </>
          )}
        </CardContent>
        {managerMissing && (
          <CardContent className="pt-0">
            <div className="flex flex-wrap items-center gap-2 text-muted-foreground text-sm">
              {missingHint}
              <Button
                onClick={() => {
                  openUrl(missingUrl).catch(() => {
                    // opener denied; nothing to recover
                  });
                }}
                size="sm"
                variant="outline"
              >
                {missingButton}
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground text-sm">
            {t("noResults")}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-2">
          {filtered.map(({ category, apps }) => (
            <CategoryCard
              apps={apps}
              category={category}
              installedIds={installedIds}
              key={category.key}
              onToggle={toggle}
              onToggleAll={toggleAll}
              os={os}
              running={running}
              selected={selected}
              statuses={statuses}
            />
          ))}
        </div>
      )}
    </div>
  );
}
