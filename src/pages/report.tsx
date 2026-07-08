import { invoke } from "@tauri-apps/api/core";
import { save } from "@tauri-apps/plugin-dialog";
import { Download, FileJson, FileText, Shield } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/shared/badge";
import { InfoCard } from "@/components/shared/info-card";
import { Button } from "@/components/ui/button";
import type { SystemReport } from "@/types/hardware";

type ReportFormat = "json" | "txt" | "pdf";

export function ReportPage() {
  const { t } = useTranslation("Report");
  const [maskSensitive, setMaskSensitive] = useState(true);
  const [busyFormat, setBusyFormat] = useState<ReportFormat | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const exportReport = async (format: ReportFormat) => {
    setBusyFormat(format);
    setStatus(null);
    try {
      const report = await invoke<SystemReport>("generate_system_report", {
        maskSensitive,
      });
      if (format === "pdf") {
        await savePdf(report.text);
      } else {
        const path = await save({
          defaultPath: `cpu-m-report.${format}`,
          filters: [
            {
              name: format.toUpperCase(),
              extensions: [format],
            },
          ],
        });
        if (path) {
          await invoke("write_report_file", {
            path,
            contents: format === "json" ? report.json : report.text,
          });
        }
      }
      setStatus(t("exported"));
    } catch (error) {
      setStatus(String(error));
    } finally {
      setBusyFormat(null);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <InfoCard icon={Shield} title={t("privacy")}>
        <label className="flex min-h-8 items-center justify-between gap-4 py-1 text-sm">
          <span className="text-muted-foreground">{t("maskSensitive")}</span>
          <input
            checked={maskSensitive}
            className="size-4 accent-primary"
            onChange={(event) => setMaskSensitive(event.target.checked)}
            type="checkbox"
          />
        </label>
        <div className="py-2">
          <Badge variant={maskSensitive ? "success" : "warning"}>
            {maskSensitive ? t("maskOn") : t("maskOff")}
          </Badge>
        </div>
      </InfoCard>

      <InfoCard icon={Download} title={t("export")}>
        <div className="grid grid-cols-1 gap-2 py-1 sm:grid-cols-3">
          <Button
            disabled={busyFormat !== null}
            onClick={() => exportReport("json")}
            variant="outline"
          >
            <FileJson className="size-4" />
            JSON
          </Button>
          <Button
            disabled={busyFormat !== null}
            onClick={() => exportReport("txt")}
            variant="outline"
          >
            <FileText className="size-4" />
            TXT
          </Button>
          <Button
            disabled={busyFormat !== null}
            onClick={() => exportReport("pdf")}
            variant="outline"
          >
            <Download className="size-4" />
            PDF
          </Button>
        </div>
        <div className="min-h-8 py-1 text-muted-foreground text-sm">
          {busyFormat ? t("generating") : status}
        </div>
      </InfoCard>
    </div>
  );
}

async function savePdf(text: string) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 40;
  const pageHeight = doc.internal.pageSize.getHeight();
  const lines = doc.splitTextToSize(text, 515);
  let y = margin;
  doc.setFont("courier", "normal");
  doc.setFontSize(9);
  for (const line of lines) {
    if (y > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
    doc.text(line, margin, y);
    y += 12;
  }
  doc.save("cpu-m-report.pdf");
}
