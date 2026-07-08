import { relaunch } from "@tauri-apps/plugin-process";
import { check } from "@tauri-apps/plugin-updater";
import type { DownloadEvent } from "@tauri-apps/plugin-updater";

export type UpdateStatus =
  | "checking"
  | "not-available"
  | "available"
  | "downloading"
  | "installing"
  | "installed"
  | "error";

interface UpdateCallbacks {
  onStatus?: (status: UpdateStatus, detail?: string) => void;
  onProgress?: (downloaded: number, total?: number) => void;
}

let updateInFlight = false;

export async function checkAndInstallUpdate({
  onStatus,
  onProgress,
}: UpdateCallbacks = {}) {
  if (updateInFlight) {
    return;
  }
  updateInFlight = true;

  try {
    onStatus?.("checking");
    const update = await check({ timeout: 8000 });

    if (!update) {
      onStatus?.("not-available");
      return;
    }

    onStatus?.("available", update.version);
    let downloaded = 0;
    let total: number | undefined;

    const handleDownload = (event: DownloadEvent) => {
      if (event.event === "Started") {
        downloaded = 0;
        total = event.data.contentLength;
        onStatus?.("downloading", update.version);
        onProgress?.(downloaded, total);
      } else if (event.event === "Progress") {
        downloaded += event.data.chunkLength;
        onProgress?.(downloaded, total);
      } else {
        onStatus?.("installing", update.version);
      }
    };

    await update.downloadAndInstall(handleDownload);
    onStatus?.("installed", update.version);
    await relaunch();
  } catch (error) {
    onStatus?.("error", String(error));
  } finally {
    updateInFlight = false;
  }
}
