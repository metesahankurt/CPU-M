import { writeText } from "@tauri-apps/plugin-clipboard-manager";
import { Check, Copy, ShieldAlert } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/shared/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { Field } from "@/lib/field";

interface FieldRowProps {
  label: string;
  field?: Field<string | number | boolean> | undefined;
  /** Plain value rows (already formatted) can skip the Field wrapper. */
  value?: string | number | undefined;
  mono?: boolean;
}

/**
 * A single labeled key-value row (CPU-X's lab/val pattern). Renders an
 * "unavailable" badge for missing data and a copy button on hover.
 */
export function FieldRow({ label, field, value, mono = false }: FieldRowProps) {
  const { t } = useTranslation("Common");
  const [copied, setCopied] = useState(false);

  let display: string | undefined = value !== undefined ? String(value) : undefined;
  let unavailable = false;
  let requiresAdmin = false;

  if (field) {
    if (field.status === "ok") {
      display =
        typeof field.value === "boolean"
          ? field.value
            ? t("yes")
            : t("no")
          : String(field.value);
    } else if (field.status === "requires_admin") {
      requiresAdmin = true;
    } else {
      unavailable = true;
    }
  } else if (display === undefined) {
    unavailable = true;
  }

  const handleCopy = async () => {
    if (display === undefined) {
      return;
    }
    try {
      await writeText(display);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // clipboard access denied; ignore
    }
  };

  return (
    <div className="group flex min-h-8 items-center justify-between gap-4 py-1">
      <span className="shrink-0 text-muted-foreground text-sm">{label}</span>
      <span className="flex min-w-0 items-center gap-1">
        {unavailable && (
          <Badge variant="muted">{t("unavailable")}</Badge>
        )}
        {requiresAdmin && (
          <Badge variant="warning">
            <ShieldAlert className="size-3" />
            {t("requiresAdmin")}
          </Badge>
        )}
        {!(unavailable || requiresAdmin) && (
          <>
            <span
              className={cn(
                "truncate text-right text-sm",
                mono && "font-mono text-xs",
              )}
              title={display}
            >
              {display}
            </span>
            <Tooltip>
              <TooltipTrigger asChild={true}>
                <Button
                  className="size-6 opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={handleCopy}
                  size="icon"
                  variant="ghost"
                >
                  {copied ? (
                    <Check className="size-3" />
                  ) : (
                    <Copy className="size-3" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{copied ? t("copied") : t("copy")}</TooltipContent>
            </Tooltip>
          </>
        )}
      </span>
    </div>
  );
}
