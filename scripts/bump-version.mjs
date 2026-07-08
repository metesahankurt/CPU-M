import fs from "node:fs";

const bump = process.argv[2] ?? "patch";
const packagePath = "package.json";
const tauriConfigPath = "src-tauri/tauri.conf.json";
const cargoTomlPath = "src-tauri/Cargo.toml";
const cargoLockPath = "src-tauri/Cargo.lock";

const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8"));
const nextVersion = nextSemver(packageJson.version, bump);
packageJson.version = nextVersion;
fs.writeFileSync(packagePath, `${JSON.stringify(packageJson, null, 2)}\n`);

const tauriConfig = JSON.parse(fs.readFileSync(tauriConfigPath, "utf8"));
tauriConfig.version = nextVersion;
fs.writeFileSync(tauriConfigPath, `${JSON.stringify(tauriConfig, null, 2)}\n`);

replaceFile(cargoTomlPath, /(^version\s*=\s*")[^"]+(")/m, `$1${nextVersion}$2`);
replaceFile(
  cargoLockPath,
  /(name\s*=\s*"cpu-m"\nversion\s*=\s*")[^"]+(")/m,
  `$1${nextVersion}$2`,
);

console.log(nextVersion);

function nextSemver(version, kind) {
  const match = version.match(/^(\d+)\.(\d+)\.(\d+)$/);
  if (!match) {
    throw new Error(`Unsupported version: ${version}`);
  }
  let [, major, minor, patch] = match.map(Number);
  if (kind === "major") {
    major += 1;
    minor = 0;
    patch = 0;
  } else if (kind === "minor") {
    minor += 1;
    patch = 0;
  } else if (kind === "patch") {
    patch += 1;
  } else {
    throw new Error(`Unsupported bump kind: ${kind}`);
  }
  return `${major}.${minor}.${patch}`;
}

function replaceFile(path, pattern, replacement) {
  const input = fs.readFileSync(path, "utf8");
  const output = input.replace(pattern, replacement);
  if (input === output) {
    throw new Error(`Could not update ${path}`);
  }
  fs.writeFileSync(path, output);
}
