// `node scripts/serve-folder.mjs <folder>`: shows a folder of plain files (HTML, CSS, JavaScript) at a local address, for the checks that need a running page.
// Node only, so it works the same on Windows and macOS. It listens on 127.0.0.1 only, on a port the system picks, until you press Ctrl+C.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { serveFolder } from './standard-lib.mjs';

// realpath: the script must also run when its folder is reached through a link.
if (process.argv[1] && fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const folder = process.argv[2];
  if (!folder || !fs.existsSync(folder) || !fs.statSync(folder).isDirectory()) {
    console.error('serve-folder: give the folder that holds your page, for example: node scripts/serve-folder.mjs my-page');
    process.exit(1);
  }
  const server = await serveFolder(path.resolve(folder));
  console.log(`serve-folder: ${path.resolve(folder)} is at ${server.base}index.html (press Ctrl+C to stop)`);
}
