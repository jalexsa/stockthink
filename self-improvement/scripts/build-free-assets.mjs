// SPDX-License-Identifier: GPL-3.0-or-later
// Original StockThink artwork and procedural models, 2026.
// Reproduce with: node self-improvement/scripts/build-free-assets.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { deflateSync } from 'node:zlib';
import * as THREE from 'three';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';

const root = fileURLToPath(new URL('../../', import.meta.url));
const write = (relative, content) => { const p=path.join(root,relative); fs.mkdirSync(path.dirname(p),{recursive:true}); fs.writeFileSync(p,content); };
const svg = body => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><!-- Original StockThink artwork. SPDX-License-Identifier: GPL-3.0-or-later -->${body}</svg>\n`;
const badges = {
  brilliant:['#168c85','!!'], great:['#426eaa','!'], best:['#5e8738','★'], excellent:['#628a48','✓'], good:['#627d55','+'],
  book:['#8a6a43','▤'], forced:['#657a74','→'], inaccuracy:['#c89323','?!'], mistake:['#c56c20','?'], miss:['#b45153','↗'], blunder:['#ad3e49','??'], checkmate:['#4a4b57','#'],
};
for(const [name,[color,glyph]] of Object.entries(badges)) {
  const image=svg(`<rect x="3" y="3" width="58" height="58" rx="18" fill="${color}"/><rect x="7" y="7" width="50" height="50" rx="14" fill="none" stroke="#fff" stroke-opacity=".25" stroke-width="2"/><text x="32" y="44" text-anchor="middle" font-family="DejaVu Sans,Arial,sans-serif" font-weight="700" font-size="${glyph.length>1?29:37}" fill="#fff">${glyph}</text>`);
  write(`frontend/public/badges/${name}.svg`,image);
  if(!['forced','checkmate'].includes(name))write(`frontend/landing/icons/${name}.svg`,image);
}
write('frontend/landing/icons/learning.svg',svg('<rect x="3" y="3" width="58" height="58" rx="16" fill="#608747"/><path d="M12 16q12-4 20 3 8-7 20-3v31q-12-4-20 3-8-7-20-3z" fill="#fff"/><path d="M32 20v27M17 24l10 2M17 31l10 2M37 26l10-2M37 33l10-2" fill="none" stroke="#608747" stroke-width="2"/>'));
write('frontend/landing/engine-mark.svg',svg('<rect x="3" y="3" width="58" height="58" rx="18" fill="#263d36"/><g stroke="#95d3a0" stroke-width="3" fill="none"><path d="M17 12v13h30V12M17 18h30M25 12v10M39 12v10M22 26l-3 23h26l-3-23M14 51h36"/><path d="M8 24h7M8 34h7M49 24h7M49 34h7"/></g>'));
const dock={
  folder:'<path d="M7 18h20l6 7h24v28H7z" fill="#caaa60"/><path d="M7 18v-6h20l6 7H7" fill="#e0c989"/>',
  editor:'<rect x="6" y="7" width="52" height="50" rx="12" fill="#37567c"/><path d="m24 24-10 8 10 8m16-16 10 8-10 8m-3-23-10 30" fill="none" stroke="#c9e7ff" stroke-width="4"/>',
  browser:'<circle cx="32" cy="32" r="26" fill="#315e62"/><g fill="none" stroke="#b9e6df" stroke-width="3"><circle cx="32" cy="32" r="22"/><ellipse cx="32" cy="32" rx="11" ry="22"/><path d="M10 32h44M14 20h36M14 44h36"/></g>',
  terminal:'<rect x="5" y="9" width="54" height="46" rx="10" fill="#252a32"/><path d="m16 22 11 10-11 10m17 0h15" fill="none" stroke="#b4dbb1" stroke-width="4"/>',
};
for(const [name,body]of Object.entries(dock))write(`frontend/landing/icons/dock/${name}.svg`,svg(body));

// Minimal deterministic PNG encoder; no image source or proprietary texture.
const crc32=buf=>{let crc=0xffffffff;for(const b of buf){crc^=b;for(let j=0;j<8;j++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);}return(crc^0xffffffff)>>>0;};
const chunk=(type,data)=>{const kind=Buffer.from(type),out=Buffer.alloc(data.length+12);out.writeUInt32BE(data.length);kind.copy(out,4);data.copy(out,8);out.writeUInt32BE(crc32(Buffer.concat([kind,data])),out.length-4);return out;};
function png(size,pixel){const hdr=Buffer.alloc(13);hdr.writeUInt32BE(size);hdr.writeUInt32BE(size,4);hdr[8]=8;hdr[9]=6;const raw=Buffer.alloc((size*4+1)*size);for(let y=0;y<size;y++){for(let x=0;x<size;x++){const c=pixel(x,y,size);for(let k=0;k<4;k++)raw[y*(size*4+1)+1+x*4+k]=c[k]??255;}}return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',hdr),chunk('IDAT',deflateSync(raw)),chunk('IEND',Buffer.alloc(0))]);}
for(const name of ['king','queen','bishop','knight','rook','pawn']){
  write(`frontend/public/landing/textures/${name}_base.png`,png(256,(x,y)=>{const grain=7*Math.sin(x*.21+Math.sin(y*.028)*2)+3*Math.sin(x*.91+y*.04);return[200+grain,157+grain,104+grain];}));
  write(`frontend/public/landing/textures/${name}_nrm.png`,png(64,()=>[128,128,255]));
  write(`frontend/public/landing/textures/${name}_mr.png`,png(64,()=>[0,180,8]));
}
write('frontend/public/landing/textures/board_base.png',png(512,(x,y,n)=>{if(x<32||y<32||x>=n-32||y>=n-32)return[77,47,29];const dark=(Math.floor((x-32)/56)+Math.floor((y-32)/56))%2;const v=3*Math.sin(x*.24+Math.sin(y*.031));return dark?[88+v,109+v,83+v]:[221+v,207+v,172+v];}));
write('frontend/public/landing/textures/board_mr.png',png(64,()=>[0,190,0]));

// GLTFExporter uses FileReader even for geometry-only binary output.
globalThis.FileReader=class{readAsArrayBuffer(blob){blob.arrayBuffer().then(value=>{this.result=value;this.onloadend?.();});} readAsDataURL(blob){blob.arrayBuffer().then(value=>{this.result='data:application/octet-stream;base64,'+Buffer.from(value).toString('base64');this.onloadend?.();});}};
const wood=new THREE.MeshStandardMaterial({color:0xcba36a,roughness:.6});
const metal=new THREE.MeshStandardMaterial({color:0x7e8e8a,metalness:.65,roughness:.3});
const mesh=(geometry,material=wood)=>new THREE.Mesh(geometry,material);
const lathe=points=>mesh(new THREE.LatheGeometry(points.map(([r,y])=>new THREE.Vector2(r,y)),64));
function sphere(group,r,x,y,z,s=[1,1,1]){const m=mesh(new THREE.SphereGeometry(r,32,20));m.position.set(x,y,z);m.scale.set(...s);group.add(m);}
function box(group,w,h,d,x,y,z,material=wood){const m=mesh(new THREE.BoxGeometry(w,h,d),material);m.position.set(x,y,z);group.add(m);return m;}
const base=[[0,0],[.57,0],[.6,.08],[.6,.17],[.53,.24],[.48,.28],[.5,.36],[.44,.42],[.3,.47]];
function piece(type){const g=new THREE.Group();let height={pawn:1.7,rook:1.95,knight:2.3,bishop:2.45,queen:2.8,king:3.1}[type];const stem=height*(type==='knight'?.49:.66);g.add(lathe([...base,[.24,.63],[.22,stem-.23],[.34,stem-.12],[.35,stem],[0,stem]]));
 if(type==='pawn')sphere(g,.36,0,stem+.27,0);
 if(type==='rook'){g.add(lathe([[0,stem],[.42,stem],[.45,stem+.15],[.44,height-.2],[0,height-.2]]));for(let i=0;i<6;i++){const a=i*Math.PI/3;const m=box(g,.25,.28,.24,Math.cos(a)*.31,height-.12,Math.sin(a)*.31);m.rotation.y=-a;}}
 if(type==='knight'){const shape=new THREE.Shape();shape.moveTo(-.37,0);shape.lineTo(-.48,.43);shape.lineTo(-.25,.92);shape.lineTo(.09,1.25);shape.lineTo(.31,1.38);shape.lineTo(.3,1.08);shape.lineTo(.63,.68);shape.lineTo(.57,.5);shape.lineTo(.18,.59);shape.lineTo(.02,.43);shape.lineTo(.22,0);shape.closePath();const m=mesh(new THREE.ExtrudeGeometry(shape,{depth:.35,bevelEnabled:true,bevelSegments:3,steps:1,bevelSize:.06,bevelThickness:.06}));m.position.set(-.06,stem-.12,-.175);g.add(m);}
 if(type==='bishop'){sphere(g,.36,0,stem+.33,0,[.8,1.45,.8]);sphere(g,.1,0,height-.03,0);}
 if(type==='queen'){g.add(lathe([[0,stem],[.3,stem],[.43,height-.35],[.42,height-.24],[0,height-.24]]));for(let i=0;i<8;i++){const a=i*Math.PI/4;sphere(g,.09,Math.cos(a)*.4,height-.2,Math.sin(a)*.4);}sphere(g,.13,0,height-.04,0);}
 if(type==='king'){g.add(lathe([[0,stem],[.3,stem],[.4,stem+.13],[.26,stem+.27],[.15,height-.42],[0,height-.42]]));box(g,.16,.55,.16,0,height-.18,0);box(g,.46,.15,.16,0,height-.13,0);}
 return g;}
function board(){const g=new THREE.Group();const border=box(g,9,.2,9,0,.1,0);const rim=[box(g,.5,.35,9,-4.25,.275,0),box(g,.5,.35,9,4.25,.275,0),box(g,8,.35,.5,0,.275,-4.25),box(g,8,.35,.5,0,.275,4.25)];for(const m of [border,...rim]){const uv=m.geometry.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,.025,.025);}
 const plane=mesh(new THREE.PlaneGeometry(8,8));plane.rotation.x=-Math.PI/2;plane.position.y=.35;const uv=plane.geometry.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,.0625+uv.getX(i)*.875,.0625+uv.getY(i)*.875);g.add(plane);return g;}
function gear(){const shape=new THREE.Shape(),teeth=24;for(let i=0;i<teeth*4;i++){const a=i/(teeth*4)*Math.PI*2,r=i%4<2?1.2:1.05;const x=Math.cos(a)*r,y=Math.sin(a)*r;if(i===0)shape.moveTo(x,y);else shape.lineTo(x,y);}shape.closePath();const hole=new THREE.Path();hole.absarc(0,0,.43,0,Math.PI*2,true);shape.holes.push(hole);return mesh(new THREE.ExtrudeGeometry(shape,{depth:.24,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.035,bevelThickness:.025}),metal);}
function book(){const g=new THREE.Group();const cover=new THREE.MeshStandardMaterial({color:0x41634e,roughness:.7});box(g,1.5,.08,2.05,0,-.2,0,cover);box(g,1.5,.08,2.05,0,.2,0,cover);box(g,1.39,.32,1.93,.025,0,0,new THREE.MeshStandardMaterial({color:0xe7dfc7}));box(g,.12,.4,2.05,-.7,0,0,cover);for(let i=0;i<5;i++)box(g,1.1,.007,.025,.04,.245,-.5+i*.22,new THREE.MeshStandardMaterial({color:0xbfa567}));return g;}
function assistant(){const g=new THREE.Group();const mat=new THREE.MeshStandardMaterial({color:0xd9986f,roughness:.55});g.add(mesh(new THREE.IcosahedronGeometry(.53,3),mat));for(let i=0;i<3;i++){const ring=mesh(new THREE.TorusGeometry(.72,.065,12,64),mat);ring.rotation.set(i*Math.PI/3,Math.PI/4+i*.4,0);g.add(ring);}return g;}
async function save(relative,object){object.userData={author:'StockThink localization contributors',license:'GPL-3.0-or-later',source:'self-improvement/scripts/build-free-assets.mjs'};const scene=new THREE.Scene();scene.add(object);const data=await new GLTFExporter().parseAsync(scene,{binary:true});write(relative,Buffer.from(data));}
for(const name of ['king','queen','bishop','knight','rook','pawn'])await save(`frontend/public/landing/models/${name}.glb`,piece(name));
await save('frontend/public/landing/models/chess-board.glb',board());
await save('frontend/landing/models/gear.glb',gear());
await save('frontend/landing/models/book.glb',book());
await save('frontend/landing/models/assistant-mark.glb',assistant());
console.log('Generated original SVG artwork, procedural PBR textures and ten GLB models.');
