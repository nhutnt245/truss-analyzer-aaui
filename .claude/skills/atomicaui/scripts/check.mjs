// `npm run check`: the mechanical part of the kit rules, then the app's own tests (src/app and src/screens; scripts/app-tests.mjs).
// Fails with the rule number and the fix, or with the failing test as vitest names it. The tests run only when the rules hold.
// It cannot judge UX quality, made-up UI or behaviour: the done checklist (a filled copy of kit/checklist.md) covers those.
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import { APP_TEST_FOLDERS, runAppTests } from './app-tests.mjs';
import { formatProblem, runChecks, styledPieces, walk } from './check-rules.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const problems = runChecks(root);
// Styled pieces: the looks outside the usage profile are listed, never failed. Each is removed, or explained on the evidence sheet.
const sources = fs.existsSync(path.join(root, 'src')) ? walk(path.join(root, 'src'), (file) => /\.[jt]sx$/.test(file), root).map((file) => file.split(path.sep).join('/')) : [];
const pieces = styledPieces(root, sources);
const notes = pieces.length === 0 ? '' : `\nStyled pieces: ${pieces.map((piece) => `${piece.name} (${piece.file})`).join(', ')}.${pieces.flatMap((piece) => piece.outside.map((look) => `\n  Not a look our apps use: ${look} in ${piece.file}. Remove it, or give the reason on the evidence sheet (kit/style/proof.md).`)).join('')}\n  Each styled piece needs its evidence sheet: npm run verify:page writes evidence/styled-<name>.md and fails until every "(you)" line is filled and no view says NOT MEASURED. If no listed view can show a transient state, fill the sheet's Not measured (you) reason; keep its marker and sheet.`;
if (problems.length > 0) {
  console.error(problems.map(formatProblem).join('\n\n'));
  console.error(`\ncheck: ${problems.length} problem(s). Fix them, then run \`npm run check\` again. The tests of ${APP_TEST_FOLDERS.join(' and ')} were NOT RUN: they run when the rules hold.${notes}`);
  process.exit(1);
}
if (notes) console.log(notes.trimStart());
const folders = APP_TEST_FOLDERS.join(' and ');
const tests = runAppTests(root);
if (tests.status !== 0) {
  // The failing tests are named in this last line too: what vitest prints above for one of them can be very long.
  const names = tests.failed.length > 0 ? `: ${tests.failed.slice(0, 10).join('; ')}${tests.failed.length > 10 ? `; and ${tests.failed.length - 10} more` : ''}` : '';
  console.error(`\ncheck: ${tests.failed.length || 1} problem(s): the tests of ${folders} fail${names}. What each expected is in the lines above (one file alone: \`npm run test -- <its path>\`). The rules hold. Fix the screen, or the test where the spec changed what the screen shows (a test under src/screens is yours, also one copied with a recipe), then run \`npm run check\` again.`);
  process.exit(1);
}
const tested = tests.files.length > 0 ? `The rules hold and the tests of ${folders} pass (${tests.files.length} test file(s)).` : `The rules hold. NOT CHECKED: no test file in ${folders}, so no test ran.`;
console.log(`check: ok. ${tested} Next: the rest of the page-only run while you fix (\`npm run verify:page\`; AUI-12 in kit/rules.md), paste each result line before you claim anything (a check you did not run is "not run"), write your final message and fill a copy of kit/checklist.md, then \`npm run verify\` once, last (lint, typecheck, test, build, layout and tokens, styled sheets, and the browser tests), and add its last lines to both. Wait for it: never end a turn while a command you started still runs.`);
