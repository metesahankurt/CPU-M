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

For fully automatic releases, add these GitHub repository secrets once:

- `TAURI_SIGNING_PRIVATE_KEY`: the content of the private updater key, or a
  path on the runner if you manage the file yourself.
- `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`: empty for the current generated key,
  or the key password if you regenerate it with a password.

The local private key generated during setup is stored at
`~/.tauri/cpu-m-updater.key`; keep it secret. After the secrets are configured,
each push to `master` or `main` automatically bumps the patch version, commits
`chore(release): vX.Y.Z`, tags it, builds macOS and Windows bundles, uploads a
GitHub Release, and attaches `latest.json`. Installed apps will detect the new
release, download it, install it, and relaunch automatically.

Manual tag releases are still supported through the `Release` workflow.
