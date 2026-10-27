// SPDX-License-Identifier: GPL-3.0-or-later
// Start `npm run preview -- --host 127.0.0.1 --port 4173 --strictPort` first.
import { chromium } from 'playwright';
import { mkdirSync,writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import assert from 'node:assert/strict';
const base=process.env.STOCKTHINK_PREVIEW_URL || 'http://127.0.0.1:4173/stockthink/';
const output=process.env.STOCKTHINK_EVIDENCE_DIR || join(tmpdir(),'stockthink-production-proof');
mkdirSync(output,{recursive:true});
const browser=await chromium.launch({headless:true});
const results=[];
try {
  for(const [name,viewport] of Object.entries({desktop:{width:1440,height:1000},mobile:{width:393,height:851}})){
    const context=await browser.newContext({viewport,reducedMotion:'reduce',isMobile:name==='mobile',hasTouch:name==='mobile'});
    const page=await context.newPage(),errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    page.on('response',r=>{if(r.url().startsWith(base)&&r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});
    await page.route('https://explorer.lichess.ovh/**',route=>route.abort());
    await page.goto(base);
    await page.waitForURL('**/stockthink/frontend/landing/');
    await page.locator('#landing-language').selectOption('en');
    assert.equal(await page.evaluate(()=>['#landing-language','#navThemeToggle'].every(selector=>{
      const r=document.querySelector(selector).getBoundingClientRect();
      return r.left>=0&&r.right<=document.documentElement.clientWidth+1;
    })),true);
    await page.screenshot({path:join(output,`production-landing-${name}-english.png`)});
    await page.locator('.hero-cta').click();
    await page.waitForURL('**/stockthink/app.html');
    assert.equal(await page.locator('#language-select').inputValue(),'en');
    await page.locator('#language-select').selectOption('es');
    await page.locator('#home-pgn').click();
    await page.locator('#tier').selectOption('fast');
    await page.locator('#pgn-input').fill('1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 *');
    await page.locator('#analyze-btn').click();
    await page.locator('#screen-review:not(.hidden)').waitFor({timeout:90000});
    await page.locator('.mv[data-ply="3"]').click();
    assert.match(await page.locator('.verdict-label').innerText(),/ es /);
    await page.locator('#language-select').selectOption('en');
    assert.match(await page.locator('.verdict-label').innerText(),/ is /);
    await page.locator('#language-select').selectOption('es');
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth+1),false);
    await page.screenshot({path:join(output,`production-${name}.png`),fullPage:true});
    for(const asset of ['pieces/chessnut/wn.svg','landing/models/knight.glb','landing/video/ender.mp4','landing/video/ender.webm','engine/stockfish-18-lite-single.wasm']){
      const response=await context.request.head(new URL(asset,base).href);assert.equal(response.status(),200,asset);
    }
    assert.deepEqual(errors,[]);
    results.push({name,viewport,language:'es',pgnPlies:6,errors,assetStatus:200});
    await context.close();
  }
  writeFileSync(join(output,'production-results.json'),JSON.stringify(results,null,2)+'\n');
  console.log(JSON.stringify(results,null,2));
} finally {await browser.close();}
