import {
  Check,
  Download,
  Laptop,
  Moon,
  Paintbrush,
  RefreshCw,
  Sun,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { InfoCard } from "@/components/shared/info-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { themes } from "@/config/themes";
import { useThemeTransition } from "@/hooks/use-theme-transition";
import { checkAndInstallUpdate } from "@/lib/updater";
import { cn } from "@/lib/utils";
import { useSettingsStore } from "@/stores/settings-store";
import type { Language } from "@/stores/settings-store";

const REFRESH_OPTIONS = [500, 1000, 2000, 5000];

function ModeButtons() {
  const { theme, handleThemeChange } = useThemeTransition();
  const { t } = useTranslation("ModeCard");
  const options = [
    { value: "light", icon: Sun, label: t("light") },
    { value: "dark", icon: Moon, label: t("dark") },
    { value: "system", icon: Laptop, label: t("system") },
  ] as const;

  return (
    <div className="flex gap-2">
      {options.map(({ value, icon: Icon, label }) => (
        <Button
          className="gap-2"
          key={value}
          onClick={(e) => handleThemeChange(value, e)}
          size="sm"
          variant={theme === value ? "default" : "outline"}
        >
          <Icon className="size-4" />
          {label}
        </Button>
      ))}
    </div>
  );
}

function ThemeGrid() {
  const { t } = useTranslation("Settings");
  const { colorTheme, setColorTheme } = useSettingsStore();
  const [query, setQuery] = useState("");

  const filtered = themes.filter((theme) =>
    theme.label.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="flex flex-col gap-3">
      <Input
        className="max-w-xs"
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t("searchTheme")}
        value={query}
      />
      {filtered.length === 0 && (
        <p className="text-muted-foreground text-sm">{t("noThemeFound")}</p>
      )}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {filtered.map((theme) => (
          <button
            className={cn(
              "flex flex-col gap-2 rounded-lg border p-3 text-left transition-colors hover:bg-accent",
              colorTheme === theme.name && "border-primary ring-1 ring-primary",
            )}
            key={theme.name}
            onClick={() => setColorTheme(theme.name)}
            type="button"
          >
            <span className="flex items-center justify-between">
              <span className="font-medium text-xs">{theme.label}</span>
              {colorTheme === theme.name && (
                <Check className="size-3 text-primary" />
              )}
            </span>
            <span className="flex gap-1">
              {theme.lightPalette.map((color, i) => (
                <span
                  className="size-4 rounded-full border"
                  // biome-ignore lint/suspicious/noArrayIndexKey: palette order is stable
                  key={i}
                  style={{ backgroundColor: color }}
                />
              ))}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function UpdatesCard() {
  const { t } = useTranslation("Settings");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState(t("updateIdle"));
  const [progress, setProgress] = useState<number | null>(null);

  const handleCheck = async () => {
    setBusy(true);
    setProgress(null);
    await checkAndInstallUpdate({
      onStatus: (next, detail) => {
        if (next === "checking") {
          setStatus(t("updateChecking"));
        } else if (next === "not-available") {
          setStatus(t("updateNone"));
        } else if (next === "available") {
          setStatus(t("updateAvailable", { version: detail }));
        } else if (next === "downloading") {
          setStatus(t("updateDownloading"));
        } else if (next === "installing") {
          setStatus(t("updateInstalling"));
        } else if (next === "installed") {
          setStatus(t("updateInstalled"));
        } else {
          setStatus(t("updateError"));
        }
      },
      onProgress: (downloaded, total) => {
        if (total && total > 0) {
          setProgress(Math.round((downloaded / total) * 100));
        }
      },
    });
    setBusy(false);
  };

  return (
    <InfoCard description={t("updatesDesc")} icon={Download} title={t("updates")}>
      <div className="flex flex-col gap-3 py-2">
        <div className="text-muted-foreground text-sm">
          {status}
          {progress !== null ? ` (${progress}%)` : ""}
        </div>
        <Button
          className="w-fit gap-2"
          disabled={busy}
          onClick={handleCheck}
          variant="outline"
        >
          <RefreshCw className={cn("size-4", busy && "animate-spin")} />
          {t("checkUpdates")}
        </Button>
      </div>
    </InfoCard>
  );
}

export function SettingsPage() {
  const { t, i18n } = useTranslation("Settings");
  const { language, setLanguage, refreshIntervalMs, setRefreshIntervalMs } =
    useSettingsStore();

  return (
    <div className="flex flex-col gap-4">
      <InfoCard
        description={t("appearanceDesc")}
        icon={Paintbrush}
        title={t("appearance")}
      >
        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-2">
            <Label>{t("mode")}</Label>
            <ModeButtons />
          </div>
          <div className="flex flex-col gap-2">
            <Label>{t("colorTheme")}</Label>
            <p className="text-muted-foreground text-xs">
              {t("colorThemeDesc")}
            </p>
            <ThemeGrid />
          </div>
        </div>
      </InfoCard>

      <InfoCard description={t("languageDesc")} title={t("language")}>
        <div className="py-2">
          <Select
            onValueChange={(value) => {
              const lang = value as Language;
              setLanguage(lang);
              i18n.changeLanguage(lang);
            }}
            value={language}
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tr">{t("turkish")}</SelectItem>
              <SelectItem value="en">{t("english")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </InfoCard>

      <InfoCard
        description={t("refreshDesc")}
        icon={RefreshCw}
        title={t("refresh")}
      >
        <div className="flex flex-col gap-2 py-2">
          <Label>{t("refreshInterval")}</Label>
          <Select
            onValueChange={(value) => setRefreshIntervalMs(Number(value))}
            value={String(refreshIntervalMs)}
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {REFRESH_OPTIONS.map((ms) => (
                <SelectItem key={ms} value={String(ms)}>
                  {ms / 1000} s
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </InfoCard>

      <UpdatesCard />
    </div>
  );
}
