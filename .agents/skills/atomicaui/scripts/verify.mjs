// `npm run verify`: the kit's checks, one step at a time, stopping at the first that fails.
//   npm run verify              everything an app needs, the slow browser tests last: the app's unit tests and its six browser test files (the kit's own checks, its own unit tests and nine kit-only browser test files run only with AUI_MAINTAIN_KIT=1, as the kit's CI does)
//   npm run verify:fast         everything but the browser tests (a few minutes): not the full verify, it says so
//   npm run verify:page [Name]  the page-only run: check, lint, typecheck, unit tests, layout and tokens, styled evidence sheets (Name narrows lint to the screen, its routing and src/data, and tests to the screen)
//   --limit <minutes>           (or AUI_VERIFY_LIMIT) the longest one step may run; default 30. Under 5 it is refused before step 1: one step alone can take longer, so such a run could only end TIMED OUT
// Each step prints a line first, one more every minute while it runs, so a quiet step is not a stalled one, and one when it ends with its time. The same lines go to verify.log (git ignores it; `npm run evidence` empties evidence/, so it is not kept there). The time of every step is listed again just above the last line, which says ok, FAILED, TIMED OUT or STOPPED.
// Exit code: 0 ok, 1 failed (a check found a problem) or not run (a limit under 5 minutes, a screen folder that does not exist), 124 timed out (a step ran past its limit: it did not finish; read what it printed above), 129, 130 or 143 stopped by a signal.
// A step that hits a load timeout of the machine ("Timeout waiting for worker", "Timed out waiting for Page", "a page did not load within") is run again, twice at most: probably a busy machine.
// On macOS and Linux each step runs in its own process group, so a timeout ends it with all it started. A SIGKILL sent to verify's own group does not reach the step and can leave it running: stop verify with SIGTERM (it ends the step) or kill its whole process tree.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const DEFAULT_LIMIT = 30;
/** The shortest limit a run takes, in minutes: a step (the tests, the layout check, the browser tests) can take minutes on a busy machine. */
export const MIN_LIMIT = 5;
export const TIMED_OUT = 124;
export const TRIES = 3;
/** What a busy machine prints when a browser or a test worker misses its wait. */
export const LOAD_TIMEOUT = /Timeout waiting for worker to respond|Timeout starting \w+ runner|Timed out waiting for Page|a page did not load within \d+ seconds/;
const NAMES = { full: 'verify', fast: 'verify:fast', page: 'verify:page' };

/** Last step of the page-only run, and the one after the layout check of the full run: a styled piece whose evidence sheet still has an unfilled line marked "(you)", or that no view measured and whose sheet gives no reason, ends the run here (no styled piece: nothing to do). */
const STYLED_SHEETS = { command: 'node scripts/styled-evidence.mjs --check', note: 'writes evidence/styled-<name>.md for each styled piece and fails while a sheet has an unfilled line marked "(you)"; NOT MEASURED needs a reason why no listed view can show the state' };

/** The layout step of the page-only run and of the full run, the same command in both: a page-only run that is green on spacing cannot hide a token finding the full run would stop at. */
const LAYOUT = { command: 'npm run check:layout -- --tokens', note: 'opens every view once in a private browser, for the spacing check and the token check; a minute or more' };

const ARAS_LAYOUT = 'npm run check:layout -- --views kit/packs/aras/evidence.views.json --out evidence/packs-aras --if-app-imports @/packs/aras/Demo';

/** Whether a screen folder holds a test file `npm run test` would run (vite.config.ts: src/**\/*.{test,spec}.{ts,tsx}). */
export function hasTests(folder) {
  return fs.readdirSync(folder, { withFileTypes: true, recursive: true }).some((entry) => entry.isFile() && /\.(test|spec)\.tsx?$/.test(entry.name));
}

/** What a page-only run says of a named screen whose folder holds no test file: its test step passes with nothing run, and the run says so. */
export const notChecked = (screen) => `NOT CHECKED: no test file for ${screen}`;

/**
 * The steps of a mode, in order. `note` tells a reader what a quiet step is doing. `env`: AUI_MAINTAIN_KIT adds the checks of the kit's own pages (the kit's CI and a maintainer set it; MAINTAINING.md).
 * `untested`: the named screen of a page-only run has no test file (hasTests).
 */
