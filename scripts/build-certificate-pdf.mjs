/**
 * npm run certificate:sample — يولّد public/samples/td-certificate-sample.pdf من قالب الشهادة نفسه
 * (‎/certificate/sample?print=1‎) بمتصفح Chromium محلي بلا واجهة (Chrome أو Edge) عبر بروتوكول
 * DevTools — بلا خادم ولا خدمة خارجية. الخطوط الثلاثة (قاعدة 2) تُضمَّن في الملف كما يرسمها المتصفح،
 * فالعربية متصلة وصحيحة الاتجاه.
 *
 * يحتاج خادم الموقع يعمل (npm run dev أو npm start). BASE_URL يغيّر عنوانه، وCHROME_PATH مسار المتصفح.
 */
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const BASE_URL = (process.env.BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");
const OUT = path.join(root, "public", "samples", "td-certificate-sample.pdf");
const PORT = 9555;
const MAX_BYTES = 1024 * 1024;

const CANDIDATES = [
  process.env.CHROME_PATH,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
].filter(Boolean);

const browserPath = CANDIDATES.find((p) => existsSync(p));
if (!browserPath) {
  console.error("لم نجد Chrome أو Edge — اضبط CHROME_PATH.");
  process.exit(1);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const profile = mkdtempSync(path.join(tmpdir(), "td-cert-"));
const browser = spawn(browserPath, [
  "--headless=new",
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${profile}`,
  "--no-first-run",
  "--hide-scrollbars",
  "about:blank",
]);

let ws;
try {
  let target;
  for (let i = 0; i < 80 && !target; i++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
      target = list.find((t) => t.type === "page");
    } catch {
      await sleep(250);
    }
  }
  if (!target) throw new Error("تعذّر تشغيل المتصفح");

  ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
  });
  let id = 0;
  const pending = new Map();
  const events = new Set();
  ws.onmessage = (e) => {
    const msg = JSON.parse(e.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(new Error(JSON.stringify(msg.error)));
      else resolve(msg.result);
    } else for (const fn of events) fn(msg);
  };
  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const n = ++id;
      pending.set(n, { resolve, reject });
      ws.send(JSON.stringify({ id: n, method, params }));
    });

  await send("Page.enable");
  // الشهادة تُطبع فاتحة دائماً — مهما كان وضع الجهاز
  await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-color-scheme", value: "light" }] });
  const loaded = new Promise((resolve) => {
    const onLoad = (msg) => {
      if (msg.method === "Page.loadEventFired") {
        events.delete(onLoad);
        resolve();
      }
    };
    events.add(onLoad);
  });
  await send("Page.navigate", { url: `${BASE_URL}/certificate/sample?print=1` });
  await loaded;
  // الخطوط قبل الطباعة — وإلا رُسمت العربية بخط بديل
  await send("Runtime.evaluate", { expression: "document.fonts.ready.then(() => document.fonts.size)", awaitPromise: true });
  await sleep(400);

  const pdf = await send("Page.printToPDF", { printBackground: true, preferCSSPageSize: true, displayHeaderFooter: false });
  const bytes = Buffer.from(pdf.data, "base64");
  mkdirSync(path.dirname(OUT), { recursive: true });
  writeFileSync(OUT, bytes);

  const text = readFileSync(OUT, "latin1");
  const fonts = [...new Set([...text.matchAll(/\/BaseFont\s*\/([A-Z]{6}\+)?([^\s/<>\]]+)/g)].map((m) => m[2]))];
  const pages = (text.match(/\/Type\s*\/Page[^s]/g) ?? []).length;
  console.log(`certificate: ${path.relative(root, OUT)} · ${(bytes.length / 1024).toFixed(0)}KB · ${pages} صفحة`);
  console.log(`fonts: ${fonts.join(", ")}`);
  if (bytes.length > MAX_BYTES) {
    console.error("الملف أكبر من 1MB");
    process.exitCode = 1;
  }
} finally {
  ws?.close();
  browser.kill();
  await sleep(300);
  try {
    rmSync(profile, { recursive: true, force: true });
  } catch {
    // ملف قفل المتصفح قد يتأخر — المجلد المؤقت يُنظَّف لاحقاً
  }
}
