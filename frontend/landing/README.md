# Landing page (`frontend/landing/`)

The marketing/landing page — a **self-contained Vite multi-page entry**, separate
from the analysis app (`app.html` → `frontend/src/`). Three.js + GSAP are
code-split here so the app bundle never pays for the 3D.

Was one 5.4 MB HTML file; de-bloated + split 2026-06-16.

## Files — open only the one you're changing
| File | Role | ~tokens |
|---|---|---|
| `index.html` | markup only (badge icons are now external files, see `icons/`) | ~6k |
| `main.js` | entry: loads GSAP → `window.gsap`, then boots modules **in order** (resilient: a 3D failure no longer kills the page) | tiny |
| `pieces.js` | 3D asset **manifest** (URLs) → `window.PIECES` | tiny |
| `scene.js` | three.js hero scene (loads GLB by URL via GLTFLoader + meshopt) | ~4.5k |
| `scroll-engine.js` | **scroll-scrubbed motion framework**: hero outro (`window.heroProgress`) + the "talks." → "talks?" hook morph. Per-step scrub demos extend this. | <1k |
| `sections.js` | per-step demo controller: 7 demos + `fire()/reset()` dispatch + reveal/demo IntersectionObservers | ~7.8k |
| `ui.js` | nav dark/light toggle + the "why" word colour-sync | tiny |
| `styles.css` | **import manifest only** — orders the partials below | tiny |
| `styles/base.css` | root vars, theme, THINK wordmark, floating card, stacked sections | |
| `styles/steps-layout.css` | step shell, editorial left/right columns, **in-view/exit reveal transitions** (the step framework) | |
| `styles/steps-demos.css` | per-step demo styling (paste / chess.com / review / best-move) | |
| `styles/how-it-works.css` | the hook morph + How-It-Works section | |
| `icons/*.svg` | original GPL badge/learning artwork; reproducible from the asset generator | |
| `i18n.js` | shared locale, static markup and complete cinematic caption translation | |

## Assets (served, not bundled)
`frontend/public/landing/models/*.glb` (6 pieces) + `textures/*_{base,nrm,mr}.png`
(18 piece PBR maps plus 2 board maps). Referenced with `import.meta.env.BASE_URL`
under `/` (dev) and `/stockthink/` (prod). The current editable geometry/texture
source is `self-improvement/scripts/build-free-assets.mjs` (`npm run assets:build`).
The optional finale video is rendered by `render-free-finale.mjs`; its local
Vite recording studio is developer tooling. See root `LICENSES.md` for attribution
and remaining publication questions.

## Dev / build
- Dev URL: `http://localhost:5173/frontend/landing/index.html`
- Entry wired in `vite.config.ts` → `build.rollupOptions.input.landing`.
- Needs WebGL for the 3D hero. Without it (headless/software-GL, locked-down GPUs)
  the page **degrades gracefully** — `main.js` catches the failure, adds `body.no-hero`,
  and the steps/nav/demos still work. The 3D hero stays blank there.
- Root `index.html` redirects here; the landing links to `app.html` for analysis.

## "To change X, edit here"
| Want to… | Edit |
|---|---|
| Step copy / markup | `index.html` (the `.s1sec[data-step=N]` block) |
| Step layout / reveal motion | `styles/steps-layout.css` |
| A specific step's demo look | `styles/steps-demos.css` |
| A step's demo behaviour/timing | `sections.js` (the `playX/resetX` for that step) |
| Hero/hook scroll-scrub motion | `scroll-engine.js` |
| Badge icons | `icons/*.svg` |

## NEXT (planned, do with the user watching — it's visual + behaviour-heavy)
**A) Scroll-scrubbed steps** (chosen direction, 2026-06-16): make steps 01–04 pin
(`position:sticky` tall section, like `.hookStage`) and play their demo AS you scroll
— driven from `scroll-engine.js` (compute per-step progress like `updateHook` does),
each step a different motion/shape. Start with Step 01 (drive PGN typing + bar fill
from scroll), verify live, then 02–04.

**B) Split `sections.js` per step** (deferred — needs live demo verification):
it's one IIFE sharing `T1..T7`/`$`/`sqXY` + builders. Clean target:
`demo-utils.js` (timer-registry factory, `$`, `sqXY`, `RM`, `PGN`) → one module per
step exporting `{ step, fire, reset }` → `sections.js` becomes the orchestrator
(observers + dispatch table). Verify each by scrolling to its section and checking the
demo's end-state class appears.
