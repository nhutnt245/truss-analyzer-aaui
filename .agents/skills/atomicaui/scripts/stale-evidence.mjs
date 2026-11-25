// A look is only as new as the page it was taken of. These helpers find the files of a page that changed after the last measurement
// (evidence/measure.json from check:layout, evidence/standard-measure.json from check-standard --url), so a check can fail
// "re-run and open the pictures" instead of letting a message say "looked at it after my last edit" about an older page.
import fs from 'node:fs';

/** The time of the newest measurement among the files that exist, or undefined when there is none. */
export function measuredAt(measurements) {
  const times = measurements.filter((file) => fs.existsSync(file)).map((file) => fs.statSync(file).mtimeMs);
  return times.length === 0 ? undefined : Math.max(...times);
}

/** The files (that exist) changed after the newest measurement. No measurement: nothing is stale, there is nothing to be older than. */
export function staleFiles(files, measurements) {
  const at = measuredAt(measurements);
  return at === undefined ? [] : files.filter((file) => fs.existsSync(file) && fs.statSync(file).mtimeMs > at);
}

/** The sentence every check says: what changed, and what to do. */
export function staleMessage(who, files, measurement, rerun) {
  return `${who}: STALE. ${files.length} file(s) of the page changed after the last measurement (${measurement}): ${files.slice(0, 5).join(', ')}${files.length > 5 ? ` and ${files.length - 5} more` : ''}. The pictures show the page as it was. ${rerun}, open the new pictures, and claim no look until then.`;
}
