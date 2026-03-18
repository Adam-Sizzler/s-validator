# s-validator

WASM-based `sing-box` configuration validator with a single-version GitHub Pages deployment.

## URL structure

- `https://adam-sizzler.github.io/s-validator/` - default version `1.13.3`
- `https://adam-sizzler.github.io/s-validator/v/1.13.3/` - fixed version path

The pinned version is configured in [`versions.json`](./versions.json):

```json
{
  "pinnedVersions": ["1.13.3"],
  "includeLatest": false
}
```

## Build behavior

- A single `main.wasm` and `wasm_exec.js` pair is built for `1.13.3`.
- The frontend is built for `/` and `/v/1.13.3/` using the same core version.
- The output is written to `site/` and deployed to GitHub Pages.

Build script: [`scripts/build-pages.sh`](./scripts/build-pages.sh).

## Local build

```bash
npm ci
./scripts/build-pages.sh
```