export function plan(mode, screen, env = process.env, untested = false) {
  if (mode === 'page') {
    return [
      { command: 'npm run check' },
      { command: screen ? `npx eslint --no-error-on-unmatched-pattern src/screens/${screen} src/screens/index.ts src/app src/data` : 'npm run lint' },
      { command: 'npm run typecheck' },
      screen
        ? { command: `npm run test -- --passWithNoTests src/screens/${screen}`, ...(untested ? { note: `${notChecked(screen)}: src/screens/${screen} holds no *.test.tsx, so this step passes with nothing run` } : {}) }
        : { command: 'npm run test' },
      LAYOUT,
      STYLED_SHEETS,
    ];
  }
  const maintain = Boolean(env.AUI_MAINTAIN_KIT);
  const steps = [
    { command: 'npm run check' },
    { command: 'npm run lint' },
    { command: 'npm run typecheck' },
    { command: 'npm run test' },
    { command: 'npm run build' },
    LAYOUT,
    STYLED_SHEETS,
    { command: ARAS_LAYOUT },
    // These two check the kit's own pages, which an app cannot change: the kit's CI runs them.
    ...(maintain ? [{ command: 'npm run check:standard' }, { command: 'npm run check:behaviour' }] : []),
  ];
  if (mode === 'fast') return steps;
  return [...steps, { command: 'npm run test:browser', note: `the browser test files, one at a time, each starts a browser; each test prints a line as it ends; ${maintain ? 'ten minutes or more' : 'about two minutes'}, so do not stop it` }];
}

/** `how`: 'failed' (a check found a problem), 'timed-out' (a step ran past its limit) or 'stopped' (a signal ended the run). `screen`: the screen a page-only run was given. `untested`: that screen has no test file. */
export function summary(mode, steps, failed, seconds, { how = 'failed', limit = DEFAULT_LIMIT, screen, untested = false } = {}) {
  const time = `${Math.floor(seconds / 60)} min ${Math.round(seconds % 60)} s`;
  const name = NAMES[mode];
  if (failed && how === 'timed-out') {
    return `${name}: TIMED OUT at step ${steps.indexOf(failed) + 1} of ${steps.length} (${failed.command}) after ${limit} min in that step, ${time} in all. The step did not finish: read what it printed above. Run it alone (${failed.command}), or run this again with a longer limit (npm run ${name} --${screen ? ` ${screen}` : ''} --limit ${limit * 2}). Say "not finished" in your message, never "passed".`;
  }
  if (failed && how === 'stopped') {
    return `${name}: STOPPED at step ${steps.indexOf(failed) + 1} of ${steps.length} (${failed.command}) after ${time}: a signal ended the run. It did not finish: read what it printed above. Run it again. Say "not finished" in your message, never "passed".`;
  }
  if (failed) {
    const inPageRun = mode === 'page' || plan('page').some((step) => step.command === failed.command);
    const fix = inPageRun ? `Fix what it names with the page-only run (npm run verify:page${screen ? ` -- ${screen}` : ''})` : `Fix what it names, run that step alone (${failed.command}) until it passes`;
    return `${name}: FAILED at step ${steps.indexOf(failed) + 1} of ${steps.length} (${failed.command}) after ${time}. ${fix}, then run it again.`;
  }
  if (mode === 'fast') return `${name}: ok. ${steps.length} steps in ${time}. NOT RUN: npm run test:browser. This is not the full verify: run npm run verify last, after your final message.`;
  if (mode === 'page') return `${name}: ok. ${steps.length} steps in ${time}.${untested && screen ? ` ${notChecked(screen)} (the test step ran nothing).` : ''} This is the page-only run, not the full verify: it says nothing about the rest of the app.`;
  return `${name}: ok. ${steps.length} steps in ${time}, the browser tests included.`;
}

/** 4.4 s under a minute, 3 min 12 s above it. */
export function duration(seconds) {
  if (Math.round(seconds * 10) / 10 < 60) return `${seconds.toFixed(1)} s`;
  const whole = Math.round(seconds);
  return `${Math.floor(whole / 60)} min ${whole % 60} s`;
}

