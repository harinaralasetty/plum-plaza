import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { expect } from '@playwright/test';
const run = promisify(execFile);
const quote = (s: string) => JSON.stringify(s);
export class Safari {
    windowId = 0;
    async apple(lines: string[]) { const { stdout } = await run('osascript', ['-e', ['with timeout of 15 seconds', 'tell application "Safari"', ...lines, 'end tell', 'end timeout'].join('\n')], { timeout: 20000 }); return stdout.trim(); }
    async open() { const before = (await this.apple(['return id of every window'])).split(',').map(Number); await this.apple(['make new document with properties {URL:"http://127.0.0.1:4173/"}']); const after = (await this.apple(['return id of every window'])).split(',').map(Number); this.windowId = after.find(id => !before.includes(id)) ?? 0; if (!this.windowId)
        throw Error('Cannot identify owned Safari window'); await this.apple([`set visible of window id ${this.windowId} to true`, `set bounds of window id ${this.windowId} to {0,25,1440,1050}`, `set index of window id ${this.windowId} to 1`, 'activate']); await expect.poll(() => this.top('document.title')).toBe('Plum Plaza'); await this.top(`document.body.innerHTML='<iframe id="test-frame" title="Plum Plaza test viewport" style="display:block;border:0;width:1280px;height:960px;margin:0 auto" src="/"></iframe>'; document.body.style.cssText='margin:0;background:#ecf5ed';document.getElementById('test-frame').style.height=innerHeight+'px';true`); await this.ready(); }
    async keys(codes: number[], option = false) { await this.apple([`set index of window id ${this.windowId} to 1`, 'activate']); await run('osascript', ['-e', ['tell application "System Events"', ...codes.flatMap(code => [`key code ${code}${option ? ' using option down' : ''}`, 'delay 0.15']), 'end tell'].join('\n')], { timeout: 10000 }); }
    async screenshot(path: string) { await this.apple([`set visible of window id ${this.windowId} to true`, `set index of window id ${this.windowId} to 1`, 'activate']); await run('/usr/sbin/screencapture', ['-x', '-o', '-l', String(this.windowId), path]); }
    async close() { if (this.windowId)
        await this.apple([`close window id ${this.windowId}`]); }
    body(script: string) { return /;\s*true$/.test(script.trim()) ? script.trim().replace(/;\s*true$/, ';return true;') : `return (${script});`; }
    async execute<T>(code: string): Promise<T> { const raw = await this.apple([`if visible of window id ${this.windowId} is false then set visible of window id ${this.windowId} to true`, `set index of window id ${this.windowId} to 1`, 'activate', `return do JavaScript ${quote(`JSON.stringify((()=>{try{${code}}catch(error){return {__error:String(error)};}})())`)} in current tab of window id ${this.windowId}`]); const value = JSON.parse(raw || 'null'); if (value?.__error)
        throw Error(value.__error); return value as T; }
    async top<T = unknown>(script: string): Promise<T> { return this.execute<T>(this.body(script)); }
    async eval<T = unknown>(script: string): Promise<T> { return this.execute<T>(`const window=globalThis.document.getElementById('test-frame').contentWindow;const document=window.document,location=window.location,performance=window.performance,innerWidth=window.innerWidth,HTMLSelectElement=window.HTMLSelectElement,Event=window.Event,KeyboardEvent=window.KeyboardEvent,Image=window.Image,getComputedStyle=window.getComputedStyle.bind(window);${this.body(script)}`); }
    async ready() { await expect.poll(() => this.eval('document.readyState==="complete"&&!!document.querySelector("h1,dialog")')).toBe(true); }
    async go(path: string) { await this.top(`const old=document.getElementById('test-frame');const next=old.cloneNode(false);next.src=${quote('/#' + path)};old.replaceWith(next);true`); await this.ready(); }
    async click(text: string) { await expect.poll(() => this.eval(`!![...document.querySelectorAll('button')].find(b=>b.textContent.trim()===${quote(text)}&&!b.disabled)`)).toBe(true); await this.eval(`(()=>{const b=[...document.querySelectorAll('button')].find(b=>b.textContent.trim()===${quote(text)});if(!b||b.disabled)throw Error('Missing enabled button: '+${quote(text)});b.click();return true;})()`); }
    async task(body: string, timeout = 60000) { await this.eval(`(()=>{window.__auditTask={done:false};(async()=>{try{const value=await (async()=>{${body}})();window.__auditTask={done:true,value};}catch(error){window.__auditTask={done:true,error:String(error)};}})();return true;})()`); await expect.poll(() => this.eval<{
        done: boolean;
    }>('window.__auditTask'), { timeout, intervals: [100, 200] }).toMatchObject({ done: true }); const result = await this.eval<{
        error?: string;
        value: unknown;
    }>('window.__auditTask'); expect(result.error).toBeUndefined(); return result.value; }
    async viewport(width: number) { await this.top(`document.getElementById('test-frame').style.width='${width}px';true`); for (let n = 0; n < 4; n++) {
        const actual = await this.eval<number>('document.documentElement.clientWidth');
        if (actual === width)
            return;
        await this.top(`const f=document.getElementById('test-frame');f.style.width=(parseFloat(f.style.width)+${width - actual})+'px';true`);
    } throw Error('Unable to calibrate Safari viewport'); }
}
