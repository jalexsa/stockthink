# Stockfish 18 Lite single-thread source and notices

The included engine is the **official Stockfish.js v18.0.0 release** by Nathan
Rugg / Chess.com, based on Stockfish and Linmiao Xu's NNUE network.

- Release: https://github.com/nmrugg/stockfish.js/releases/tag/v18.0.0
- Corresponding source: https://github.com/nmrugg/stockfish.js/tree/31a9875
- Source archive: https://github.com/nmrugg/stockfish.js/archive/refs/tags/v18.0.0.zip
- Build script: https://github.com/nmrugg/stockfish.js/blob/v18.0.0/build.js
- Network: https://tests.stockfishchess.org/nns?network_name=nn-9067e33176e
- License: GPLv3; see adjacent `COPYING.txt` and loader's original copyright header.

Verification on 2026-10-27:

`stockfish-18-lite-single.wasm` matches the official release byte for byte:

```
SHA-256 a8fbc05ec6920b56d7485826dcb02c5ffd2826bcbf751cf973046f237a9096f1
```

The loader matches the official release after CRLF → LF normalization; the
only difference is Windows line endings in the original copyright comment.
Neither the loader nor the WASM was changed by this localization work.

Upstream's build requires Emscripten **3.1.7**, Node.js and make. For the lite
single-threaded flavor, use the pinned source and `node build.js --lite
--single-threaded`; consult that revision's `build.js --help` for environment
and output options. This project has not rebuilt the engine or claimed a
reproducible compiler build.

When publishing binaries, provide the corresponding source/network and build
instructions through the chosen GPL-compliant distribution method. Archive the
pinned source alongside the release rather than replacing it with a link to an
unrelated/latest engine. No release has been published by this change.
