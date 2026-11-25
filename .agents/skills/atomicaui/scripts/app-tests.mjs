// The app's own tests, as `npm run check` runs them at its end: the test files under src/app and src/screens.
// They take seconds (scripts/unit-tests.json keeps the kit's own script tests out of an app), and `npm run check` is the command every run
// reaches for: a red test of the app, or of a copied recipe, is named there and not first in the full verify.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import os from 'node:os';
import path from 'node:path';

/** The folders an app owns that hold tests (AGENTS.md, "Yours"). */
export const APP_TEST_FOLDERS = ['src/app', 'src/screens'];

/** The test files `npm run test` runs under those folders (vite.config.ts: *.test or *.spec, .ts or .tsx), from the root, with / between folders. */
export function appTestFiles(root) {
  return APP_TEST_FOLDERS.flatMap((folder) => {
    const dir = path.join(root, folder);
    if (!fs.existsSync(dir)) return [];
    return fs.readdirSync(dir, { withFileTypes: true, recursive: true })
      .filter((entry) => entry.isFile() && /\.(test|spec)\.tsx?$/.test(entry.name))
      .map((entry) => path.relative(root, path.join(entry.parentPath, entry.name)).split(path.sep).join('/'));
  }).sort();
}

/**
 * The failing tests of a vitest JSON report, each as "file > describe > test"; a file that could not be read at all (a syntax error, a missing import) is named alone.
 * `files`: the app's test files from its root (appTestFiles). The report names a file by its full path, which is matched by its end:
 * the two can spell the folders above the app differently (a link, a short Windows name).
 */
export function failedTests(report, files) {
  return (report?.testResults ?? []).flatMap((file) => {
    const full = file.name.split(path.sep).join('/');
    const name = files.find((one) => full.endsWith(`/${one}`)) ?? full;
    const failed = (file.assertionResults ?? []).filter((test) => test.status === 'failed').map((test) => [name, ...(test.ancestorTitles ?? []), test.title].join(' > '));
    return failed.length === 0 && file.status === 'failed' ? [name] : failed;
  });
}

/**
 * Runs them with the installed vitest, started by node itself (no npm, no shell: the same line on every system).
 * Returns { files, status, failed, output }: `status` 0 when every test passed or there is no test file (then nothing is started);
 * `failed` names each failing test, read from vitest's JSON report, so the caller's last line can name them: what vitest prints for
 * one failing test can be a thousand lines long; `output` only with stdio 'pipe' (a test reads it; the command shows vitest's own lines as they come).
 * AUI_MAINTAIN_KIT is taken out of the run: with it the two folder names would also match the kit's sample under kit/samples.
 */
export function runAppTests(root, { stdio = 'inherit' } = {}) {
  const files = appTestFiles(root);
  if (files.length === 0) return { files, status: 0, failed: [], output: '' };
  const manifest = createRequire(import.meta.url).resolve('vitest/package.json');
  const vitest = path.join(path.dirname(manifest), JSON.parse(fs.readFileSync(manifest, 'utf8')).bin.vitest);
  const env = { ...process.env };
  delete env.AUI_MAINTAIN_KIT;
  const folder = fs.mkdtempSync(path.join(os.tmpdir(), 'aui-check-tests-'));
  const reportFile = path.join(folder, 'report.json');
  try {
    const result = spawnSync(process.execPath, [vitest, 'run', '--reporter=default', '--reporter=json', `--outputFile.json=${reportFile}`, ...APP_TEST_FOLDERS], { cwd: root, stdio, encoding: 'utf8', env });
    const report = fs.existsSync(reportFile) ? JSON.parse(fs.readFileSync(reportFile, 'utf8')) : undefined;
    return { files, status: result.status ?? 1, failed: failedTests(report, files), output: `${result.stdout ?? ''}${result.stderr ?? ''}` };
  } finally {
    fs.rmSync(folder, { recursive: true, force: true });
  }
}
