# Dependency security review — 2026-10-27

Commands: npm audit --json; npm audit --omit=dev --json. Official npm registry.
The ten original entries are affected **packages**, not ten independent advisories.
All are development dependencies according to the resolved lockfile.

Safe remediation: npm update nanoid postcss source-map-js fflate --ignore-scripts.
No major upgrade or npm audit fix --force was used.

| Package | Severity before | Before → current | Production dependency | Status |
|---|---|---|---|---|
| [esbuild](https://github.com/advisories/GHSA-67mh-4wv8-2f99) | moderate | 0.21.5 → 0.21.5 | No | Remaining; major upgrade proposed by audit |
| [fflate](https://github.com/advisories/GHSA-px8p-9vwx-vf98) | moderate | 0.6.10 → 0.6.11 | No | Resolved by compatible patch |
| [happy-dom](https://github.com/advisories/GHSA-834v-8h66-3h79) | high | 20.10.2 → 20.10.2 | No | Remaining; major upgrade proposed by audit |
| [nanoid](https://github.com/advisories/GHSA-28wg-ghj8-5hjv) | high | 3.3.12 → 3.3.20 | No | Resolved by compatible patch |
| [postcss](https://github.com/advisories/GHSA-fxqj-rqcc-2cmp) | high | 8.5.15 → 8.5.32 | No | Resolved by compatible patch |
| [source-map-js](https://github.com/advisories/GHSA-68fv-2mgg-jv7q) | high | 1.2.1 → 1.2.2 | No | Resolved by compatible patch |
| [tinypool](https://github.com/advisories/GHSA-5gmw-xhrv-c9v3) | critical | 0.8.4 → 0.8.4 | No | Remaining; major upgrade proposed by audit |
| [vite](https://github.com/advisories/GHSA-4w7w-66w2-5vf9) | high | 5.4.21 → 5.4.21 | No | Remaining; major upgrade proposed by audit |
| vite-node | moderate | 1.6.1 → 1.6.1 | No | Remaining; major upgrade proposed by audit |
| [vitest](https://github.com/advisories/GHSA-5xrq-8626-4rwp) | critical | 1.6.1 → 1.6.1 | No | Remaining; major upgrade proposed by audit |

Before: **10 packages (2 critical, 5 high, 3 moderate)**.
After: **6 packages (2 critical, 2 high, 2 moderate)**.
Production-only audit: **0 findings**.

## Exposure and follow-up

Remaining advisory conditions: tinypool reports prototype-pollution gadgets that
can reach host code execution through worker/run options; happy-dom reports host
code execution through an unsanitized import alias. Vitest's critical advisory
concerns its listening UI server (the documented `npm test` command uses `run`).
Vite includes path/access-control and Windows editor-launch findings; esbuild
reports cross-origin access to a development server. vite-node inherits its Vite
dependency's affected range. These are host/tooling risks even though they are
absent from the production dependency tree.

These are real development-tool findings, not a claim that development tools are harmless.
Vite/esbuild findings concern development-server access; keep local test servers
bound to 127.0.0.1 and do not expose them to untrusted networks. Vitest/vite-node/
tinypool are test/evaluation tooling; happy-dom is the test DOM. They are not
shipped as runtime dependencies in the static browser application. The static
build does not ship a Vite development server. A zero production audit is not a
security certification of application code or optional downloaded models.

The remaining audit proposals are Vite 8.3.5, Vitest 5.0.5 (also resolves the
tinypool/vite-node paths), and happy-dom 21.0.4: all major changes from this tree.
Plan those as a separate migration with full engine, browser and build regression
coverage; they were intentionally not forced into this localization release.

## Audit evidence

Machine-readable snapshots are checked in under self-improvement/docs/security/.
They record the registry response at audit time; advisory data may change later.

