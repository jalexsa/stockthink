import { test, expect } from '@playwright/test';
import { writeFile } from 'node:fs/promises';

test.beforeEach(async ({ page }) => {
  // Keep Vite's development reloads (including generated test artifacts) out
  // of a browser run. The same page must survive each language transition.
  // Keep the real Vite module (including CSS helpers); suppress only its HMR
  // socket. Replacing /@vite/client would also break imported application CSS.
  await page.routeWebSocket(url => url.hostname === '127.0.0.1' && url.port === '5173', socket => socket.close());
});

const OPERA = `[Event "Paris Opera"]
[White "Paul Morphy"]
[Black "Duke Karl / Count Isouard"]

1. e4 e5 2. Nf3 d6 3. d4 Bg4 4. dxe5 Bxf3 5. Qxf3 dxe5 6. Bc4 Nf6 7. Qb3 Qe7
8. Nc3 c6 9. Bg5 b5 10. Nxb5 cxb5 11. Bxb5+ Nbd7 12. O-O-O Rd8 13. Rxd7 Rxd7
14. Rd1 Qe6 15. Bxd7+ Nxd7 16. Qb8+ Nxb8 17. Rd8# 1-0`;

test('landing switches language without reloading and carries preference into the app', async ({ page }, info) => {
  const errors: string[]=[]; page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/frontend/landing/',{waitUntil:'networkidle'});
  await expect(page.locator('html')).toHaveAttribute('lang','es');
  await expect(page.locator('#tagline')).toContainText('El porqué de cada jugada');
  await expect(page.locator('#landing-language')).toBeInViewport({ratio:1});
  await expect(page.locator('#navThemeToggle')).toBeInViewport({ratio:1});
  const token=await page.evaluate(()=>{ (window as any).__languageProbe=Math.random(); return (window as any).__languageProbe; });
  await page.locator('#landing-language').selectOption('en');
  await expect(page.locator('#tagline')).toContainText('The why behind every move');
  expect(await page.evaluate(()=>(window as any).__languageProbe)).toBe(token);
  await page.locator('#landing-language').selectOption('es');
  // Exercise all animated demos, including their reduced-motion final states.
  for(const step of ['1','2','3','7','8','10']) {
    await page.locator(`section[data-step="${step}"]`).scrollIntoViewIfNeeded();
    await page.waitForTimeout(350);
  }
  await page.locator('#n2rStage').scrollIntoViewIfNeeded();
  await expect(page.locator('#n2rStage')).toHaveCSS('opacity','1');
  const controlsFit=await page.evaluate(()=>{
    const width=document.documentElement.clientWidth;
    return ['#landing-language','#navThemeToggle'].every(selector=>{
      const r=document.querySelector(selector)!.getBoundingClientRect();
      return r.left>=0&&r.right<=width+1;
    });
  });
  expect(controlsFit).toBe(true);
  await expect(page.locator('.n2r-abody')).toContainText('Tu alfil está clavado');
  const mixed=await page.locator('.s1title,.s1sub,.n2r-cap,.n2r-abody,#s4Text,#engExpText,.coach-cap').allTextContents();
  expect(mixed.join(' ')).not.toMatch(/\b(?:the|and|would|keeps|wins|Knight to|How we process)\b/);
  await page.screenshot({path:info.outputPath('landing-spanish.png')});
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth+1);
  expect(overflow).toBe(false);
  await page.locator('#landing-language').selectOption('en');
  await page.goto('/app.html');
  await expect(page.locator('#language-select')).toHaveValue('en');
  await expect(page.locator('.home-title')).toHaveText('Every move, explained.');
  await page.locator('#language-select').selectOption('es');
  await page.reload();
  await expect(page.locator('#language-select')).toHaveValue('es');
  expect(errors).toEqual([]);
});

