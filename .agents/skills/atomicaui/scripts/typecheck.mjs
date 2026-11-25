// Node starts the compiler itself, from the kit's own node_modules: no npx and no shell, so the same line runs on Windows and macOS.
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';

const tsc = createRequire(import.meta.url).resolve('typescript/bin/tsc');
const run = spawnSync(process.execPath, [tsc, '--noEmit', '--pretty', 'false'], { encoding: 'utf8' });
if (run.error) {
  console.error(`typecheck: could not run tsc (${run.error.message}).`);
  process.exit(1);
}
const errors = `${run.stdout}${run.stderr}`.split('\n').filter((line) => /error TS\d+/.test(line));
const ignoredDiagnostic = (line) => {
  const file = line.match(/^(.+?)(?:\(\d+,\d+\))?: error TS\d+/)?.[1]?.replaceAll('\\', '/');
  return file?.startsWith('src/vendor/') || (file?.startsWith('src/data/legacy/') && /\.[jt]s$/.test(file));
};
const own = errors.filter((line) => !ignoredDiagnostic(line));
if (run.status !== 0 && errors.length === 0) {
  console.error(`${run.stdout}${run.stderr}`);
  console.error(`typecheck: tsc exited with status ${run.status} and reported no errors.`);
  process.exit(1);
}
if (own.length > 0) {
  console.error(own.join('\n'));
  console.error(`\ntypecheck: ${own.length} error(s) in app code.`);
  process.exit(1);
}
console.log(`typecheck: ok (${errors.length} known error(s) inside the read-only vendored library or copied legacy logic were ignored).`);
