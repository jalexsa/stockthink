# Third-party asset and license inventory

This inventory records the licenses and provenance that are documented in the
checked-in repository. It is not a legal opinion or a grant of rights.

| Component | Repository evidence | Finding |
|---|---|---|
| StockThink source | `LICENSE`, `package.json` | GPL-3.0-or-later; the original project author is Malik Abuallatta. The license file is preserved. |
| Stockfish 18 Lite WASM | `README.md`, `frontend/public/engine/` | Identified by the project as GPL. The exact upstream build/source notices should accompany redistribution of the WASM package. |
| Opening book | `README.md`, `backend/src/analysis/openings.json` | Identified by the project as CC0 / lichess. |
| Chess.com review badges | `frontend/public/badges/`, `frontend/landing/icons/` | The repository identifies these as Chess.com artwork, but contains no asset-specific license grant. Attribution does not establish redistribution permission. |
| Chess.com Neo piece set | Referenced from `images.chesscomfiles.com` in the UI; no local license record | The artwork is served from Chess.com and no license grant is documented here. |
| Landing-page 3D models and textures | `frontend/public/landing/models/`, `frontend/public/landing/textures/` | Source, authorship, and license are not recorded in the repository. Permission needs confirmation. |
| Landing-page video and images | `frontend/public/landing/video/`, `frontend/landing/` | Some sources are described as user-provided in the repository, but there is no complete asset-level rights record. |

The Chess.com [User Agreement](https://www.chess.com/legal/user-agreement)
describes a limited, revocable license for personal, noncommercial use of its
content. The checked-in files do not establish that this permission covers
redistribution in this repository. Chess.com also publishes
[content and brand guidance](https://support.chess.com/en/articles/8709017-what-kind-of-content-can-i-stream-or-post).

Therefore the source code license and the right to redistribute every existing
binary/image asset are separate questions. Before claiming that the complete
asset bundle is freely redistributable, obtain the missing asset permissions or
replace assets whose rights cannot be verified. This i18n change does not alter
the asset files or their attribution.
