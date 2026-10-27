// SPDX-License-Identifier: GPL-3.0-or-later
// Refresh after rebuilding assets or rendering the optional video fallback.
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
const root=new URL('../../',import.meta.url);
const files=[];
function scan(relative){
  for(const entry of fs.readdirSync(new URL(relative+'/',root),{withFileTypes:true})){
    const name=relative+'/'+entry.name;
    if(entry.isDirectory()){scan(name);continue;}
    if(!/\.(svg|png|jpg|glb|mp4|webm|wasm|js)$/.test(name))continue;
    const data=fs.readFileSync(new URL(name,root));
    const chessnut=name.includes('/pieces/chessnut/'),engine=name.includes('/engine/'),video=name.includes('/video/');
    files.push({path:name,bytes:data.length,sha256:createHash('sha256').update(data).digest('hex'),
      license:chessnut?'Apache-2.0':engine?'GPL-3.0':'GPL-3.0-or-later',
      source:chessnut?'https://github.com/LexLuengas/chessnut-pieces/tree/2b8eaf14a31edad7e9deb53b1473e1d4857868a9':engine?'https://github.com/nmrugg/stockfish.js/tree/31a9875':video?'self-improvement/scripts/render-free-finale.mjs':'self-improvement/scripts/build-free-assets.mjs',
      ...(chessnut?{copyright:'Copyright 2015 Alexis Luengas',changes:'Filename case only; image bytes unchanged'}:{}),
      ...(engine?{note:'Official v18.0.0 WASM matches exactly; loader matches after CRLF normalization. Original files unchanged; see engine/SOURCE.md.'}:{}),
    });
  }
}
for(const dir of ['frontend/public','frontend/landing/icons','frontend/landing/models'])scan(dir);
const extra='frontend/landing/engine-mark.svg';const bytes=fs.readFileSync(new URL(extra,root));
files.push({path:extra,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex'),license:'GPL-3.0-or-later',source:'self-improvement/scripts/build-free-assets.mjs'});
fs.writeFileSync(new URL('ASSET-MANIFEST.json',root),JSON.stringify({auditDate:'2026-10-27',notes:'See LICENSES.md for attribution, notices and GSAP / release source-packaging questions.',files:files.sort((a,b)=>a.path.localeCompare(b.path))},null,2)+'\n');
console.log(`Recorded ${files.length} media/engine files with SHA-256 provenance.`);