/** The time of each step that ran, one line each, to print above the last line. `times[i]` is the seconds step i took (all its tries), or undefined when it did not run. */
export function timeLines(name, steps, times) {
  const ran = steps.map((step, index) => ({ step, index, seconds: times[index] })).filter((one) => one.seconds !== undefined);
  return [`${name}: time per step:`, ...ran.map(({ step, index, seconds }) => `${name}:   ${String(index + 1).padStart(2)}. ${duration(seconds).padStart(9)}  ${step.command}`)];
}

/** The line printed every minute: where the run is, and the last thing the step printed. */
export function beatLine(index, total, command, stepMs, totalMs, last) {
  const minutes = (ms) => Math.max(1, Math.round(ms / 60000));
  return `verify: step ${index + 1} of ${total} (${command}) is still running: ${minutes(stepMs)} min in this step, ${minutes(totalMs)} min in all.${last ? ` Last output: ${last}` : ''}`;
}

/** `--limit 45` or AUI_VERIFY_LIMIT, in minutes. */
export function limitMinutes(argv, env = process.env) {
  const at = argv.indexOf('--limit');
  const given = at < 0 ? env.AUI_VERIFY_LIMIT : argv[at + 1];
  const minutes = Number(given);
  return given !== undefined && Number.isFinite(minutes) && minutes > 0 ? minutes : DEFAULT_LIMIT;
}

/**
 * The line that refuses a limit under MIN_LIMIT, or undefined when the run may start. A run with a 1-minute limit timed out at the test step,
 * twice, and never reached the layout check: it was told "timed out" where the fault was the limit it gave.
 * AUI_VERIFY_TEST_LIMIT lets a shorter limit through: only the kit's own test of the time limit sets it (scripts/verify.test.mjs).
 */
export function limitRefusal(name, minutes, env = process.env) {
  if (minutes >= MIN_LIMIT || env.AUI_VERIFY_TEST_LIMIT) return undefined;
  return `${name}: NOT RUN. A limit of ${minutes} min (--limit or AUI_VERIFY_LIMIT) is refused: the limit is the longest one step may run, and one step (the tests, the layout check, the browser tests) can take minutes, longer on a busy machine, so a limit under ${MIN_LIMIT} minutes ends TIMED OUT with the steps after it not run. Give ${MIN_LIMIT} or more, or no limit (${DEFAULT_LIMIT} minutes a step). A tool that stops a long command: start this run in the background and read verify.log again and again until its last line says ok, FAILED, TIMED OUT or STOPPED. Nothing was checked: say "not run" in your message, never "passed".`;
}

/** Ends the command and what it started: with taskkill on Windows, elsewhere through its own process group. */
function stop(child) {
  if (process.platform === 'win32') {
    spawn('taskkill', ['/pid', String(child.pid), '/T', '/F'], { stdio: 'ignore' });
    return;
  }
  try {
    process.kill(-child.pid, 'SIGKILL');
  } catch {
    child.kill('SIGKILL');
  }
}

/** Runs one command. Resolves { code, timedOut, tail }; tail is the end of what it printed, for the load-timeout test. */
export function run(command, write, { limitMs, beat, current = {}, beatMs = 60000 }) {
  return new Promise((resolve) => {
    const child = spawn(command, { shell: true, stdio: ['ignore', 'pipe', 'pipe'], detached: process.platform !== 'win32' });
    current.child = child;
    let tail = '';
    let last = '';
    let timedOut = false;
    const note = (chunk) => {
      const text = chunk.toString();
      tail = (tail + text).slice(-20000);
      const line = text.split(/\r?\n/).map((one) => one.trim()).filter(Boolean).at(-1);
      if (line) last = line.slice(0, 120);
    };
    child.stdout.on('data', (chunk) => { note(chunk); write(chunk, process.stdout); });
    child.stderr.on('data', (chunk) => { note(chunk); write(chunk, process.stderr); });
    const started = Date.now();
    const timer = setInterval(() => {
      if (Date.now() - started >= limitMs) {
        timedOut = true;
        stop(child);
      } else {
        beat(Date.now() - started, last);
      }
    }, Math.min(beatMs, limitMs));
    const done = (code) => {
      clearInterval(timer);
      current.child = undefined;
      resolve({ code, timedOut, tail });
    };
    child.on('error', () => done(1));
    child.on('close', (code) => done(code ?? 1));
  });
}

