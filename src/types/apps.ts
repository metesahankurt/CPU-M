export interface PackageManagerStatus {
  /** "winget" | "Homebrew"; null on unsupported platforms. */
  manager: string | null;
  available: boolean;
  version: string | null;
}

export interface AppInstallResult {
  packageId: string;
  /** "installed" | "already_installed" | "failed" */
  status: string;
  exitCode: number | null;
  message: string | null;
}
