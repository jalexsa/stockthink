# Changelog

All notable changes to StockThink are recorded here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/);
this project uses [Semantic Versioning](https://semver.org/).

How to cut a release: `npm version patch|minor|major` then
`git push --follow-tags` — pushing the `v*` tag publishes a GitHub Release
(see `.github/workflows/release.yml`). Move the items below from *Unreleased*
into the new version section as you go.

## [Unreleased]

### Added
- Original procedural piece-move sounds, capture/castling variants and a bilingual
  speaker toggle with a locally saved mute preference. No external audio assets.
- Completed landing-page Spanish/English captions, shared persistent language
  controls, accessible labels and reduced-motion presentation. Added Chromium
  desktop/mobile PGN coverage and translation resource parity tests.
- Original reproducible GPL graphics, models and textures; Apache-2.0 Chessnut
  pieces with bundled license/copyright. Added asset provenance and release audits.
- Natural Spanish agreement for chess pieces, localized common opening names
  (display only), and language-separated optional AI commentary.
- Compatible patches for fflate, nanoid, postcss and source-map-js; six
  development-only findings remain documented without major upgrades.
- Bilingual English/Latin American Spanish interface for the analysis app, with
  Spanish as the default, a persistent in-app language selector, localized
  classifications and verified fact-based explanations. The chess-analysis
  facts, classification math, engine, SAN, PGN, and move variants are unchanged.
- Translation resources under `common/locales/` and bilingual presentation
  tests in `self-improvement/test/i18n.test.ts`.

### Changed
- Reorganized the repo into three top-level zones — `frontend/` (UI/UX),
  `backend/` (engine + analysis logic), `self-improvement/` (docs, improve,
  eval, test). Verified no behaviour change: build, 246 tests, eval 90.8%.
- Cross-zone imports now use `@frontend` / `@backend` path aliases.

### Added
- Live UI/UX workflow: project-scoped `.mcp.json` registers the Chrome DevTools
  MCP (primary — real screenshots, console, Lighthouse) and Playwright MCP
  (driving + visual-regression) so the running page can be seen during design.
- `vite-plugin-checker` dev overlay (in-page TypeScript errors) and
  `server.host` so a browser/MCP can reach the dev server.
- `release.yml`: pushing a `v*` tag publishes a GitHub Release.
- This CHANGELOG.

### Removed
- Archived the untracked WIP homepage design sandbox out of the repo.

[Unreleased]: https://github.com/malikahed/stockthink/compare/main...HEAD
