// Which files belong to the kit (read-only in an app) and how they are hashed. Used by the check and by kit-seal.
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

export const KIT_MANIFEST = 'kit/KIT.json';
/** The manifest of the general starter's seed files: what each app file that a pack replaces looked like when the kit was sealed. */
export const SEEDS_MANIFEST = 'kit/SEEDS.json';
/** Kit-owned: single files, and folders (everything under them). App-owned is everything else. */
export const KIT_OWNED = ['AGENTS.md', 'CLAUDE.md', 'install.mjs', 'kit/', 'scripts/', 'src/recipes/', 'src/packs/', 'src/gallery/', 'src/standard/'];

/**
 * What building or setting up a sample project leaves behind: compiled output, and the aui/ folder standard-copy writes.
 * Never sealed, never packed: it differs from machine to machine. Only under kit/samples/ (also the legacy samples, and the folder of a restyled reference beside its legacy page).
 */
export const isSampleOutput = (file) => /^kit\/samples\/(?:legacy\/)?[^/]+\/(?:reference\/)?(bin|obj|aui|wwwroot\/aui)(\/|$)/.test(file);

export const isKitOwned = (file) => file !== KIT_MANIFEST && KIT_OWNED.some((owned) => (owned.endsWith('/') ? file.startsWith(owned) : file === owned));

/** Line endings are normalised so a Windows checkout hashes the same. */
export const hashFile = (full) => createHash('sha256').update(fs.readFileSync(full, 'utf8').replace(/\r\n/g, '\n')).digest('hex');

export function listKitFiles(root) {
  const found = [];
  const visit = (relative) => {
    const full = path.join(root, relative);
    if (!fs.existsSync(full)) return;
    if (fs.statSync(full).isDirectory()) {
      for (const name of fs.readdirSync(full).sort()) {
        if (name === 'node_modules' || name === '.DS_Store') continue;
        if (isSampleOutput(`${relative.replace(/\/$/, '')}/${name}`)) continue;
        visit(`${relative.replace(/\/$/, '')}/${name}`);
      }
    } else if (isKitOwned(relative)) {
      found.push(relative);
    }
  };
  for (const owned of KIT_OWNED) visit(owned.replace(/\/$/, ''));
  return found.sort();
}

/** Where a pack keeps its seeds: the app files the pack replaces when the app turns the pack on. Each seed is the app file's name plus `.seed`. */
export const seedDir = (pack) => `src/packs/${pack}/seed`;
/** The app file a seed replaces (its twin): app/, screens/ and data/ live under src/, main.tsx is src/main.tsx, the rest is at the root. */
export const twinOf = (relative) => (/^(app|screens|data)\//.test(relative) ? `src/${relative}` : relative === 'main.tsx' ? 'src/main.tsx' : relative);
/** The seed files of a pack: [seed path, twin path] pairs, sorted. */
export function listSeeds(root, pack) {
  const base = path.join(root, seedDir(pack));
  const found = [];
  const visit = (relative) => {
    const full = path.join(base, relative);
    if (fs.statSync(full).isDirectory()) {
      for (const name of fs.readdirSync(full).sort()) visit(relative ? `${relative}/${name}` : name);
    } else if (relative.endsWith('.seed')) {
      found.push([`${seedDir(pack)}/${relative}`, twinOf(relative.slice(0, -'.seed'.length))]);
    }
  };
  if (fs.existsSync(base)) visit('');
  return found;
}

/**
 * The lines of GAPS.md the kit ships (every "- " line), as { start, sha256 }: kit-seal records them in kit/KIT.json and the check
 * fails an app whose GAPS.md lost one (it only grows: one line added per gap, the file never rewritten). Line endings and edge spaces do not count.
 */
export const gapLines = (text) => text.split('\n').map((line) => line.trim()).filter((line) => line.startsWith('- ')).map((line) => ({ start: line.slice(0, 80), sha256: createHash('sha256').update(line).digest('hex') }));
