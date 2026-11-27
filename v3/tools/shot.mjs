// node shot.mjs url out.png w h [waitMs]  — headless chrome screenshot + console log (WebGL через swiftshader/angle)
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
const [url, out, w = '1440', h = '900', wait = '3500', js = ''] = process.argv.slice(2);
const CH = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const ud = fs.mkdtempSync(path.join(process.env.TMPDIR || os.tmpdir(), 'cdp'));
const port = 9300 + Math.floor(Math.random() * 500);
const p = spawn(CH, ['--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${ud}`, '--hide-scrollbars', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', `--window-size=${w},${h}`, 'about:blank']);
const sleep = ms => new Promise(r => setTimeout(r, ms));
let ws;
for (let i = 0; i < 50; i++) { try { const r = await fetch(`http://127.0.0.1:${port}/json/list`); const L = await r.json(); const t = L.find(x => x.type === 'page'); if (t) { ws = t.webSocketDebuggerUrl; break; } } catch { } await sleep(200); }
const sock = new WebSocket(ws); await new Promise(r => sock.onopen = r);
let id = 0; const pend = {}; const logs = [];
sock.onmessage = e => { const m = JSON.parse(e.data); if (m.id && pend[m.id]) { pend[m.id](m); delete pend[m.id]; } else if (m.method === 'Runtime.consoleAPICalled') logs.push(m.params.type + ': ' + m.params.args.map(a => a.value ?? a.description).join(' ')); else if (m.method === 'Runtime.exceptionThrown') logs.push('EXC: ' + (m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text)); else if (m.method === 'Log.entryAdded') logs.push('log ' + m.params.entry.level + ': ' + m.params.entry.text + ' ' + (m.params.entry.url || '')); };
const send = (method, params = {}) => new Promise(r => { const i = ++id; pend[i] = r; sock.send(JSON.stringify({ id: i, method, params })); });
await send('Runtime.enable'); await send('Log.enable'); await send('Page.enable');
const mob = +w < 600;
await send('Emulation.setDeviceMetricsOverride', { width: +w, height: +h, deviceScaleFactor: mob ? 2 : 1, mobile: mob });
await send('Page.navigate', { url });
await sleep(+wait);
if (js) { const r = await send('Runtime.evaluate', { expression: js, awaitPromise: true, returnByValue: true }); logs.push('JS> ' + JSON.stringify(r.result?.result?.value ?? r.result)); await sleep(2500); }
const full = process.env.FULL;
let clip;
if (full) { const m = await send('Page.getLayoutMetrics'); clip = { x: 0, y: 0, width: +w, height: Math.min(m.result.cssContentSize.height, 6000), scale: 1 }; }
const s = await send('Page.captureScreenshot', { format: 'png', ...(clip ? { clip, captureBeyondViewport: true } : {}) });
fs.writeFileSync(out, Buffer.from(s.result.data, 'base64'));
console.log(logs.join('\n') || '(no console)');
sock.close(); p.kill();
