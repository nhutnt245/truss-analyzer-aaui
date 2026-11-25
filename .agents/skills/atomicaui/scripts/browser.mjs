// A private headless browser for the kit's evidence and layout checks.
// It never opens a debugging port: it talks to its own child process over a pipe (file descriptors 3 and 4),
// uses its own temporary profile, and stops only the process it started.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

// Order of preference: Chrome for Testing, the bundled headless shell, Chrome Canary, then Chromium or Edge.
// The user's own Google Chrome is never used on macOS (it may be driving other tools); AUI_BROWSER overrides everything.
const CANDIDATES = {
  darwin: [
    '/Applications/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing',
    '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  ],
  linux: ['/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/google-chrome-beta', '/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/microsoft-edge'],
  win32: [
    'C:\\Program Files\\Google\\Chrome SxS\\Application\\chrome.exe',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  ],
};

// Browsers downloaded by `npx @puppeteer/browsers install` (<root>/<kind>/<version>/<platform>/) or by Playwright
// (<root>/<kind>-<build>/<platform>/): Chrome for Testing and the headless shell.
function downloaded(platform, home, exists, list) {
  const found = [];
  const puppeteer = path.join(home, '.cache', 'puppeteer');
  const playwright = platform === 'darwin' ? path.join(home, 'Library', 'Caches', 'ms-playwright') : path.join(home, '.cache', 'ms-playwright');
  const bases = [];
  for (const kind of ['chrome', 'chrome-headless-shell']) {
    for (const version of list(path.join(puppeteer, kind)).sort().reverse()) bases.push([kind, path.join(puppeteer, kind, version)]);
  }
  for (const entry of list(playwright).sort().reverse()) {
    if (entry.startsWith('chromium_headless_shell-')) bases.push(['chrome-headless-shell', path.join(playwright, entry)]);
    else if (entry.startsWith('chromium-')) bases.push(['chrome', path.join(playwright, entry)]);
  }
  const exe = platform === 'win32' ? 'chrome.exe' : 'chrome';
  const shellExe = platform === 'win32' ? 'chrome-headless-shell.exe' : 'chrome-headless-shell';
  for (const [kind, base] of bases) {
    for (const platformDir of list(base)) {
      const dir = path.join(base, platformDir);
      if (kind === 'chrome-headless-shell') found.push(path.join(dir, shellExe));
      else if (platform === 'darwin') {
        for (const app of list(dir).filter((name) => name.endsWith('.app'))) {
          const macos = path.join(dir, app, 'Contents', 'MacOS');
          for (const bin of list(macos)) found.push(path.join(macos, bin));
        }
      } else found.push(path.join(dir, exe));
    }
  }
  return found.filter((candidate) => exists(candidate));
}

function listDir(dir) {
  try {
    return fs.readdirSync(dir);
  } catch {
    return [];
  }
}

export function findBrowser(env = process.env, platform = process.platform, exists = fs.existsSync, list = listDir, home = os.homedir()) {
  if (env.AUI_BROWSER) return exists(env.AUI_BROWSER) ? env.AUI_BROWSER : null;
  const testing = downloaded(platform, home, exists, list);
  const installed = (CANDIDATES[platform] ?? []).filter((candidate) => exists(candidate));
  return [...testing, ...installed][0] ?? null;
}

/** The code of the error `open()` gives for an address that gave no page. The error also carries `reason`: what happened, without the address. */
export const NO_PAGE = 'AUI_NO_PAGE';
const noPage = (url, reason, advice) => Object.assign(new Error(`${url}: ${reason}. ${advice}`), { code: NO_PAGE, reason });

/**
 * How long a page may take to load, in milliseconds. A healthy page on a busy machine (several browsers and dev servers at once, a cold dependency cache)
 * can take longer than 15 s, so a slow load is not a failure; a server that never answers still ends with an error, only later.
 */
export const PAGE_LOAD_MS = 30000;
/**
 * After a step of a view (a press, typed text): how long no request may begin or end before the page is read, and how long the requests the step set going
 * are waited for at most, in milliseconds. A request that never ends (a long poll) holds a step up for that limit, never longer.
 */
export const STEP_QUIET_MS = 300;
export const STEP_LIMIT_MS = 5000;

/** Starts the browser and returns { send, on, newPage, close }. Scrollbars are hidden unless `scrollbars` is true (a test of what a bar that takes room does). */
export async function launchBrowser(executable, { scrollbars = false } = {}) {
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'aui-evidence-'));
  const child = spawn(
    executable,
    ['--headless=new', '--remote-debugging-pipe', `--user-data-dir=${profile}`, '--no-first-run', '--no-default-browser-check', '--disable-gpu', ...(scrollbars ? [] : ['--hide-scrollbars']), '--disable-extensions', 'about:blank'],
    { stdio: ['ignore', 'ignore', 'ignore', 'pipe', 'pipe'] },
  );
  const [, , , toBrowser, fromBrowser] = child.stdio;
  let nextId = 1;
  const pending = new Map();
  const listeners = new Set();
  let buffer = '';
  fromBrowser.setEncoding('utf8');
  fromBrowser.on('data', (chunk) => {
    buffer += chunk;
    let end;
    while ((end = buffer.indexOf('\0')) >= 0) {
      const message = JSON.parse(buffer.slice(0, end));
      buffer = buffer.slice(end + 1);
      if (message.id && pending.has(message.id)) {
        const { resolve, reject } = pending.get(message.id);
        pending.delete(message.id);
        if (message.error) reject(new Error(`${message.error.message}`));
        else resolve(message.result);
      } else {
        for (const listener of listeners) listener(message);
      }
    }
  });
  const exited = new Promise((resolve) => child.once('exit', resolve));
  child.once('exit', () => {
    for (const { reject } of pending.values()) reject(new Error('The browser stopped.'));
    pending.clear();
  });
  const send = (method, params = {}, sessionId) =>
    new Promise((resolve, reject) => {
      const id = nextId++;
      pending.set(id, { resolve, reject });
      toBrowser.write(`${JSON.stringify({ id, method, params, sessionId })}\0`);
    });
  const on = (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };
  const waitFor = (sessionId, method, timeoutMs = PAGE_LOAD_MS) =>
    new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        off();
        reject(new Error(`Timed out waiting for ${method}.`));
      }, timeoutMs);
      const off = on((message) => {
        if (message.sessionId === sessionId && message.method === method) {
          clearTimeout(timer);
          off();
          resolve(message.params);
        }
      });
    });

  async function newPage() {
    const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
    const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
    const consoleErrors = [];
    // A click or a submit can load the page again (a form that sends its own page): whether a load is going on, and how many documents have loaded.
    let loading = false;
    let documents = 0;
    // What a step asks for in the background (fetch, XMLHttpRequest): the requests that have begun and not ended, each with when it began, and when one last began or ended.
    const requests = new Map();
    let networkAt = 0;
    on((message) => {
      if (message.sessionId !== sessionId) return;
      if (message.method === 'Network.requestWillBeSent') requests.set(message.params.requestId, (networkAt = Date.now()));
      if (message.method === 'Network.loadingFinished' || message.method === 'Network.loadingFailed') {
        requests.delete(message.params.requestId);
        networkAt = Date.now();
      }
      if (message.method === 'Page.frameStartedLoading' && message.params.frameId === targetId) loading = true;
      if (message.method === 'Page.frameStoppedLoading' && message.params.frameId === targetId) loading = false;
      if (message.method === 'Page.loadEventFired') documents += 1;
      if (message.method === 'Runtime.exceptionThrown') consoleErrors.push(message.params.exceptionDetails.exception?.description ?? message.params.exceptionDetails.text);
      if (message.method === 'Runtime.consoleAPICalled' && ['error', 'warning'].includes(message.params.type)) {
        consoleErrors.push(message.params.args.map((arg) => arg.value ?? arg.description ?? '').join(' '));
      }
    });
    const call = (method, params) => send(method, params, sessionId);
    await call('Page.enable');
    await call('Runtime.enable');
    await call('Network.enable');
    return {
      consoleErrors,
      call,
      async size(width, height) {
        await call('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false });
      },
      async open(url) {
        // A blank page first, so two addresses that differ only after the # still load fresh.
        // The wait and the call are awaited together: a server that never answers keeps the call open, and the wait's time limit must reach the caller.
        await Promise.all([waitFor(sessionId, 'Page.loadEventFired'), call('Page.navigate', { url: 'about:blank' })]);
        const [, { errorText }] = await Promise.all([waitFor(sessionId, 'Page.loadEventFired'), call('Page.navigate', { url })]);
        // What the browser shows for an address that gave no page is its own error page, or the server's: neither is the app.
        if (errorText) throw noPage(url, `nothing answered (${errorText})`, 'Start the app, or check the address.');
        const status = await this.evaluate('performance.getEntriesByType("navigation")[0]?.responseStatus ?? 0');
        if (status >= 400) throw noPage(url, `the server answered ${status}, not a page`, 'Check the address.');
      },
      async evaluate(expression) {
        const { result, exceptionDetails } = await call('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
        if (exceptionDetails) throw new Error(exceptionDetails.exception?.description ?? exceptionDetails.text);
        return result.value;
      },
      /** How many documents the page has loaded, said once no load is going on: a higher number than before means a click or a submit loaded the page again. */
      async documents() {
        const end = Date.now() + PAGE_LOAD_MS;
        while (loading) {
          if (Date.now() > end) throw new Error('Timed out waiting for the page that a click or a submit loads.');
          await new Promise((resolve) => setTimeout(resolve, 50));
        }
        return documents;
      },
      /**
       * Waits for what a step set going: until every request begun since `since` (a time of Date.now(), taken before the step) has ended and no request
       * has begun or ended for STEP_QUIET_MS, STEP_LIMIT_MS at most. With no request it is a pause of STEP_QUIET_MS.
       */
      async quiet(since) {
        const called = Date.now();
        for (;;) {
          const now = Date.now();
          const left = [...requests.values()].some((began) => began >= since) ? STEP_QUIET_MS : Math.max(called, networkAt) + STEP_QUIET_MS - now;
          if (left <= 0 || now - called >= STEP_LIMIT_MS) return;
          await new Promise((resolve) => setTimeout(resolve, Math.min(left, 50)));
        }
      },
      async key(key, code = key, keyCode = 0) {
        await call('Input.dispatchKeyEvent', { type: 'keyDown', key, code, windowsVirtualKeyCode: keyCode });
        await call('Input.dispatchKeyEvent', { type: 'keyUp', key, code, windowsVirtualKeyCode: keyCode });
      },
      async mouseClick(x, y) {
        await call('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 });
        await call('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1 });
      },
      /** Presses a text field with the real mouse and reports a focus ring (outline) left on it: null when the page has no text field. */
      async pointerRing() {
        const spot = await this.evaluate(`(() => { const field = [...document.querySelectorAll('input,textarea')].find((one) => !['checkbox', 'radio', 'hidden'].includes(one.type) && one.getBoundingClientRect().width > 0); if (!field) return null; field.setAttribute('data-aui-probe', ''); const box = field.getBoundingClientRect(); return { x: box.left + box.width / 2, y: box.top + box.height / 2 }; })()`);
        if (!spot) return null;
        await this.mouseClick(spot.x, spot.y);
        await this.evaluate('new Promise((resolve) => setTimeout(resolve, 150))');
        return this.evaluate(`(() => { const field = document.querySelector('[data-aui-probe]'); const ringed = [field, field.closest('.aui-field-control,.aui-number-field-group,.aui-datepicker-input')].filter(Boolean).filter((one) => { const style = getComputedStyle(one); return style.outlineStyle !== 'none' && parseFloat(style.outlineWidth) > 0; }); field.removeAttribute('data-aui-probe'); return ringed.length > 0; })()`);
      },
      async screenshot(file) {
        const { data } = await call('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(file, Buffer.from(data, 'base64'));
      },
    };
  }

  async function close() {
    try {
      await Promise.race([send('Browser.close'), new Promise((resolve) => setTimeout(resolve, 2000))]);
    } catch {
      // Already gone.
    }
    // Never wait without an end: ask, then insist, then give up waiting. A browser that is busy can ignore the first two.
    const ask = setTimeout(() => child.kill(), 3000);
    const insist = setTimeout(() => child.kill('SIGKILL'), 6000);
    await Promise.race([exited, new Promise((resolve) => setTimeout(resolve, 9000))]);
    clearTimeout(ask);
    clearTimeout(insist);
    fs.rmSync(profile, { recursive: true, force: true, maxRetries: 3 });
  }

  return { send, on, newPage, close, pid: child.pid };
}

/**
 * Page script: waits until the page has settled and the icon font has arrived, and says whether it did.
 * Result: true (a Font Awesome face is loaded), false (the kit script gave no face: unreachable or blocked, or a face
 * is still loading after 5 s), null (the page has no icon). A fixed pause is not enough: the font arrives after
 * document.fonts.ready on a cold start, and a photograph taken before it shows empty icon boxes.
 */
export const SETTLE_WITH_ICONS = `document.fonts.ready.then(() => new Promise((resolve) => {
  const faces = () => [...document.fonts].filter((face) => /Font Awesome/i.test(face.family));
  const wantsIcons = () => document.querySelector('[class*="fa-"], .aui-icon, [class*="aui-icon"]') !== null;
  // The kit script has failed when its resource entry exists but nothing came back.
  const kitFailed = () => performance.getEntriesByType('resource').some((entry) => entry.name.includes('kit.fontawesome.com') && entry.responseStatus === 0 && entry.transferSize === 0 && entry.decodedBodySize === 0);
  // A region marked aria-busy (a screen whose code is still loading) is waited for, up to 5 s.
  const busy = () => document.querySelector('[aria-busy="true"]') !== null;
  const done = (value) => setTimeout(() => resolve(value), 200);
  const start = Date.now();
  let ready = start;
  const tick = () => {
    if (busy() && Date.now() - start <= 5000) {
      ready = Date.now();
      return setTimeout(tick, 100);
    }
    if (!wantsIcons() && Date.now() - ready > 300) return resolve(null);
    if (faces().some((face) => face.status === 'loaded')) return done(true);
    if (Date.now() - start > 5000 || (kitFailed() && faces().length === 0)) return done(false);
    setTimeout(tick, 100);
  };
  tick();
}))`;