async function main(argv) {
  const mode = argv.includes('--fast') ? 'fast' : argv.includes('--page') ? 'page' : 'full';
  const limit = limitMinutes(argv);
  const refusal = limitRefusal(NAMES[mode], limit);
  if (refusal) {
    // Also the only line of verify.log: a reader of the log must not find the last line of an earlier run there.
    console.error(refusal);
    fs.writeFileSync('verify.log', `${refusal}\n`);
    return 1;
  }
  const screen = mode === 'page' ? argv.filter((arg, index) => !arg.startsWith('--') && argv[index - 1] !== '--limit')[0] : undefined;
  if (screen && !fs.existsSync(path.join('src', 'screens', screen))) {
    console.error(`verify:page: there is no folder src/screens/${screen}. Give the name of your screen folder, or no name for all of them.`);
    return 1;
  }
  const untested = Boolean(screen) && !hasTests(path.join('src', 'screens', screen));
  const steps = plan(mode, screen, process.env, untested);
  const maintain = Boolean(process.env.AUI_MAINTAIN_KIT);
  const times = [];
  const logFile = 'verify.log';
  fs.writeFileSync(logFile, '');
  const write = (chunk, stream) => {
    stream.write(chunk);
    fs.appendFileSync(logFile, chunk);
  };
  const say = (line) => write(`${line}\n`, process.stdout);
  const started = Date.now();
  const seconds = () => (Date.now() - started) / 1000;
  const current = { index: 0, child: undefined, stepStarted: undefined };
  // The time of the step that is running (all its tries) is kept when it ends, and every step's time is listed above the last line.
  const endStep = () => {
    if (current.stepStarted) times[current.index] = (Date.now() - current.stepStarted) / 1000;
    current.stepStarted = undefined;
  };
  const sayTimes = () => {
    for (const line of timeLines(NAMES[mode], steps, times)) say(line);
  };
  // A watchdog or Ctrl-C ends this run: the log still gets a last line that says it did not finish.
  for (const [signal, code] of [['SIGINT', 130], ['SIGTERM', 143], ['SIGHUP', 129]]) {
    process.on(signal, () => {
      if (current.child) stop(current.child);
      endStep();
      sayTimes();
      say(summary(mode, steps, steps[current.index], seconds(), { how: 'stopped' }));
      process.exit(code);
    });
  }
  if (mode === 'full') say(`verify: the full run takes ${maintain ? 'about 15 minutes' : 'about 5 minutes'} on a fast machine, longer on a busy one. Before it: the page-only run (npm run verify:page) is green, and your final message and checklist are written, saying "full verify not finished". Wait for its last line (in the foreground, or read verify.log again and again): never end your turn while it runs. After it: put its last line in both, then send the message.`);
  for (const [index, step] of steps.entries()) {
    current.index = index;
    current.stepStarted = Date.now();
    for (let attempt = 1; ; attempt += 1) {
      const tryStarted = Date.now();
      say(`verify: step ${index + 1} of ${steps.length}: ${step.command}${step.note ? ` (${step.note})` : ''}${attempt > 1 ? ` (try ${attempt} of ${TRIES})` : ''}`);
      const beat = (stepMs, last) => say(beatLine(index, steps.length, step.command, stepMs, Date.now() - started, last));
      const { code, timedOut, tail } = await run(step.command, write, { limitMs: limit * 60000, beat, current });
      if (timedOut) {
        endStep();
        sayTimes();
        say(summary(mode, steps, step, seconds(), { how: 'timed-out', limit, screen }));
        return TIMED_OUT;
      }
      if (code === 0) {
        endStep();
        say(`verify: step ${index + 1} of ${steps.length} done in ${duration(times[index])}: ${step.command}`);
        break;
      }
      if (attempt < TRIES && LOAD_TIMEOUT.test(tail)) {
        say(`verify: step ${index + 1} of ${steps.length} hit a load timeout after ${Math.round((Date.now() - tryStarted) / 1000)} s: probably a busy machine; running it again.`);
        continue;
      }
      endStep();
      sayTimes();
      say(summary(mode, steps, step, seconds(), { screen }));
      return 1;
    }
  }
  sayTimes();
  say(summary(mode, steps, undefined, seconds(), { screen, untested }));
  return 0;
}

if (process.argv[1] && fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = await main(process.argv.slice(2));
}
