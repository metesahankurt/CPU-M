# CPU-M

Detailed Windows and macOS system information app built with Tauri, React, and
TypeScript.

## Development

- `pnpm build`
- `cargo test --manifest-path src-tauri/Cargo.toml`
- `cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings`
- `pnpm tauri build`

## Releases and Auto Updates

The app uses the Tauri v2 updater and checks GitHub Releases at:

`https://github.com/metesahankurt/CPU-M/releases/latest/download/latest.json`

For release builds that generate updater artifacts, add these GitHub repository
secrets:

- `TAURI_SIGNING_PRIVATE_KEY`: the content of the private updater key, or a
  path on the runner if you manage the file yourself.
- `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`: empty for the current generated key,
  or the key password if you regenerate it with a password.

The local private key generated during setup is stored at
`~/.tauri/cpu-m-updater.key`; keep it secret. To publish an update, bump the app
version, push a tag such as `v0.1.1`, and the `Release` workflow builds signed
artifacts plus `latest.json`. Installed apps will detect the new release,
download it, install it, and relaunch automatically.
