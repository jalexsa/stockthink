# StockThink ♟️

**Free chess game review — entirely in your browser.** Available in English
and Latin American Spanish, with Spanish selected by default. Paste a PGN, get a
chess.com-style analysis: eval bar, move classifications (Brilliant‼ → Blunder⁇),
accuracy scores, and commentary that explains **why** each move is good or bad.

No server. No account. No API keys. No cost. Powered by **Stockfish 18 (NNUE)**
running as WebAssembly on your machine.

**Original project's live site: https://malikahed.github.io/stockthink/**
This working bilingual version has not been published automatically.

## How it works (V2 analysis system)

```
PGN → 1. Stockfish 18 Lite WASM (fixed nodes per tier, MultiPV 3)
    → 2. Concept annotator — deterministic board logic produces TYPED FACTS
         (hangs piece, allows mate, fork created/allowed/missed, pins, traps,
          sacrifices, development, king safety, pawn structure, …)
    → 3. Classification — win%-drop ladder + Book/Forced/Brilliant/Great/Miss
    → 4. Explanation composer — sentences rendered ONLY from the typed facts
    → 5. UI — badges, eval bar/graph, clickable variation chips, "explain more"
```

Hard rules the commentary can never break (`self-improvement/docs/specs/ANALYSIS-SYSTEM-V2.md`):

- **R1 — no eval numbers in prose.** Win% and centipawns live in the bar, the
  graph and the chips — never in a sentence.
- **R2 — no engine-line dumps in prose.** Lines are clickable chips you can
  play through on the board; prose names at most a move or two, each with its
  stated purpose.
- **R3 — no empty-handed fallback.** When nothing concrete is known, the
  comment says less, never pads with eval-speak.
- **R4 — every claim machine-verified.** Sentences are slot-filled from facts
  produced by board logic + engine lines; nothing is invented.
- **R5 — cause before verdict.** Bad moves read as
  *cause → consequence → what was better and why*.

## Deep review (Mode B)

The "Deep review" panel exports a per-move factsheet prompt (position, piece
list, legal moves, verified facts, verdicts). Paste it into Claude, paste the
JSON reply back, and every sentence is checked against a whitelist of real
squares/pieces/moves — hallucinated analysis is rejected per-move and falls
back to the built-in explanation. The prompt design follows the CCC paper
(arXiv:2410.20811) and C1/Master Distillation (arXiv:2603.20510); notes in
`self-improvement/docs/research/LAST-RESEARCH-NOTES.md`.

## Develop

```
npm install
npm run dev                              # vite dev server
npm test                                 # unit + real-engine integration tests
npx vitest run self-improvement/test/gate.e2e.test.ts     # quality gate: full games, zero eval-speak
npm run build                            # production build (Pages deploys on push)
npx playwright install chromium           # once, for browser verification
npm run test:browser                      # desktop + mobile, real PGN / Stockfish
```

## Languages

The landing page and analysis app default to Spanish and share a visible language
selector for English. The selection is saved in local storage when available and
takes effect without a reload. UI and cinematic captions live in
`common/locales/en.json` and `common/locales/es.json`;
fact-based explanation phrasing is rendered in `backend/src/compose/templates.ts`.
Chess facts, SAN, PGN, coordinates, Stockfish evaluation, and move classification
remain language-neutral and unchanged.

The display-only opening catalog in `common/locales/openings.*.json` covers common
opening names and qualifiers. Unknown/custom source names are retained verbatim;
the original opening book and PGN headers are never rewritten. Developer tools
(the dev-only visual editor and recording studio) retain technical labels.

Playwright starts Vite on `127.0.0.1:5173` if necessary. Tests use Chromium and
Morphy's historic Opera Game, with optional online opening lookup disabled.
Both languages render the same report; facts, SAN, classifications and evaluations
are compared. See `self-improvement/docs/BILINGUAL-RELEASE.md` for release evidence.
After `npm run build`, start `npm run preview -- --host 127.0.0.1 --port 4173`
and run `node self-improvement/scripts/verify-production.mjs` for the production
base-path smoke check. `STOCKTHINK_SOFTWARE_GL=1` opts browser tests into software
rendering on hosts without usable GPU support; the default uses Chromium's native
renderer. Asset hashes can be refreshed with
`node self-improvement/scripts/asset-manifest.mjs` after rebuilding media.

## Original project and licensing

StockThink is based on the original project by **Malik Abuallatta**
([malikahed/stockthink](https://github.com/malikahed/stockthink)). This
translation retains the repository's GPL-3.0-or-later license and copyright
notices. The Spanish interface and i18n implementation are modifications to
that project; see `CHANGELOG.md`.

Previously undocumented images, models and textures have been replaced by
original GPL artwork and Apache-2.0 Chessnut pieces (Alexis Luengas). Sources,
notices, rebuild commands and remaining GSAP / Stockfish source-packaging tasks
are recorded in `LICENSES.md` and `ASSET-MANIFEST.json`. Resolve those publication
questions before treating the whole bundle as cleared for redistribution.

Stack: Vite 5 + TypeScript, chessops, chessground, Stockfish 18 Lite WASM
(single-thread, 7.3 MB, committed in `frontend/public/engine/`). Project map in
`CLAUDE.md`; docs index in `self-improvement/docs/README.md`.

License: GPL-3.0-or-later. Opening book CC0 (lichess). Chessnut pieces
© 2015 Alexis Luengas, Apache-2.0. See `SECURITY-REVIEW.md` for dependency findings.
