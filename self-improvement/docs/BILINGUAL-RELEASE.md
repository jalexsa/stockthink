# Bilingual release preparation — 2026-10-27

This is a local preparation report. No push, publication, PR, release tag or new
commit was created by this finalization pass. Original project: Malik Abuallatta's
[StockThink](https://github.com/malikahed/stockthink).

## Protection and Git diagnosis

- At the start, the existing localization was already committed at `c3a558a` on
  `feature/spanish-localization`; the worktree was clean, with no untracked files.
  That branch was retained, rather than resetting or recreating it.
- Before repairs/edits, all 249 tracked/nonignored source files were copied to a
  durable external directory, zipped, and checked against a SHA-256 manifest.
  Git status/history and staged/unstaged patches were recorded there too.
- Backup on this machine:
  `C:/Users/Alex_/.codex/visualizations/2026/10/27/01a17c06-87e7-7503-883d-6f7e19b05ac7/stockthink-backup-before-finalization/`.
- `.git` is inside a OneDrive reparse-point directory, but no stale `index.lock`
  or running OneDrive process was found. A normal sandbox write probe failed;
  the identical elevated CreateNew probe and index refresh succeeded. This was
  a sandbox access restriction, not evidence of index corruption. Only the
  probe's own temporary file was removed. No ACL rewrite, reset, clean or loss
  of user changes was needed. Git metadata writes require the appropriate
  execution permission in this environment.

## Changes by area

| Files / area | Result |
|---|---|
| `common/i18n.ts`, `common/locales/{en,es}.json` | Shared browser locale event; Spanish even if storage is disabled; landing captions, errors, accessibility text and theme labels. |
| `common/opening-name.ts`, `common/locales/openings.*.json` | Display-only translation of common opening names; original book/custom names remain source data. |
| `frontend/landing/{index.html,i18n.js,sections.js,number-to-reason.js,coach.js,ender.js,ui.js}` | Spanish/English navigation and cinematic text, translated before typing; language changes preserve presentation; final CTA opens the analysis app. |
| `frontend/landing/styles/{base,number-to-reason}.css` | Mobile navigation fits; reduced-motion demo does not freeze a dev-scrubber transition. |
| `frontend/src/main.ts`, `frontend/src/ui/*.ts`, `app.html`, `frontend/src/style.css` | Localized visible statuses and spotlight; per-language optional AI comments; language changes preserve board/review state; compact mobile navigation. |
| `backend/src/compose/{compose,templates}.ts` | Natural Spanish articles, gender agreement, conjunctions and missed-idea wording from the same typed facts. English renderer retained. |
| `backend/src/llm/{providers,verify}.ts` | Localized provider status; Spanish eval-speak rejected by the existing verifier. Square/SAN whitelist and fact architecture retained. |
| Graphics/model/texture directories; `self-improvement/scripts/*free*.mjs` | Reproducible original replacement media; local Apache-2.0 Chessnut pieces; obsolete unlicensed references quarantined in the external backup. |
| `self-improvement/test/{i18n,santag,verify}.test.ts` | Resource/slot parity, disabled storage, chess-piece grammar, opening labels, SAN image tags and Spanish verification coverage. |
| `playwright.config.ts`, `self-improvement/browser/*.e2e.ts` | Desktop/mobile real-engine PGN tests, selector persistence, mixed-language checks, unchanged facts/evaluation/SAN and screenshots. |
| `LICENSES.md`, `ASSET-MANIFEST.json`, `SECURITY-REVIEW.md`, README/changelog/project map | Attribution, file hashes, dependency audit and publication limitations. |

The engine loader/WASM, analysis math, classification, detectors, opening-book
data and original license were compared byte-for-byte with the protected copy:
**19 existing files checked, zero changes**. New license notices are additional
files, not changes to engine code or chess data.

## Verification evidence

The browser uses installed Playwright Chromium, not a simulated DOM. Vite runs
on `http://127.0.0.1:5173`; the initial cache-cleanup EPERM and Chromium cache
path mismatch were resolved by running these local tools with host permission.

The PGN fixture is Morphy's Opera Game (33 plies), analyzed with local Stockfish
at the existing Fast tier (75,000 nodes). Assertions cover book classifications,
development, threats, errors, captures and tactics; both languages render the
same report and must leave it byte-identical. Screenshots and a bilingual fact
report are written to ignored `test-results/`; Playwright's HTML report is under
ignored `playwright-report/`.

An earlier browser pass completed all four cases. Strengthened checks caught a
real reduced-motion CSS freeze and mobile navigation clipping; both were fixed.
Software 3D rendering must run separately from engine tests to avoid resource
contention/startup timeouts. Vite live reload is blocked only inside test pages
so generated test artifacts cannot interrupt a review; application behavior is
not modified for testing.

Final automated suite: `npm test` — **267 passed, 1 fixture-missing guard
skipped (fixtures are present); 20 test files passed**. Real-engine gate retained 100% factual coverage
for both historic fixture games.

- `npm run test:browser`: **4 passed (3.3 minutes)** — landing and Opera Game
  review on desktop/mobile, including language persistence and open spotlight.
  Screenshots were inspected: demo visible, navigation fits, review text localized.
- `npm run build`: **passed**, TypeScript clean; the existing >500 kB chunk-size
  advisory remains for the app / Three.js bundles.
- Native Chromium avoids the severe CPU contention seen when SwiftShader was
  forced on this Windows host. Software GL is opt-in with
  `STOCKTHINK_SOFTWARE_GL=1`. The recorder closes Chromium before encoding now.
- Original MP4/WebM/poster replaced with the GPL scene and new models: 362
  captured frames, 960×540, interpolated to 24 fps. FFprobe confirmed H.264/VP9,
  approximately 45.04 seconds, no audio. `SOURCE.json` records scene/capture settings.
- `ASSET-MANIFEST.json`: 75 media/engine entries with SHA-256 and source/license.
- Mobile overflow checks use the actual document client width: decorative fixed
  layers had widened `innerWidth` (481 vs 393 visible pixels), hiding a clipped
  control from a naive viewport assertion. Root clipping and explicit control
  bounds fix this in the final browser pass.
- Production preview under `/stockthink/`: **desktop and mobile passed** using
  `node self-improvement/scripts/verify-production.mjs` after the final build.
  Root redirect, bilingual landing/app navigation, a six-ply real-engine PGN,
  both language directions and asset HEAD requests passed, with zero page errors
  or local HTTP failures. Screenshots include English landing and Spanish review.
  Evidence is also saved outside the repository under the backup's parent
  `production-proof/` directory. No dev overlay/editor is present in production.

Full path-by-path change inventory: `BILINGUAL-CHANGED-FILES.md`. The original
backup remains untouched; final browser reports and source snapshot are saved
outside OneDrive under the same external evidence root.

## Security and publication limits

`npm audit` decreased from 10 affected development packages (2 critical, 5 high,
3 moderate) to 6 (2 critical, 2 high, 2 moderate). Four compatible patches were
applied; production-only audit has zero findings. The remaining major migrations
are not forced into this change. Full ten-package classification and raw audit
snapshots: `SECURITY-REVIEW.md` and `self-improvement/docs/security/`.

Before publication, resolve GSAP's custom license versus the intended GPL
distribution and package the corresponding Stockfish source/network through the
chosen GPL distribution method. The existing engine has now been identified:
official v18.0.0 WASM matches byte for byte; the loader matches after CRLF
normalization. Exact references are bundled in `frontend/public/engine/SOURCE.md`.
No new engine binary was substituted.
Optional online imports/API/model generation were not exercised with an account,
API key or downloaded model. The test covers built-in verified explanations;
developer-only editor/studio technical labels and unknown opening source names
are not claimed to be translated. Browser device emulation is not physical
phone testing. No claim of a blanket redistribution clearance is made.
