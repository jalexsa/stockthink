// SPDX-License-Identifier: GPL-3.0-or-later
// Regenerates optional video fallback from the GPL scene and original models.
// Start Vite, install Playwright Chromium and provide ffmpeg on PATH first.
import { chromium } from 'playwright';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const fps=Number(process.env.FPS || 12), outputFps=24, width=Number(process.env.WIDTH || 960), height=Number(process.env.HEIGHT || 540);
const frames=process.env.STOCKTHINK_CAPTURE_DIR || join(tmpdir(),'stockthink-original-finale');
mkdirSync(frames,{recursive:true});
const captureSpec=JSON.stringify({fps,width,height,seed:764512});
const specPath=join(frames,'capture.json');
if(existsSync(specPath)&&readFileSync(specPath,'utf8')!==captureSpec)throw new Error('Use a separate capture directory when changing render settings.');
writeFileSync(specPath,captureSpec);
const output=fileURLToPath(new URL('../../frontend/public/landing/video/',import.meta.url));
const browser=await chromium.launch({headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try {
  const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1});
  await page.addInitScript(()=>{let seed=764512;Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};});
  // Recording uses a deterministic clock; dev live-reload must not interrupt it.
  await page.route('**/@vite/client', route=>route.fulfill({contentType:'application/javascript',body:'export const createHotContext=()=>({accept(){},dispose(){},prune(){},on(){},send(){},invalidate(){}});'}));
  await page.goto('http://127.0.0.1:5173/frontend/landing/record/studio.html?scene=ender&ss=1');
  await page.waitForFunction(()=>window.RB?.ready || window.RB?.error,{},{timeout:120000});
  const state=await page.evaluate(()=>({ready:window.RB.ready,error:window.RB.error,duration:window.RB.duration,renderer:window.RB.glRenderer}));
  if(state.error)throw new Error(state.error);
  console.log('Rendering original scene:',state);
  const count=Math.ceil(state.duration*fps);
  for(let i=0;i<count;i++) {
    const framePath=join(frames,`f${String(i).padStart(4,'0')}.png`);
    if(existsSync(framePath))continue;
    // Read the canvas in the same task as render(), before WebGL clears its
    // drawing buffer. This avoids a second compositor pass per software frame.
    const png=await page.evaluate(p=>{
      window.RB.frame(p);
      return document.getElementById('stage').toDataURL('image/png').split(',')[1];
    },i/(count-1));
    writeFileSync(framePath,Buffer.from(png,'base64'));
    if(i%100===0)console.log(`Rendered ${i}/${count}`);
  }
  // SwiftShader may keep GPU worker threads busy while Node is synchronously
  // encoding. Release Chromium before FFmpeg, not only in the finally block.
  await browser.close();
  const ffmpeg=process.env.FFMPEG || 'ffmpeg';
  const encode=(args)=>execFileSync(ffmpeg,['-y','-hide_banner','-loglevel','error',...args],{stdio:'inherit'});
  const input=['-framerate',String(fps),'-i',join(frames,'f%04d.png')];
  encode([...input,'-vf',`minterpolate=fps=${outputFps}`,'-c:v','libx264','-crf','20','-preset','medium','-pix_fmt','yuv420p','-movflags','+faststart','-an',join(output,'ender.mp4')]);
  encode(['-i',join(output,'ender.mp4'),'-c:v','libvpx-vp9','-crf','28','-b:v','0','-row-mt','1','-pix_fmt','yuv420p','-an',join(output,'ender.webm')]);
  encode(['-i',join(frames,'f0000.png'),'-frames:v','1','-update','1','-q:v','3',join(output,'ender-poster.jpg')]);
  writeFileSync(join(output,'SOURCE.json'),JSON.stringify({license:'GPL-3.0-or-later',source:'self-improvement/scripts/render-free-finale.mjs',scene:'frontend/landing/ender-scene.js',models:'self-improvement/scripts/build-free-assets.mjs',captureFps:fps,fps:outputFps,interpolation:'FFmpeg minterpolate',seed:764512,width,height,duration:state.duration,frames:count},null,2)+'\n');
  console.log('Original MP4, WebM and poster written.');
} finally {await browser.close();}
