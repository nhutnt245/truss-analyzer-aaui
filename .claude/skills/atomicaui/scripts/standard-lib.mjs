// Shared by the standard-only path (pages built without the React parts): where its files are,
// how they are copied into an app, and a small local file server for looking at plain pages.
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
/** In the starter the files are in kit/standard/; in the packed skill they are in references/standard/. */
export const standardDir = (root = here) => [path.join(root, 'kit/standard'), path.join(root, 'references/standard')].find((dir) => fs.existsSync(dir)) ?? path.join(root, 'kit/standard');
/** The starter keeps the fonts once, in public/fonts/; the packed skill has them beside the stylesheet. */
const fontsDir = (root = here) => [path.join(standardDir(root), 'aui/fonts'), path.join(root, 'public/fonts')].find((dir) => fs.existsSync(dir));

export const sha256 = (data) => createHash('sha256').update(data).digest('hex');
export const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
/** Class names, layout classes and recipes of this release: what the checks compare against. */
/** `where` is the folder as the person running the command would type it: kit/standard in the starter, the skill's references/standard in an app. */
const shownDir = (root) => {
  const relative = path.relative(process.cwd(), standardDir(root)).split(path.sep).join('/');
  return relative.startsWith('..') ? standardDir(root).split(path.sep).join('/') : relative;
};
export const loadStandard = (root = here) => ({ where: shownDir(root), ...readJson(path.join(standardDir(root), 'classes.json')), ...readJson(path.join(standardDir(root), 'recipes.json')) });

/** Copies the folder a page loads (stylesheet, page setup, theme switch, fonts) to `<target>/aui/`. Returns the file names. */
export function copyStandard(target, root = here) {
  const out = path.join(target, 'aui');
  fs.rmSync(out, { recursive: true, force: true });
  fs.mkdirSync(path.join(out, 'fonts'), { recursive: true });
  const written = [];
  const source = path.join(standardDir(root), 'aui');
  for (const name of fs.readdirSync(source).sort()) {
    if (!fs.statSync(path.join(source, name)).isFile()) continue;
    fs.copyFileSync(path.join(source, name), path.join(out, name));
    written.push(name);
  }
  const fonts = fontsDir(root);
  for (const name of fonts ? fs.readdirSync(fonts).sort() : []) {
    fs.copyFileSync(path.join(fonts, name), path.join(out, 'fonts', name));
    written.push(`fonts/${name}`);
  }
  return written;
}

const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.png': 'image/png' };

/** Serves one folder on 127.0.0.1, on a port the system picks. Returns { base, close }. */
export async function serveFolder(dir) {
  const server = http.createServer((request, response) => {
    const name = decodeURIComponent(new URL(request.url, 'http://local/').pathname);
    let file = path.join(dir, path.normalize(name).replace(/^(\.\.[/\\])+/, ''));
    if (file.startsWith(dir) && fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
    if (!file.startsWith(dir) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
      response.writeHead(404).end('Not found');
      return;
    }
    response.writeHead(200, { 'content-type': TYPES[path.extname(file)] ?? 'application/octet-stream', 'cache-control': 'no-store' });
    response.end(fs.readFileSync(file));
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  return { base: `http://127.0.0.1:${server.address().port}/`, close: () => new Promise((resolve) => server.close(resolve)) };
}
