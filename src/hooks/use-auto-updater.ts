import { useEffect } from "react";
import { toast } from "sonner";
import { checkAndInstallUpdate } from "@/lib/updater";

let autoUpdateStarted = false;

export function useAutoUpdater() {
  useEffect(() => {
    if (autoUpdateStarted) {
      return;
    }
    autoUpdateStarted = true;

    const id = window.setTimeout(() => {
      checkAndInstallUpdate({
        onStatus: (status, detail) => {
          if (status === "available") {
            toast.info(`New release ${detail} found. Installing update...`);
          } else if (status === "installed") {
            toast.success("Update installed. Restarting...");
          }
        },
      });
    }, 3000);

    return () => window.clearTimeout(id);
  }, []);
}
