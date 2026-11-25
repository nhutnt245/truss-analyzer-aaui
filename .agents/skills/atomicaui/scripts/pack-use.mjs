// `npm run pack:use -- <pack> [--accept <file>]...`: turns an optional pack on (today: aras). The pack brings its own versions of a few app files
// (src/packs/<pack>/seed/, each named like the app file plus ".seed"). A seed replaces its app file only while that file is still
// the general starter's (its hash is the one in kit/SEEDS.json). An app file you changed is never overwritten: it is listed, you merge by hand,
// then name it with --accept so it is kept as it is. Once on, the pack is recorded in src/app/packs.json and later runs change nothing
// but a missing public/host.html, the app's own host page (aras), which is never overwritten.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SEEDS_MANIFEST, hashFile, listSeeds, seedDir } from './kit-files.mjs';

const kitRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/** Yours: the packs the app turned on, written by pack:use. A pack listed here is in use, whatever its files look like now. */
export const PACKS_RECORD = 'src/app/packs.json';

/** Yours once written: the Aras pack's host page, served at /host.html, whose frame shows the app (kit/packs/aras/frame.md). */
export const HOST_PAGE = 'public/host.html';
const STAND_IN = 'kit/samples/aras-standin';

/** Copies the kit's stand-in host page to public/host.html, its frame on this app in bare mode and its stylesheet read from the stand-in. Never over a page that is there. */
function addHostPage(root, pack) {
  const source = path.join(root, STAND_IN, 'host.html');
  const target = path.join(root, HOST_PAGE);
  if (pack !== 'aras' || fs.existsSync(target) || !fs.existsSync(source)) return [];
  const page = fs.readFileSync(source, 'utf8')
    .replace('(framed.html)', '(this app, in bare mode)')
    .replace('href="legacy.css"', `href="${STAND_IN}/legacy.css"`)
    .replace('title="Part P-1001" src="framed.html"', 'title="The app" src="./?mode=bare&type=Part&id=P-1001"');
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, page);
  return [`Added ${HOST_PAGE} (yours): the host page at /host.html that shows the app in a frame. Its frame address is the one edit (kit/packs/aras/frame.md).`];
}

/** Decides every seed, then writes only when none is in conflict. `accepted`: app files you merged by hand, kept as they are. Returns { status, written, current, conflicts, lines }. */
export function packUse(root, pack, accepted = []) {
  const seeds = listSeeds(root, pack);
  if (seeds.length === 0) return { status: 1, written: [], current: [], conflicts: [], lines: [`pack:use: there is no pack "${pack}" (no files under ${seedDir(pack)}/). Packs: ${fs.existsSync(path.join(root, 'src/packs')) ? fs.readdirSync(path.join(root, 'src/packs')).join(', ') : 'none'}.`] };
  const recordPath = path.join(root, PACKS_RECORD);
  const inUse = fs.existsSync(recordPath) ? JSON.parse(fs.readFileSync(recordPath, 'utf8')).packs : [];
  if (inUse.includes(pack)) {
    const host = addHostPage(root, pack);
    return { status: 0, written: [], current: [], conflicts: [], lines: [`pack:use: the ${pack} pack is already in use (${PACKS_RECORD}).${host.length > 0 ? '' : ' Nothing was written.'}`, ...host] };
  }
  const general = JSON.parse(fs.readFileSync(path.join(root, SEEDS_MANIFEST), 'utf8')).files;
  const written = [];
  const current = [];
  const conflicts = [];
  for (const [seed, twin] of seeds) {
    const twinPath = path.join(root, twin);
    const has = fs.existsSync(twinPath);
    const twinHash = has ? hashFile(twinPath) : null;
    if (twinHash === hashFile(path.join(root, seed)) || accepted.includes(twin)) current.push(twin);
    else if (twinHash === (general[twin] ?? null)) written.push([seed, twin]);
    else conflicts.push([seed, twin]);
  }
  if (conflicts.length > 0) {
    const toAccept = [...current.filter((twin) => accepted.includes(twin)), ...conflicts.map(([, twin]) => twin)];
    return {
      status: 1,
      written: [],
      current,
      conflicts: conflicts.map(([, twin]) => twin),
      lines: [
        ...conflicts.map(([seed, twin]) => `${twin}: you changed it. Merge by hand: the ${pack[0].toUpperCase()}${pack.slice(1)} version is ${seed}.`),
        `pack:use: ${conflicts.length} file(s) need a hand merge; nothing was written. Merge them, then run: npm run pack:use -- ${pack} ${toAccept.map((twin) => `--accept ${twin}`).join(' ')}`,
      ],
    };
  }
  for (const [seed, twin] of written) {
    fs.mkdirSync(path.dirname(path.join(root, twin)), { recursive: true });
    fs.copyFileSync(path.join(root, seed), path.join(root, twin));
  }
  fs.mkdirSync(path.dirname(recordPath), { recursive: true });
  fs.writeFileSync(recordPath, `${JSON.stringify({ packs: [...inUse, pack] }, null, 1)}\n`);
  const host = addHostPage(root, pack);
  if (written.length === 0) return { status: 0, written: [], current, conflicts: [], lines: [`pack:use: the ${pack} pack is on; its ${current.length} files were already in place. Recorded in ${PACKS_RECORD}.`, ...host] };
  return { status: 0, written: written.map(([, twin]) => twin), current, conflicts: [], lines: [`pack:use: the ${pack} pack is on (recorded in ${PACKS_RECORD}). Replaced ${written.length} file(s):`, ...written.map(([, twin]) => `  ${twin}`), ...host, 'Next: npm run verify:fast (the full npm run verify comes last).'] };
}

// realpath: the script must also run when its folder is reached through a link.
if (process.argv[1] && fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [pack, ...rest] = process.argv.slice(2);
  if (!pack) {
    console.error('pack:use: say which pack: npm run pack:use -- aras');
    process.exit(1);
  }
  const result = packUse(kitRoot, pack, rest.filter((_, index) => rest[index - 1] === '--accept'));
  (result.status === 0 ? console.log : console.error)(result.lines.join('\n'));
  process.exit(result.status);
}
