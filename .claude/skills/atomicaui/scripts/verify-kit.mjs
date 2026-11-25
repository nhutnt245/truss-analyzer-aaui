// `npm run verify:kit`: the checks of the kit itself that an app's `npm run verify` leaves out, for an app that changed its packages or public/fonts (kit/paths/update.md).
// It runs the checks of the kit's own pages and the nine browser test files that test the kit's own check scripts (the `kit` list of scripts/browser-tests.json), one step at a time, stopping at the first that fails.
// It sets AUI_MAINTAIN_KIT for its steps itself, so the same line runs in every shell. It does not run the kit's own unit tests (the `kit` list of scripts/unit-tests.json; the kit's CI runs them): the kit's assertions about its repository (MAINTAINING.md) are among them, and they are not an app's.
// Last line: `verify:kit: ok` or `verify:kit: FAILED at step N of 3 (the command)`. Exit code: 0 ok, 1 failed.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { duration } from './verify.mjs';

const { kit } = JSON.parse(fs.readFileSync(new URL('./browser-tests.json', import.meta.url), 'utf8'));

function main() {
  const steps = ['npm run check:standard', 'npm run check:behaviour', `npm run test:browser -- ${kit.join(' ')}`];
  const started = Date.now();
  const time = () => duration((Date.now() - started) / 1000);
  for (const [index, command] of steps.entries()) {
    console.log(`verify:kit: step ${index + 1} of ${steps.length}: ${command}`);
    const { status } = spawnSync(command, { shell: true, stdio: 'inherit', env: { ...process.env, AUI_MAINTAIN_KIT: '1' } });
    if (status !== 0) {
      console.log(`verify:kit: FAILED at step ${index + 1} of ${steps.length} (${command}) after ${time()}. Fix what it names, then run npm run verify:kit again.`);
      return 1;
    }
  }
  console.log(`verify:kit: ok. ${steps.length} steps in ${time()}: the kit's own pages and its ${kit.length} browser test files. This is not the full verify of your app: npm run verify is.`);
  return 0;
}

if (process.argv[1] && fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = main();
}
