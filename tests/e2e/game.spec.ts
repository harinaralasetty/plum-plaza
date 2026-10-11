import { test, expect } from '@playwright/test';
import { Safari } from './safari';
import { LEVELS, PAIRS, CAKES, PREFS_KEY } from '../../src/config/constants';
import { mulberry32 } from '../../src/core/rng';
import * as pairs from '../../src/games/pairs/logic';
import * as shop from '../../src/games/shop/logic';
import * as cakes from '../../src/games/cakes/logic';
import { writeFile, mkdir } from 'node:fs/promises';
const safari = new Safari();
const seed = 123;
const browserHelpers = `const delay=ms=>new Promise(r=>setTimeout(r,ms));const wait=async check=>{const end=Date.now()+40000;while(!check()){if(Date.now()>end)throw Error('UI wait timed out');await delay(30);}};const button=text=>[...document.querySelectorAll('button')].find(b=>b.textContent.trim()===text);const click=async text=>{const b=button(text);if(!b||b.disabled)throw Error('Missing enabled button '+text);b.click();await delay(30);};`;
test.beforeAll(async () => { test.setTimeout(60000); await safari.open(); });
test.afterAll(async () => { await safari.close(); });
for (const level of LEVELS) {
    test(`shop ${level}: seeded win and result navigation`, async () => { await safari.go(`/shop?level=${level}&seed=${seed}`); const secret = shop.createGame(level, mulberry32(seed)).secret; await safari.task(`${browserHelpers}const secret=${JSON.stringify(secret)};for(let i=0;i<secret.length;i++){const select=document.querySelectorAll('select')[i];const setter=Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype,'value').set;setter.call(select,secret[i]);select.dispatchEvent(new Event('change',{bubbles:true}));await delay(30);}await click('Guess');await wait(()=>document.querySelector('dialog[data-result]'));return document.querySelector('dialog[data-result]').textContent;`); await expect.poll(() => safari.eval('document.querySelector("dialog[data-result]")?.textContent')).toContain('You won!'); await resultFlow('shop', level); });
    test(`pairs ${level}: clear every seeded board`, async () => { test.setTimeout(180000); await safari.go(`/pairs?level=${level}&seed=${seed}`); const rng = mulberry32(seed); let state = pairs.createGame(level, rng); const plan: ({
        type: 'flip';
        index: number;
    } | {
        type: 'board';
    })[] = []; for (let n = 0; n < PAIRS[level].boards; n++) {
        while (state.status === 'playing') {
            const pair = state.tiles.find(t => !t.matched && t.kind !== 'star')!.pair;
            const indexes = state.tiles.flatMap((t, i) => !t.matched && t.pair === pair ? [i] : []);
            for (const i of indexes) {
                plan.push({ type: 'flip', index: i });
                state = pairs.flip(state, i, rng);
            }
        }
        if (state.status === 'cleared') {
            plan.push({ type: 'board' });
            state = pairs.nextBoard(state, rng);
        }
    } expect(state.status).toBe('won'); for (const a of plan) {
        if (a.type === 'board')
            await safari.click('Next board');
        else
            await safari.eval(`(()=>{const tile=document.querySelector('.pairs-board').children[${a.index}];if(tile.tagName!=='BUTTON'||tile.disabled)throw Error('Cannot flip tile '+${a.index});tile.click();return true;})()`);
    } await expect.poll(() => safari.eval('!!document.querySelector("dialog[data-result]")')).toBe(true); expect(await safari.eval('document.querySelector("dialog[data-result]").textContent')).toContain('You won!'); await resultFlow('pairs', level); });
    test(`cakes ${level}: ${level === 'beginner' ? 'ship correct orders' : 'exhaust mistake limit'}`, async () => { test.setTimeout(90000); await safari.go(`/cakes?level=${level}&seed=${seed}`); if (level === 'beginner') {
        const rng = mulberry32(seed);
        const orders = Array.from({ length: CAKES[level].target }, () => cakes.generateOrder(level, rng));
        await safari.task(`${browserHelpers}const orders=${JSON.stringify(orders)};const ingredient=async(station,value)=>{const b=[...document.querySelectorAll('.cake-station')].find(s=>s.querySelector('h3').textContent.toLowerCase()===station);const control=[...b.querySelectorAll('button')].find(b=>b.textContent===value);control.click();await delay(30);};for(let n=0;n<orders.length;n++){if(n)await click('Add cake');const o=orders[n];await ingredient('pan',o.pan);await click('Right →');await ingredient('batter',o.layers[0].batter);await click('Right →');await click('Right →');await ingredient('icing',o.icing);await click('Right →');await ingredient('topping',o.topping);await click('Right →');await click('Ship selected cake');}await wait(()=>document.querySelector('dialog[data-result]'));return true;`);
    }
    else {
        for (let n = 0; n < CAKES[level].mistakeLimit; n++) {
            if (n)
                await safari.click('Add cake');
            await expect.poll(() => safari.eval(`(()=>{const mistakes=Number([...document.querySelectorAll('.hud div')].find(n=>n.querySelector('dt').textContent==='Mistakes').querySelector('dd').textContent.split('/')[0]);if(mistakes===${n + 1})return true;if(document.querySelector('.belt-cake[aria-pressed=true][aria-label$="at Box"]'))[...document.querySelectorAll('button')].find(b=>b.textContent==='Ship selected cake').click();return false;})()`), { timeout: 30000, intervals: [200] }).toBe(true);
        }
        await expect.poll(() => safari.eval('!!document.querySelector("dialog[data-result]")')).toBe(true);
    } expect(await safari.eval('document.querySelector("dialog[data-result]").textContent')).toContain(level === 'beginner' ? 'You won!' : 'Round complete'); await resultFlow('cakes', level); });
}
async function resultFlow(game: string, level: string) { expect(await safari.eval('document.querySelector("meta[http-equiv=Content-Security-Policy]").content.includes("connect-src "+String.fromCharCode(39)+"none"+String.fromCharCode(39))')).toBe(true); expect(await safari.eval('performance.getEntriesByType("resource").every(r=>new URL(r.name).origin===location.origin)')).toBe(true); await safari.click('Play again'); await expect.poll(() => safari.eval('!!document.querySelector("dialog[data-result]")')).toBe(false); await safari.click('← Back to town'); await safari.click('Leave for town'); await expect.poll(() => safari.eval('!!document.querySelector(".town-scene")')).toBe(true); await safari.go(`/${game}?level=${level}&seed=${seed}`); await safari.eval('document.dispatchEvent(new KeyboardEvent("keydown",{key:"Escape",bubbles:true}));true'); await expect.poll(() => safari.eval('document.querySelector("dialog")?.getAttribute("aria-label")')).toBe('Leave this round?'); await safari.click('Keep playing'); await safari.eval('location.hash="/";true'); await expect.poll(() => safari.eval('document.querySelector("dialog")?.getAttribute("aria-label")')).toBe('Leave this round?'); await safari.click('Leave for town'); }
test('picker, unknown route, persisted prefs and corruption fallback', async () => { await safari.go('/unknown'); expect(await safari.eval('!!document.querySelector(".town-scene")')).toBe(true); await safari.go('/shop?seed=99'); expect(await safari.eval('document.querySelector("dialog").textContent')).toContain('Choose a level'); await safari.click('Back to town'); await safari.eval(`localStorage.setItem(${JSON.stringify(PREFS_KEY)},'broken');true`); await safari.go('/'); expect(await safari.eval('document.querySelector(".town-header button").textContent')).toContain('Sound off'); await safari.eval('document.querySelector(".town-header button").click();true'); await safari.go('/'); expect(await safari.eval('document.querySelector(".town-header button").textContent')).toContain('Sound on'); await safari.eval(`localStorage.setItem(${JSON.stringify(PREFS_KEY)},JSON.stringify({muted:true,best:{'shop:beginner':{score:2,title:'Smart Sleuth'}}}));true`); await safari.go('/'); expect(await safari.eval('document.querySelector(".best-panel").textContent')).toContain('Smart Sleuth'); });
test('external requests blocked by CSP during play', async () => { await safari.go('/shop?level=beginner&seed=1'); expect(await safari.task(`let blocked=false;document.addEventListener('securitypolicyviolation',()=>blocked=true);const image=new Image();image.src='https://example.invalid/plum-audit.png';await new Promise(r=>setTimeout(r,200));return blocked;`)).toBe(true); expect(await safari.eval('performance.getEntriesByType("resource").filter(r=>!r.name.includes("example.invalid")).every(r=>new URL(r.name).origin===location.origin)')).toBe(true); });
test('visual gate: 360, 768, 1280 without overflow or overlapping controls', async () => { test.setTimeout(120000); await mkdir('test-results/screenshots', { recursive: true }); const output: unknown[] = []; for (const width of [360, 768, 1280]) {
    await safari.viewport(width);
    for (const path of ['/', '/shop?level=advanced&seed=1', '/pairs?level=advanced&seed=1', '/cakes?level=advanced&seed=1']) {
        await safari.go(path);
        await safari.viewport(width);
        const geometry = await safari.eval<{
            width: number;
            scroll: number;
            small: string[];
            overlap: string[];
            height: number;
        }>(`(()=>{const nodes=[...document.querySelectorAll('button,select')].filter(n=>n.getBoundingClientRect().width>0);const rect=n=>n.getBoundingClientRect();const small=nodes.filter(n=>Math.round(rect(n).width)<44||Math.round(rect(n).height)<44).map(n=>({text:n.textContent,width:rect(n).width,height:rect(n).height,minHeight:getComputedStyle(n).minHeight}));const overlap=[];for(let i=0;i<nodes.length;i++)for(let j=i+1;j<nodes.length;j++){const a=rect(nodes[i]),b=rect(nodes[j]);if(Math.min(a.right,b.right)-Math.max(a.left,b.left)>1&&Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>1)overlap.push(nodes[i].textContent+' / '+nodes[j].textContent);}return {width:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth,small,overlap,height:document.documentElement.scrollHeight};})()`);
        expect(geometry.width).toBe(width);
        expect(geometry.scroll).toBeLessThanOrEqual(width);
        expect(geometry.small).toEqual([]);
        expect(geometry.overlap).toEqual([]);
        output.push({ path, ...geometry });
        const name = path === '/' ? 'town' : path.split('?')[0].slice(1);
        await safari.eval('window.scrollTo(0,0);true');
        await safari.screenshot(`test-results/screenshots/${name}-${width}-top.png`);
        if (geometry.height > await safari.eval<number>('window.innerHeight')) {
            await safari.eval('window.scrollTo(0,document.documentElement.scrollHeight);true');
            await safari.screenshot(`test-results/screenshots/${name}-${width}-bottom.png`);
        }
    }
} await writeFile('test-results/screenshots/geometry.json', JSON.stringify(output, null, 2)); });
test('result Change level and Town; native keyboard and reduced motion', async () => {
    await safari.viewport(768);
    await safari.go('/');
    await safari.eval('document.querySelector(".town-header button").focus();true');
    await safari.keys([36]);
    await expect.poll(() => safari.eval('document.querySelector(".town-header button").getAttribute("aria-pressed")')).toBe('true');
    await safari.go('/pairs?level=beginner&seed=1');
    await safari.eval('document.querySelector(".pair-tile").focus();true');
    await safari.keys([36]);
    await expect.poll(() => safari.eval('document.querySelectorAll(".pair-tile[aria-pressed=true]").length')).toBe(1);
    await safari.keys([48], true);
    expect(await safari.eval('document.activeElement.classList.contains("pair-tile")')).toBe(true);
    await safari.keys([53]);
    await expect.poll(() => safari.eval('document.querySelector("dialog")?.getAttribute("aria-label")')).toBe('Leave this round?');
    await safari.click('Keep playing');
    await safari.go('/cakes?level=beginner&seed=1');
    await safari.eval('[...document.querySelectorAll(".cake-station button")].find(b=>b.textContent==="round").focus();true');
    await safari.keys([36]);
    expect(await safari.eval('document.querySelector(".cake-cue").textContent')).toBe('Ingredient added.');
    await safari.go('/shop?level=beginner&seed=123');
    await safari.eval('document.querySelector("select").focus();true');
    await safari.keys([49, 125, 36, 53]);
    expect(await safari.eval('document.querySelector("select").value')).toBe('purple');
    if (await safari.eval('!!document.querySelector("dialog")'))
        await safari.click('Keep playing');
    for (const action of ['Change level', 'Town']) {
        await safari.go('/shop?level=beginner&seed=123');
        const secret = shop.createGame('beginner', mulberry32(123)).secret;
        await safari.task(`${browserHelpers}for(let i=0;i<${JSON.stringify(secret)}.length;i++){const s=document.querySelectorAll('select')[i];Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype,'value').set.call(s,${JSON.stringify(secret)}[i]);s.dispatchEvent(new Event('change',{bubbles:true}));await delay(30);}await click('Guess');await wait(()=>document.querySelector('dialog[data-result]'));return true;`);
        await safari.click(action);
        await expect.poll(() => safari.eval(action === 'Town' ? '!!document.querySelector(".town-scene")' : 'document.querySelector("dialog")?.textContent.includes("Choose a level")')).toBe(true);
    }
    expect(await safari.eval('document.querySelector(".best-panel").textContent')).toContain('Sharp Sleuth');
    const motion = await safari.eval(`(()=>{const rule=[...document.styleSheets].flatMap(s=>[...s.cssRules]).find(r=>r.conditionText==='(prefers-reduced-motion: reduce)');if(!rule)throw Error('Missing reduced motion rule');const media=rule.media.mediaText;rule.media.mediaText='all';const style=getComputedStyle(document.querySelector('button'));const value={transition:style.transitionDuration,animation:style.animationName};rule.media.mediaText=media;return value;})()`);
    expect(motion).toEqual({ transition: '0s', animation: 'none' });
});
test('Pairs mismatch and Peek use real UI locks and durations', async () => {
    await safari.go('/pairs?level=beginner&seed=12');
    const initial = pairs.createGame('beginner', mulberry32(12));
    const a = initial.tiles.findIndex(t => t.kind === 'normal'), b = initial.tiles.findIndex(t => t.kind === 'normal' && t.pair !== initial.tiles[a].pair);
    for (const index of [a, b])
        await safari.eval(`document.querySelector('.pairs-board').children[${index}].click();true`);
    expect(await safari.eval('document.querySelector(".pairs-status").textContent')).toContain('turn back');
    expect(await safari.eval('document.querySelectorAll(".pair-tile:not(:disabled)").length')).toBe(0);
    await expect.poll(() => safari.eval('document.querySelectorAll(".pair-tile[aria-pressed=true]").length'), { timeout: 3000, intervals: [100] }).toBe(0);
    await safari.go('/pairs?level=advanced&seed=12');
    const state = pairs.createGame('advanced', mulberry32(12));
    const indexes = state.tiles.flatMap((t, i) => t.kind === 'peek' ? [i] : []);
    for (const index of indexes)
        await safari.eval(`document.querySelector('.pairs-board').children[${index}].click();true`);
    await safari.click('Use peek (1)');
    expect(await safari.eval('document.querySelectorAll(".pair-tile[aria-pressed=true]").length')).toBe(62);
    expect(await safari.eval('[...document.querySelectorAll(".hud div")].find(n=>n.querySelector("dt").textContent==="Turns").querySelector("dd").textContent')).toBe('63');
    expect(await safari.eval('document.querySelectorAll(".pair-tile:not(:disabled)").length')).toBe(0);
    await expect.poll(() => safari.eval('document.querySelectorAll(".pair-tile[aria-pressed=true]").length'), { timeout: 4000, intervals: [100] }).toBe(0);
});