test('real Stockfish PGN review preserves facts, evaluations and notation across languages', async ({ page }, info) => {
  const errors: string[]=[]; page.on('pageerror',e=>errors.push(e.message));
  // Public historic PGN; disable optional explorer so this is reproducible offline.
  await page.route('https://explorer.lichess.ovh/**',route=>route.abort());
  await page.goto('/app.html');
  await page.evaluate(async()=>{
    const modulePath='/backend/src/chesscom/queue.ts';
    const {analysisQueue}=await import(modulePath);
    const run=analysisQueue.runNow.bind(analysisQueue);
    analysisQueue.runNow=async(...args: any[])=>{const report=await run(...args);(window as any).__verifiedReport=report;return report;};
  });
  await page.locator('#home-pgn').click();
  await page.locator('#tier').selectOption('fast');
  await page.locator('#pgn-input').fill(OPERA);
  await page.locator('#analyze-btn').click();
  await expect(page.locator('#screen-review')).toBeVisible({timeout:90_000});
  await page.waitForFunction(() => (window as any).__verifiedReport?.moves?.length > 0);
  const proof=await page.evaluate(async()=>{
    const report=(window as any).__verifiedReport;
    const localePath='/common/i18n.ts', composePath='/backend/src/compose/compose.ts';
    const {setLocale}=await import(localePath), {composeComment}=await import(composePath);
    const before=JSON.stringify(report);
    setLocale('en');const en=report.moves.map((m:any)=>composeComment(m));
    setLocale('es');const es=report.moves.map((m:any)=>composeComment(m));
    return {unchanged:JSON.stringify(report)===before,moves:report.moves.map((m:any,i:number)=>({ply:m.ply,san:m.san,classification:m.classification,eval:m.evalAfter,facts:m.facts,en:en[i],es:es[i]}))};
  });
  expect(proof.unchanged).toBe(true);
  const facts=proof.moves.flatMap((m:any)=>m.facts);
  expect(proof.moves.some((m:any)=>m.classification==='book')).toBe(true);
  expect(facts.some((f:any)=>f.kind==='positional'&&f.fact.kind==='develops')).toBe(true);
  expect(facts.some((f:any)=>['mate_threat','wins_tempo','prepares'].includes(f.kind))).toBe(true);
  expect(facts.some((f:any)=>['wins_free_piece','captures_higher','trade'].includes(f.kind))).toBe(true);
  expect(facts.some((f:any)=>['creates_fork','creates_pin','sacrifice'].includes(f.kind))).toBe(true);
  expect(proof.moves.some((m:any)=>['blunder','mistake','inaccuracy','miss'].includes(m.classification))).toBe(true);
  for(const move of proof.moves.filter((m:any)=>m.classification!=='book')) {
    expect(move.es.text+' '+(move.es.more??'')).not.toMatch(/\b(?:the|and|would have|hanging|winning|la\/el)\b/);
  }
  const proofPath=info.outputPath('verified-bilingual-report.json');
  await writeFile(proofPath,JSON.stringify(proof,null,2));
  await info.attach('verified-bilingual-report',{path:proofPath,contentType:'application/json'});
  const chosen=proof.moves.find((m:any)=>m.classification!=='book'&&m.es.chips.length>0)!;
  await page.locator(`.mv[data-ply="${chosen.ply}"]`).click();
  await expect(page.locator('.verdict-label')).toContainText(' es ');
  const state=()=>page.evaluate(()=>({eval:document.querySelector('.eval-label')?.textContent,bar:(document.querySelector('.white-fill') as HTMLElement)?.style.height,ply:(document.querySelector('.mv.current') as HTMLElement)?.dataset.ply}));
  const spanishState=await state();
  await page.locator('#language-select').selectOption('en');
  expect(await state()).toEqual(spanishState);
  await expect(page.locator('.verdict-label')).toContainText(' is ');
  await page.locator('#language-select').selectOption('es');
  expect(await state()).toEqual(spanishState);
  await page.screenshot({path:info.outputPath('review-spanish.png'),fullPage:true});
  await page.locator('.var-chip').first().click();
  await expect(page.locator('.spotlight-card')).toBeVisible();
  await page.locator('#language-select').selectOption('en');
  await expect(page.locator('.spotlight-card')).toBeVisible();
  await expect(page.locator('.spot-title')).toContainText(/The best move|Why/);
  await page.locator('#language-select').selectOption('es');
  await expect(page.locator('.spot-title')).toContainText(/La mejor jugada|Por qué/);
  await page.screenshot({path:info.outputPath('walkthrough-spanish.png'),fullPage:true});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth+1)).toBe(false);
  expect(errors).toEqual([]);
});
