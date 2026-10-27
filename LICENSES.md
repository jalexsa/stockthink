# Licenses, attribution and asset provenance (2026-10-27)

StockThink was created by **Malik Abuallatta**:
[malikahed/stockthink](https://github.com/malikahed/stockthink).
The original `LICENSE` and copyright notices are preserved. The bilingual
interface, Spanish explanations, accessibility fixes and original replacement
artwork are modifications under **GPL-3.0-or-later**, consistent with the
original package metadata. This inventory is not a grant of third-party rights.

| Files | Source / license | Redistribution record |
|---|---|---|
| `frontend/public/pieces/chessnut/*.svg` | Chessnut by Alexis Luengas, Apache-2.0 | Unmodified artwork from [pinned upstream](https://github.com/LexLuengas/chessnut-pieces/tree/2b8eaf14a31edad7e9deb53b1473e1d4857868a9); filenames lowercased. `LICENSE.txt` and `COPYRIGHT.txt` are bundled beside the SVGs. |
| `frontend/public/badges/*.svg`, `frontend/landing/icons/*.svg`, `icons/dock/*.svg`, `engine-mark.svg` | Original procedural artwork, GPL-3.0-or-later | Rebuild with `npm run assets:build`; source: `self-improvement/scripts/build-free-assets.mjs`. |
| `frontend/public/landing/models/*.glb`, `frontend/landing/models/*.glb` | Original procedural geometry, GPL-3.0-or-later | Same generator; lathed/extruded chess pieces, board, gear, book, generic assistant emblem. GLB metadata records source/license. |
| `frontend/public/landing/textures/*.png` | Original deterministic textures, GPL-3.0-or-later | Same generator; no sampled photographs or external texture packs. |
| `frontend/public/landing/video/ender.*`, `ender-poster.jpg` | Render of the GPL scene with replacement models | Rebuild with `self-improvement/scripts/render-free-finale.mjs`; adjacent `SOURCE.json` records settings. No audio. |
| `backend/src/analysis/openings.json` | Lichess chess-openings, CC0-1.0 | [Upstream](https://github.com/lichess-org/chess-openings); dedication included as `OPENINGS-COPYING.txt`. Source book and PGNs remain unchanged. |
| `frontend/public/engine/stockfish-18-lite-single.{js,wasm}` | Stockfish.js v18.0.0 Lite, GPLv3 | WASM matches the official release SHA-256; loader differs only in copyright-comment line endings. GPL text and exact source/build links are bundled as `COPYING.txt` / `SOURCE.md`. |

`ASSET-MANIFEST.json` records media hashes and provenance. Previous assets whose
permission was undocumented were saved in the external pre-change backup and
replaced: copied review badges, Neo CDN pieces, uncredited models/textures,
Stockfish logo bitmap, copied dock logos and learning icon. Obsolete
`frontend/landing/user provides/neural-net.*` design references were quarantined
outside the repository. Product names remain descriptive text; no endorsement
by the original author, Chess.com or Stockfish is implied.

Three.js is MIT; chessops/chessground retain their GPL notices; WebLLM uses
Apache-2.0. Preserve the applicable package notices with a distribution.
Google Fonts are remote requests, not bundled font binaries
([Inter](https://raw.githubusercontent.com/google/fonts/main/ofl/inter/OFL.txt)
and [Bricolage Grotesque](https://raw.githubusercontent.com/google/fonts/main/ofl/bricolagegrotesque/OFL.txt)
are OFL-1.1). Optional WebLLM model weights are downloaded only when
selected and are not included here; their particular upstream terms still apply.

## Publication questions that remain

1. **GSAP 3.15.0 uses a custom license.** Its
   [Standard License](https://gsap.com/community/standard-license/) permits
   website use but restricts competing visual animation tools. The package
   metadata points to these terms. This does not establish GPL compatibility
   for the combined distributed bundle. Obtain clarification/compatible
   permission or replace GSAP before asserting that the entire bundle is freely
   redistributable under GPL alone. The animation framework remains intact;
   no scenes or functionality were removed to conceal this issue.
2. **Stockfish release packaging:** exact provenance has now been established:
   the WASM matches the official v18.0.0 release, and the loader matches after
   CRLF normalization. `frontend/public/engine/SOURCE.md` records source revision
   `31a9875`, build script, expected toolchain and NNUE source. When publishing
   binaries, provide this corresponding source/network through the chosen GPL
   distribution method (for example, archive them alongside the release).

The replacement artwork resolves the undocumented image/model permissions.
This audit does **not** certify unrestricted redistribution of the whole bundle
until the GSAP question and release source-packaging obligations are addressed.
