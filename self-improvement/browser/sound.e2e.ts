import { test, expect } from '@playwright/test';

test('piece sounds follow moves, stay silent on redraws, and remember mute', async ({ page }, info) => {
  const errors: string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await page.routeWebSocket(url=>url.hostname==='127.0.0.1'&&url.port==='5173',socket=>socket.close());
  await page.route('https://explorer.lichess.ovh/**',route=>route.abort());
  await page.addInitScript(()=>{
    const original=window.AudioContext;
    const probe={starts:0,contexts:[] as AudioContext[]};
    (window as any).__audioProbe=probe;
    // Observe real Web Audio nodes; do not replace playback with a mock.
    window.AudioContext=class extends original {
      constructor(options?: AudioContextOptions){
        super(options);probe.contexts.push(this);
        const create=this.createOscillator.bind(this);
        this.createOscillator=()=>{
          const oscillator=create(),start=oscillator.start.bind(oscillator);
          oscillator.start=(when=0)=>{probe.starts++;start(when);};
          return oscillator;
        };
      }
    };
  });
  const starts=()=>page.evaluate(()=>(window as any).__audioProbe.starts as number);
  await page.goto('/app.html');
  await expect(page.locator('#sound-toggle')).toHaveAttribute('aria-pressed','true');
  expect(await page.evaluate(()=>(window as any).__audioProbe.contexts.length)).toBe(0);
  await page.locator('#home-pgn').click();
  await page.locator('#tier').selectOption('fast');
  await page.locator('#pgn-input').fill('1. e4 d5 2. exd5 Qxd5 3. Nc3 Qa5 *');
  await page.locator('#analyze-btn').click();
  await expect(page.locator('#screen-review')).toBeVisible({timeout:90000});
  expect(await starts()).toBe(0);
  await page.locator('.mv[data-ply="1"]').click();
  await expect.poll(starts).toBe(1);
  expect(await page.evaluate(()=>(window as any).__audioProbe.contexts[0].state)).toBe('running');
  await page.locator('.mv[data-ply="3"]').click();
  await expect.poll(starts).toBe(3); // capture has a second, quieter impact
  await page.keyboard.press('ArrowRight');
  await expect.poll(starts).toBe(5);
  await page.keyboard.press('ArrowLeft');
  await expect.poll(starts).toBe(7);
  await page.locator('#btn-flip').click();
  await page.locator('#btn-flip').click();
  await page.locator('#language-select').selectOption('en');
  await expect(page.locator('#sound-toggle')).toHaveAttribute('title','Mute sound');
  await page.locator('#language-select').selectOption('es');
  await page.locator('.mv[data-ply="3"]').click();
  expect(await starts()).toBe(7);

  if(info.project.name==='desktop'){
    const box=await page.locator('cg-board').boundingBox();
    expect(box).not.toBeNull();
    // Black queen d8 → d5: a legal user capture from the reviewed position.
    await page.mouse.click(box!.x+box!.width*3.5/8,box!.y+box!.height*0.5/8);
    await page.mouse.click(box!.x+box!.width*3.5/8,box!.y+box!.height*3.5/8);
    await expect.poll(starts).toBe(9);
    await expect(page.locator('#live-back')).toBeVisible();
    await page.locator('#live-back').click();
    await expect.poll(starts).toBe(11);
  }
  if(info.project.name==='mobile')await page.setViewportSize({width:360,height:800});
  expect(await page.evaluate(()=>['#sound-toggle','#language-select','#nav-review'].every(selector=>{
    const r=document.querySelector(selector)!.getBoundingClientRect();
    return r.left>=0&&r.right<=document.documentElement.clientWidth+1;
  }))).toBe(true);
  await page.screenshot({path:info.outputPath('piece-sounds-spanish.png'),fullPage:true});
  const count=await starts();
  await page.locator('#sound-toggle').click();
  await expect(page.locator('#sound-toggle')).toHaveAttribute('aria-pressed','false');
  await page.locator('#btn-next').click();
  expect(await starts()).toBe(count);
  await page.reload();
  await expect(page.locator('#sound-toggle')).toHaveAttribute('aria-pressed','false');
  await expect(page.locator('#sound-toggle')).toHaveAttribute('title','Activar sonido');
  await page.locator('#sound-toggle').click();
  await page.reload();
  await expect(page.locator('#sound-toggle')).toHaveAttribute('aria-pressed','true');
  expect(errors).toEqual([]);
});
