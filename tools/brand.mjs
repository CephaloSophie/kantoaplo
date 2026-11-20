#!/usr/bin/env node
/* KANTO APLO — icônes et image de partage (Open Graph), rendues par un navigateur
   avec les polices et les captures du site.
     PLAYWRIGHT=<chemin>/node_modules/playwright node tools/brand.mjs
   Écrit assets/brand/icon.svg, icon-32/180/192/512.png, apple-touch-icon.png,
   kantoaplo-og.jpg (1200 × 630). Le favicon.ico se fait ensuite avec Pillow
   (voir la fin du script). */
import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import vm from 'node:vm';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'assets/brand');
mkdirSync(OUT, { recursive: true });
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT || 'playwright');

const ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#C9963A"/><stop offset="50%" stop-color="#2DD4A0"/><stop offset="100%" stop-color="#8B5CF6"/></linearGradient></defs><rect width="64" height="64" rx="14" fill="#08090d"/><circle cx="32" cy="32" r="20" fill="none" stroke="url(#g)" stroke-width="3.2"/><circle cx="32" cy="32" r="5" fill="#C9963A"/></svg>`;
writeFileSync(join(OUT, 'icon.svg'), ICON);

const ctx = { window: {} };
vm.runInNewContext(readFileSync(join(ROOT, 'assets/js/data.js'), 'utf8'), ctx);
const eds = ctx.window.KANTO.editors;
const shots = [];
['zeugma', 'pinax', 'mantis', 'tekton', 'skopos', 'typos', 'skhema', 'logos'].forEach((id, k) => {
  const e = eds.find((x) => x.id === id);
  if (e && e.shots) shots.push({ src: pathToFileURL(join(ROOT, `assets/editors/${id}/thumbs/0${1 + (k % 2)}.webp`)).href, c: e.accent });
});
const fonts = pathToFileURL(join(ROOT, 'assets/fonts/fonts.css')).href;
const count = ['', '', '', '', '', '', '', '', '', '', '', 'Onze', 'Douze', 'Treize', 'Quatorze', 'Quinze'][eds.length] || eds.length;

const OG = `<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="${fonts}"><style>
html,body{margin:0;width:1200px;height:630px;background:#08090d;overflow:hidden}
.wall{position:absolute;top:-120px;right:-160px;width:900px;height:900px;display:grid;grid-template-columns:repeat(3,1fr);gap:18px;transform:rotateX(14deg) rotateY(-20deg) rotateZ(9deg);transform-origin:center}
.wall img{width:100%;aspect-ratio:16/10;object-fit:cover;object-position:top left;border-radius:10px;border:1px solid rgba(255,255,255,.1);filter:saturate(.75) brightness(.8)}
.veil{position:absolute;inset:0;background:linear-gradient(90deg,#08090d 0%,rgba(8,9,13,.97) 40%,rgba(8,9,13,.45) 70%,rgba(8,9,13,.2))}
.txt{position:absolute;left:72px;top:96px;width:620px;color:#e8dcc4;font-family:'IBM Plex Sans'}
.eyebrow{font-family:Cinzel;font-size:16px;letter-spacing:.36em;color:#C9963A}
h1{margin:22px 0 0;font-family:Cinzel;font-weight:400;font-size:92px;line-height:.95;letter-spacing:.03em;background:linear-gradient(180deg,#f6e9c9,#c9a666);-webkit-background-clip:text;color:transparent}
.sub{margin-top:26px;font-family:'Cormorant Garamond';font-style:italic;font-size:38px;color:#e6d6a8}
.sub b{font-style:normal;font-family:Cinzel;font-weight:400;background:linear-gradient(100deg,#f6e9c9,#C9963A 35%,#8B5CF6 70%,#2DD4A0);-webkit-background-clip:text;color:transparent}
.desc{margin-top:22px;font-size:21px;line-height:1.5;color:#b8ac97}
.foot{position:absolute;left:72px;bottom:54px;display:flex;gap:10px;font-family:'JetBrains Mono';font-size:15px;letter-spacing:.06em;color:#e6d6a8}
.foot span{padding:7px 14px;border-radius:999px;border:1px solid rgba(201,150,58,.4);background:rgba(201,150,58,.08)}
.staff{position:absolute;left:0;right:0;top:300px;height:49px;opacity:.12;background:repeating-linear-gradient(180deg,#C9963A 0 1px,transparent 1px 12px)}
</style></head><body>
<div class="wall">${shots.concat(shots).slice(0, 12).map((s) => `<img src="${s.src}">`).join('')}</div>
<div class="veil"></div><div class="staff"></div>
<div class="txt"><div class="eyebrow">NO-CODE · LOW-CODE · SAAS</div><h1>KANTO APLO</h1>
<div class="sub"><b>${count}</b> éditeurs. Une seule partition.</div>
<div class="desc">Composez vos applications métier sans écrire de code.</div></div>
<div class="foot"><span>kantoaplo.com</span><span>♪ démos en ligne</span></div>
</body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
const tmp = join(OUT, '.og.html');
writeFileSync(tmp, OG);
await page.goto(pathToFileURL(tmp).href);
await page.waitForTimeout(1200);
await page.screenshot({ path: join(OUT, 'kantoaplo-og.jpg'), type: 'jpeg', quality: 88 });
for (const size of [32, 180, 192, 512]) {
  const p = await browser.newPage({ viewport: { width: size, height: size } });
  await p.setContent(`<html><body style="margin:0;background:transparent">${ICON.replace('<svg ', `<svg width="${size}" height="${size}" `)}</body></html>`);
  await p.screenshot({ path: join(OUT, size === 180 ? 'apple-touch-icon.png' : `icon-${size}.png`), omitBackground: true });
  await p.close();
}
await browser.close();
(await import('node:fs')).unlinkSync(tmp);
console.log('assets/brand : icon.svg, icon-32/192/512.png, apple-touch-icon.png, kantoaplo-og.jpg');
console.log('favicon.ico : python3 -c "from PIL import Image; Image.open(\'assets/brand/icon-512.png\').save(\'favicon.ico\', sizes=[(16,16),(32,32),(48,48)])"');
