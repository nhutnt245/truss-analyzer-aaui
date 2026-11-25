// The rules of `npm run check`, as pure functions so they can be tested.
// Every problem is { rule, file, line, message, fix }. Rule ids match kit/rules.md.
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { GLOBAL_KIT_ID, inspectPage } from './icon-kit.mjs';
import { KIT_MANIFEST, gapLines, hashFile, isKitOwned, isSampleOutput, listKitFiles } from './kit-files.mjs';
import { lookDeclarations } from './standard-rules.mjs';
import { checkPiece, gapNames, loadProfile, outsideProfile } from './styled-rules.mjs';
import { collectConstants, readSource } from './styled-source.mjs';

export const VENDOR_DIR = 'src/vendor/atomic-aui';
export const LIBRARY_ENTRY = '@/vendor/atomic-aui';

/** Bare imports app code may use. Everything else is another UI or utility library: ask before adding one. */
export const ALLOWED_PACKAGES = new Set([
  'react',
  'react/jsx-runtime',
  'react-dom',
  'react-dom/client',
  'vite',
  'vitest',
  '@vitejs/plugin-react',
  '@testing-library/react',
  '@testing-library/dom',
]);

/** Plain elements that are hand-built controls or tables. Use the AtomicAUI part instead. */
const CONTROL_TAGS = new Set(['button', 'input', 'select', 'textarea', 'option', 'dialog', 'table', 'thead', 'tbody', 'tfoot', 'tr', 'td', 'th', 'label']);
const LAYOUT_TAGS = new Set(['div']);
const INLINE_TEXT_TAGS = new Set(['span', 'label', 'strong', 'em', 'dt', 'dd', 'div', 'small']);
const SHAPE_CONTROLS = /(^|\.)(Button|IconButton|Input|Textarea|NumberField|Checkbox|SelectTrigger|Trigger|Tab|CloseButton|AddButton)$/;
const ICON_ONLY_PARTS = /(^|\.)(IconButton|CloseButton|AddButton)$/;

/** The square-intent profiles, read from the vendored library's single source (SQUARE_PROFILES). */
const SQUARE_PROFILES = (() => {
  const file = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', VENDOR_DIR, 'core/recipe/square-profile.ts');
  const source = ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true);
  const profiles = new Set();
  const find = (node) => {
    if (ts.isVariableDeclaration(node) && node.name.getText(source) === 'SQUARE_PROFILES') {
      const collect = (child) => {
        if (ts.isStringLiteral(child)) profiles.add(child.text);
        ts.forEachChild(child, collect);
      };
      collect(node.initializer);
    }
    ts.forEachChild(node, find);
  };
  find(source);
  return profiles;
})();

const HEX_COLOUR = /#[0-9a-fA-F]{3,8}\b/;
const FUNCTION_COLOUR = /\b(?:rgb|rgba|hsl|hsla|oklch|oklab)\(/;
const PIXEL_LENGTH = /(?<![\w.-])\d+(?:\.\d+)?px\b/;

/** The files of src/recipes/styled/ hold data-aui-styled pieces: copied into a screen folder, never imported (AUI-09). */
const STYLED_RECIPE_FILE = /^src\/recipes\/styled\//;

/** Panes: the blocks in src/recipes/layout are the only code that writes a pane or a panel group. */
const PANELS_TAGS = new Set(['Panels', 'Panels.Panel', 'Panels.ResizeHandle', 'Panels.Trigger', 'Panels.Content']);
// BODY_CARD_AUI is not listed: the search and item pages (recipes meant to be copied) put their own body card inside the Aras shell's pane.
const PANE_CONSTANTS = new Set(['PANE_AUI', 'PANE_PANEL_AUI', 'PANE_HEADER_AUI', 'PANE_HEADER_LABELLED_AUI', 'PANE_SCROLL_AUI', 'PANE_BODY_AUI', 'PANE_TAB_BODY_AUI']);
/** Kit code that may write panes: the blocks, the pack, the gallery that shows them, the class recipe cases. */
const writesPanes = (file) => ['src/recipes/', 'src/packs/', 'src/gallery/', 'src/standard/'].some((folder) => file.startsWith(folder));

const ALLOW = /check-allow:\s*(AUI-\d\d|KIT-\d\d)/g;

const isTestFile = (file) => /\.(test|spec)\.[cm]?[jt]sx?$/.test(file) || file.endsWith('test-setup.ts') || file.endsWith('test-utils.tsx');

/** A problem is accepted on purpose when its line, or the line above, carries `check-allow: <rule>`. */
function allowedRules(lineText) {
  return new Set([...lineText.matchAll(ALLOW)].map((match) => match[1]));
}

function problem(rule, file, line, message, fix) {
  return { rule, file, line, message, fix };
}

export function walk(dir, filter, root = dir) {
  const found = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (['node_modules', '.git', 'dist', 'coverage'].includes(entry.name)) continue;
      found.push(...walk(full, filter, root));
    } else if (filter(full)) {
      found.push(path.relative(root, full));
    }
  }
  return found;
}

const sha256 = (buffer) => createHash('sha256').update(buffer).digest('hex');

/** AUI-06: the vendored library must match the hashes in VENDOR.json. */
export function checkVendor(root) {
  const problems = [];
  const manifestPath = path.join(root, VENDOR_DIR, 'VENDOR.json');
  if (!fs.existsSync(manifestPath)) {
    return [problem('AUI-06', `${VENDOR_DIR}/VENDOR.json`, 1, 'VENDOR.json is missing.', 'Restore it with `git checkout -- src/vendor/atomic-aui`.')];
  }
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const listed = new Set();
  for (const entry of manifest.files) {
    const relative = `${VENDOR_DIR}/${entry.path}`;
    listed.add(relative);
    const full = path.join(root, relative);
    if (!fs.existsSync(full)) {
      problems.push(problem('AUI-06', relative, 1, 'Vendored library file is missing.', 'Restore it with `git checkout -- src/vendor/atomic-aui`.'));
    } else if (sha256(fs.readFileSync(full)) !== entry.sha256) {
      problems.push(problem('AUI-06', relative, 1, 'Vendored library file was edited.', 'Undo the edit with `git checkout -- <file>`. If the library lacks something, add a line to GAPS.md and leave a labelled placeholder.'));
    }
  }
  for (const relative of walk(path.join(root, VENDOR_DIR), () => true, root)) {
    const normal = relative.split(path.sep).join('/');
    if (!listed.has(normal) && normal !== `${VENDOR_DIR}/VENDOR.json`) {
      problems.push(problem('AUI-06', normal, 1, 'File added inside the vendored library.', 'Delete it. Put your own code under src/, outside src/vendor/.'));
    }
  }
  return problems;
}

/** AUI-06: the kit states the same AtomicAUI release as VENDOR.json (one source of truth: atomicauiRelease.version). */
export function checkReleaseStamp(root) {
  const manifestPath = path.join(root, VENDOR_DIR, 'VENDOR.json');
  if (!fs.existsSync(manifestPath)) return [];
  const version = JSON.parse(fs.readFileSync(manifestPath, 'utf8')).atomicauiRelease?.version;
  const fix = 'A maintainer re-stamps the kit (MAINTAINING.md); an app builder leaves kit files alone.';
  if (!version) return [problem('AUI-06', `${VENDOR_DIR}/VENDOR.json`, 1, 'VENDOR.json records no AtomicAUI release (atomicauiRelease.version).', fix)];
  const problems = [];
  const sealed = fs.existsSync(path.join(root, KIT_MANIFEST)) ? JSON.parse(fs.readFileSync(path.join(root, KIT_MANIFEST), 'utf8')).atomicaui : null;
  if (sealed !== null && sealed !== version) problems.push(problem('AUI-06', KIT_MANIFEST, 1, `The kit is sealed for AtomicAUI ${sealed}, the library is ${version}.`, 'A maintainer reseals the kit (MAINTAINING.md); an app builder leaves kit files alone.'));
  for (const file of ['AGENTS.md', 'kit/rules.md']) {
    const full = path.join(root, file);
    if (fs.existsSync(full) && !fs.readFileSync(full, 'utf8').includes(version)) problems.push(problem('AUI-06', file, 1, `It does not state the library's release, ${version}.`, fix));
  }
  return problems;
}

/** AUI-13: kit-owned files (kit/, AGENTS.md, scripts/, src/recipes/, src/packs/, src/gallery/, src/standard/) are read-only in an app. */
export function checkKit(root) {
  const manifestPath = path.join(root, KIT_MANIFEST);
  if (!fs.existsSync(manifestPath)) return [problem('AUI-13', KIT_MANIFEST, 1, 'The kit manifest is missing.', `Restore it with \`git checkout -- ${KIT_MANIFEST}\`.`)];
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const problems = [];
  const listed = new Set();
  // The fix depends on where the file is: a recipe is copied, a shared part or a guide is left alone.
  const fixFor = (file) => {
    const recipe = file.match(/^src\/(?:recipes|packs\/aras)\/(shell|search|item|form|table|overview)\/(?!FormField\.tsx$|types\.ts$)/)?.[1];
    // The page recipes of the core are copied by their own name; the Aras ones by aras/<name>. A form field and its types are shared parts: imported, never copied.
    const page = ['form', 'table', 'overview'].includes(recipe);
    const command = page ? recipe : `aras/${recipe}`;
    const switchImport = page ? ` Then import it from '@/screens' instead of '@/recipes/${recipe}'.` : '';
    const folder = file.startsWith('src/packs/') ? `src/packs/aras/${recipe}` : `src/recipes/${recipe}`;
    if (recipe && !fs.existsSync(path.join(root, 'src/screens', recipe))) {
      return `Keep your work and restore the recipe: 1. \`npm run screen:copy -- ${command}\` (copies the folder, with your change, to src/screens/${recipe}/). 2. \`git checkout -- ${folder}\`.${switchImport} Edit only the copy.`;
    }
    if (recipe) return `Move your change into src/screens/${recipe}/, then \`git checkout -- ${file}\`.${switchImport}`;
    if (file.startsWith('kit/standard/')) return `Undo it with \`git checkout -- ${file}\`. The stylesheet and the class recipes are generated from the library: never edit them. A look that is missing is a line in GAPS.md.`;
    if (file.startsWith('src/recipes/') || file.startsWith('src/packs/') || file.startsWith('src/gallery/') || file.startsWith('src/standard/')) return `Undo it with \`git checkout -- ${file}\`. Shared kit parts are imported as they are; one that does not fit is a line in GAPS.md.`;
    return `Undo it with \`git checkout -- ${file}\`. Kit guides describe the kit, not your app: never update them to match your screens. A fault in the kit is a line in GAPS.md. The done checklist is filled in a copy: CHECKLIST.md.`;
  };
  for (const entry of manifest.files) {
    listed.add(entry.path);
    const full = path.join(root, entry.path);
    if (!fs.existsSync(full)) {
      problems.push(problem('AUI-13', entry.path, 1, 'Kit file is missing.', `Restore it with \`git checkout -- ${entry.path}\`.`));
    } else if (hashFile(full) !== entry.sha256) {
      problems.push(problem('AUI-13', entry.path, 1, 'Kit file was edited. Kit files are read-only.', fixFor(entry.path)));
    }
  }
  for (const file of listKitFiles(root)) {
    if (!listed.has(file) && isKitOwned(file)) {
      problems.push(problem('AUI-13', file, 1, 'File added inside a kit folder.', `Move it to src/screens/<Name>/ (your screens live there), or delete it.`));
    }
  }
  return problems;
}

/**
 * AUI-12: GAPS.md only grows. It must still hold every line the kit shipped (kit/KIT.json `gaps`): a file written over with one line
 * hides the kit's own gaps and, before this check, made the kit's example pages fail `check-standard` for a reason that was not the screen.
 */
export function checkGapsKept(root) {
  const manifestPath = path.join(root, KIT_MANIFEST);
  const gapsFile = path.join(root, 'GAPS.md');
  if (!fs.existsSync(manifestPath)) return [];
  const shipped = JSON.parse(fs.readFileSync(manifestPath, 'utf8')).gaps;
  if (!Array.isArray(shipped) || shipped.length === 0) return [];
  const fix = 'GAPS.md only grows: add one line per gap, never rewrite the file. Put the lines back (`git diff GAPS.md` shows what went; `git show HEAD:GAPS.md` has the whole file) and keep yours below them.';
  if (!fs.existsSync(gapsFile)) return [problem('AUI-12', 'GAPS.md', 1, 'GAPS.md is missing: it holds the gaps the kit ships.', fix)];
  const have = new Set(gapLines(fs.readFileSync(gapsFile, 'utf8')).map((one) => one.sha256));
  const lost = shipped.filter((one) => !have.has(one.sha256));
  if (lost.length === 0) return [];
  return [problem('AUI-12', 'GAPS.md', 1, `GAPS.md lost ${lost.length} of the ${shipped.length} lines the kit ships (first: "${lost[0].start}").`, fix)];
}

const MARKER_IN_CODE = /data-aui-styled['"]?\s*[=:]\s*\{?\s*['"]([a-z][a-z0-9-]*)['"]/g;
const MARKER_FILES = /\.(?:[jt]sx?|html?|cshtml|razor)$/;
const MARKER_SKIPPED = new Set(['node_modules', '.git', 'dist', 'dist-skill', 'coverage', 'evidence', '_vaults', 'kit', 'conversion', 'verify.log']);

/** The styled pieces the code of an app and the starter carry: every data-aui-styled="<name>" in a source or markup file outside kit/ (the kit's pages only describe them). */
export function markerNames(root) {
  const names = new Set();
  const visit = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (MARKER_SKIPPED.has(entry.name)) continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) visit(full);
      else if (MARKER_FILES.test(entry.name)) {
        const text = fs.readFileSync(full, 'utf8');
        for (const match of text.matchAll(MARKER_IN_CODE)) names.add(match[1]);
        // A marker given through a constant (data-aui-styled={PIECE}) is read the way the piece check reads it.
        if (/\.[jt]sx$/.test(entry.name) && text.includes('data-aui-styled={')) for (const marker of readSource(full, text).markers) names.add(marker.name);
      }
    }
  };
  visit(root);
  return names;
}

/**
 * AUI-12: a "- Styled piece `name`" line in GAPS.md must name a piece that exists: some file carries data-aui-styled="name".
 * A line for a piece that was never built (or was removed) claims a stand-in the page does not have.
 */
export function checkGapPieces(root) {
  const gapsFile = path.join(root, 'GAPS.md');
  if (!fs.existsSync(gapsFile)) return [];
  const exists = markerNames(root);
  const problems = [];
  fs.readFileSync(gapsFile, 'utf8').split('\n').forEach((text, index) => {
    const name = text.match(/^\s*-\s*styled piece `([a-z][a-z0-9-]*)`/i)?.[1];
    if (name && !exists.has(name)) {
      problems.push(problem('AUI-12', 'GAPS.md', index + 1, `GAPS.md has a line for the styled piece "${name}", and no file carries data-aui-styled="${name}".`, 'Delete the line, or build the piece: it carries data-aui-styled="<name>" on its root (kit/style/start.md). A gap with no piece of its own is a line that does not start with "Styled piece".'));
    }
  });
  return problems;
}

/** What reads the Aras pack's data context: its data, or its search and item pages through the old addresses (src/recipes, until 0.5.0) or the new ones. */
const PACK_DATA_USERS = /^@\/(?:packs\/aras\/data(?:\/.*)?|(?:recipes|packs\/aras)\/(?:item(?:\/(?:ItemPage|RelationshipTab))?|search(?:\/SearchPage)?))$/;
const OWN_DATA_CONTEXT = 'src/data/DataContext.tsx';

/** The modules a file takes values from: its imports, re-exports and dynamic imports, without those that bring in types only. */
function valueImports(file, text) {
  const sourceFile = ts.createSourceFile(file, text, ts.ScriptTarget.ES2022, true, file.endsWith('x') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const typesOnly = (elements) => elements.length > 0 && elements.every((element) => element.isTypeOnly);
  const found = [];
  const visit = (node) => {
    if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
      const clause = node.importClause;
      const onlyTypes = clause && (clause.isTypeOnly || (!clause.name && clause.namedBindings && ts.isNamedImports(clause.namedBindings) && typesOnly(clause.namedBindings.elements)));
      if (!onlyTypes) found.push(node.moduleSpecifier.text);
    } else if (ts.isExportDeclaration(node) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
      if (!(node.isTypeOnly || (node.exportClause && ts.isNamedExports(node.exportClause) && typesOnly(node.exportClause.elements)))) found.push(node.moduleSpecifier.text);
    } else if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword && node.arguments[0] && ts.isStringLiteral(node.arguments[0])) {
      found.push(node.arguments[0].text);
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return found;
}

/** AUI-13: an app made from kit 0.3.x keeps its own data context in src/data/; the pack's search and item pages read the pack's, so they would fail at run time. */
export function checkPackData(root, files) {
  if (!fs.existsSync(path.join(root, OWN_DATA_CONTEXT))) return [];
  const importer = files.find((file) => /\.tsx?$/.test(file) && !isKitOwned(file) && valueImports(file, fs.readFileSync(path.join(root, file), 'utf8')).some((specifier) => PACK_DATA_USERS.test(specifier)));
  if (!importer) return [];
  return [
    problem(
      'AUI-13',
      OWN_DATA_CONTEXT,
      1,
      `The app keeps its own data context (kit 0.3.x), but ${importer} uses the Aras pack's data, directly or through its search or item page, which reads the pack's context: it fails at run time ("useData must be used inside <DataProvider>").`,
      "Use the pack's data (kit/packs/aras/start.md): copy src/packs/aras/seed/data/index.ts.seed over src/data/index.ts (keep your own createDataAdapter()), delete the other files of src/data/, and point imports of @/data/testing at @/packs/aras/data/testing and src/test-utils.tsx at src/packs/aras/testing.tsx.",
    ),
  ];
}

function lineOf(sourceFile, node) {
  return sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1;
}

/** Rules that need the syntax tree: AUI-01, 02, 03, 05, 06, 11. */
export function checkTypeScript(file, text) {
  const problems = [];
  const test = isTestFile(file);
  const fixture = file.startsWith('src/data/fixtures/') && file.endsWith('.ts');
  const lines = text.split('\n');
  const accepted = (rule, line) => allowedRules(`${lines[line - 2] ?? ''}\n${lines[line - 1] ?? ''}`).has(rule);
  const report = (rule, line, message, fix) => {
    if (!accepted(rule, line)) problems.push(problem(rule, file, line, message, fix));
  };
  const sourceFile = ts.createSourceFile(file, text, ts.ScriptTarget.ES2022, true, file.endsWith('x') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);

  const checkSpecifier = (node, specifier) => {
    const line = lineOf(sourceFile, node);
    const target = specifier.startsWith('.') ? path.posix.join(path.posix.dirname(file), specifier) : specifier.replace(/^@\//, 'src/');
    if (STYLED_RECIPE_FILE.test(target) && !isKitOwned(file) && !test) {
      const source = target.replace(/\.tsx?$/, '');
      const base = path.posix.basename(source);
      const piece = base.replace(/(?<=[a-z0-9])([A-Z])/g, '-$1').toLowerCase();
      report('AUI-09', line, `Import of "${specifier}": a styled piece from src/recipes/styled/ is copied into your screen folder, not imported.`, `Copy the one file beside your screen (\`cp ${source}.tsx src/screens/<Name>/${base}.tsx\`; Windows: \`Copy-Item\`) and import the copy. It keeps its data-aui-styled marker: add its line to GAPS.md (- Styled piece \`${piece}\`: <the part that is missing>; <screen>; <file>) and write its evidence sheet (node scripts/styled-evidence.mjs ${piece}). kit/style/examples/${piece}.md is its page.`);
      return;
    }
    if (specifier.startsWith('.') || specifier.startsWith('node:')) {
      if (specifier.includes('vendor/atomic-aui/')) {
        report('AUI-06', line, `Deep import "${specifier}" into the vendored library.`, `Import from "${LIBRARY_ENTRY}" only.`);
      }
      return;
    }
    if (specifier === LIBRARY_ENTRY || (specifier.startsWith('@/') && !specifier.startsWith(`${LIBRARY_ENTRY}/`))) return;
    if (specifier.startsWith(`${LIBRARY_ENTRY}/`)) {
      report('AUI-06', line, `Deep import "${specifier}" into the vendored library.`, `Import from "${LIBRARY_ENTRY}" only.`);
      return;
    }
    if (!ALLOWED_PACKAGES.has(specifier) && !(test && specifier.startsWith('vitest'))) {
      report('AUI-01', line, `Import of "${specifier}": another UI or utility library.`, `Use an AtomicAUI part from "${LIBRARY_ENTRY}". If none fits, add a line to GAPS.md and leave a labelled placeholder.`);
    }
  };

  const constants = new Map();
  const collectConstants = (node) => {
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.initializer && ts.isVariableDeclarationList(node.parent) && (node.parent.flags & ts.NodeFlags.Const)) {
      constants.set(node.name.text, node.initializer);
    }
    ts.forEachChild(node, collectConstants);
  };
  collectConstants(sourceFile);
  const setsShape = (expression, seen = new Set()) => {
    while (expression && (ts.isAsExpression(expression) || ts.isSatisfiesExpression(expression) || ts.isParenthesizedExpression(expression))) expression = expression.expression;
    if (!expression) return false;
    if (ts.isIdentifier(expression)) {
      if (seen.has(expression.text)) return false;
      seen.add(expression.text);
      return setsShape(constants.get(expression.text), seen);
    }
    return ts.isObjectLiteralExpression(expression) && expression.properties.some((property) => (ts.isPropertyAssignment(property) && property.name.getText(sourceFile) === 'shape')
      || (ts.isShorthandPropertyAssignment(property) && property.name.text === 'shape')
      || (ts.isSpreadAssignment(property) && setsShape(property.expression, seen)));
  };

  /** True when an aui expression is, or spreads, a pane constant: directly, through a constant of this file, or in either branch of a condition. */
  const usesPaneConstant = (expression, seen = new Set()) => {
    while (expression && (ts.isAsExpression(expression) || ts.isSatisfiesExpression(expression) || ts.isParenthesizedExpression(expression))) expression = expression.expression;
    if (!expression) return false;
    if (ts.isIdentifier(expression)) {
      if (PANE_CONSTANTS.has(expression.text)) return true;
      if (seen.has(expression.text)) return false;
      seen.add(expression.text);
      return usesPaneConstant(constants.get(expression.text), seen);
    }
    if (ts.isConditionalExpression(expression)) return usesPaneConstant(expression.whenTrue, seen) || usesPaneConstant(expression.whenFalse, seen);
    if (ts.isObjectLiteralExpression(expression)) return expression.properties.some((property) => ts.isSpreadAssignment(property) && usesPaneConstant(property.expression, seen));
    return false;
  };

  // AUI-09: a row of buttons ends with the main action (`ACTION_AUI`): Cancel and the other actions first, on the left. A row of an action
  // group (ActionRow, Dialog.Actions, AlertDialog.Actions) keeps the main action last; in any other row (a toolbar's Edit or Search comes first,
  // by design) the main action may not come before a dismiss button (Cancel, Discard, Close, Back). A fragment, and a button or fragment behind
  // `&&` or `? :`, is part of the row it sits in (each branch of `? :` is one way the row can be drawn), or a row of its own. FormPage, FormDialog
  // and FormActions draw their row from `actions`: an array written there or in a constant of this file, its spreads left out, has the entry
  // with `main: true` last.
  const BUTTON_TAGS = new Set(['Button', 'Dialog.Button', 'AlertDialog.Button']);
  const ACTION_GROUPS = new Set(['ActionRow', 'Dialog.Actions', 'AlertDialog.Actions']);
  const ACTION_LISTS = new Set(['FormPage', 'FormDialog', 'FormActions']);
  const reportNotLast = (node) => report('AUI-09', lineOf(sourceFile, node), 'The main action (ACTION_AUI) is not the last button of its row.', 'Cancel and the other actions first, the main action (Save, Submit, ...) last on the right, in page forms and dialogs alike (kit/components/button.md).');
  const isAnd = (node) => ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken;
  const isMain = (opening) => /\bACTION_AUI\b/.test(opening.attributes.properties.find((one) => ts.isJsxAttribute(one) && one.name.getText(sourceFile) === 'aui')?.getText(sourceFile) ?? '');
  const isDismiss = (opening) => {
    const parent = opening.parent;
    return ts.isJsxElement(parent) && /^(cancel|discard|close|back)$/i.test(parent.children.map((child) => (ts.isJsxText(child) ? child.text : '')).join('').trim());
  };
  // One way a row can be drawn, kept as what the rule reads: its first main action, whether any button or any dismiss button follows it, and
  // whether the row holds any button or dismiss button at all (for what comes before it). Rows that read the same are kept once.
  const NO_BUTTONS = { main: null, after: false, dismissAfter: false, any: false, anyDismiss: false };
  const drawnAfter = (before, next) => (before.main
    ? { ...before, after: before.after || next.any, dismissAfter: before.dismissAfter || next.anyDismiss, any: true, anyDismiss: before.anyDismiss || next.anyDismiss }
    : { ...next, any: before.any || next.any, anyDismiss: before.anyDismiss || next.anyDismiss });
  const keyOf = (row) => [row.main?.pos ?? '', row.after, row.dismissAfter, row.any, row.anyDismiss].join();
  /** The ways a list of children can draw its row: a button, the buttons of a fragment, `a && X` as X, and `c ? X : Y` as X or as Y. */
  const rowVariants = (children) => children.reduce((rows, child) => {
    const options = childVariants(child);
    const drawn = rows.flatMap((row) => options.map((option) => drawnAfter(row, option)));
    return [...new Map(drawn.map((row) => [keyOf(row), row])).values()];
  }, [NO_BUTTONS]);
  const childVariants = (child) => {
    while (child && (ts.isJsxExpression(child) || ts.isParenthesizedExpression(child))) child = child.expression;
    if (!child) return [NO_BUTTONS];
    if (isAnd(child)) return childVariants(child.right);
    if (ts.isConditionalExpression(child)) return [...childVariants(child.whenTrue), ...childVariants(child.whenFalse)];
    if (ts.isJsxFragment(child)) return rowVariants(child.children);
    const opening = ts.isJsxElement(child) ? child.openingElement : child;
    if (!ts.isJsxOpeningLikeElement(opening) || !BUTTON_TAGS.has(opening.tagName.getText(sourceFile))) return [NO_BUTTONS];
    return [{ main: isMain(opening) ? opening : null, after: false, dismissAfter: false, any: true, anyDismiss: isDismiss(opening) }];
  };
  /** True for a fragment that is part of the row of the element it sits in, directly or through a condition. */
  const inRow = (fragment) => {
    let parent = fragment.parent;
    while (ts.isJsxExpression(parent) || ts.isParenthesizedExpression(parent) || ts.isConditionalExpression(parent) || isAnd(parent)) parent = parent.parent;
    return ts.isJsxElement(parent) || ts.isJsxFragment(parent);
  };
  const checkButtonOrder = (node) => {
    if (ts.isJsxFragment(node) && inRow(node)) return;
    const group = ts.isJsxElement(node) && ACTION_GROUPS.has(node.openingElement.tagName.getText(sourceFile));
    const wrong = rowVariants(node.children).find((row) => row.main && (group ? row.after : row.dismissAfter));
    if (wrong) reportNotLast(wrong.main);
  };
  const isMainEntry = (entry) => ts.isObjectLiteralExpression(entry) && entry.properties.some((property) => ts.isPropertyAssignment(property) && property.name.getText(sourceFile) === 'main' && property.initializer.kind === ts.SyntaxKind.TrueKeyword);
  const unwrap = (expression) => {
    while (expression && (ts.isAsExpression(expression) || ts.isSatisfiesExpression(expression) || ts.isParenthesizedExpression(expression))) expression = expression.expression;
    return expression;
  };
  const checkActionList = (opening) => {
    if (!ACTION_LISTS.has(opening.tagName.getText(sourceFile))) return;
    const attribute = opening.attributes.properties.find((one) => ts.isJsxAttribute(one) && one.name.getText(sourceFile) === 'actions');
    let list = attribute?.initializer && ts.isJsxExpression(attribute.initializer) ? unwrap(attribute.initializer.expression) : undefined;
    if (list && ts.isIdentifier(list)) list = unwrap(constants.get(list.text));
    if (!list || !ts.isArrayLiteralExpression(list)) return;
    const entries = list.elements.filter((element) => !ts.isSpreadElement(element));
    const main = entries.findIndex(isMainEntry);
    if (main >= 0 && main < entries.length - 1) reportNotLast(opening);
  };

  const visit = (node) => {
    if (!test && (ts.isJsxElement(node) || ts.isJsxFragment(node))) checkButtonOrder(node);
    if (!test && ts.isJsxOpeningLikeElement(node)) checkActionList(node);
    if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
      checkSpecifier(node, node.moduleSpecifier.text);
    }
    if (!test && (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node))) {
      const tag = node.tagName.getText(sourceFile);
      const line = lineOf(sourceFile, node);
      if (!writesPanes(file) && PANELS_TAGS.has(tag)) {
        report('AUI-09', line, `<${tag}> written in a screen: a pane is the kit's block.`, 'Use `Panes`, `Pane` and `PaneGroup` from `@/recipes/layout` (kit/components/panes.md).');
      }
      if (!writesPanes(file) && tag === 'View') {
        const own = node.attributes.properties.find((property) => ts.isJsxAttribute(property) && property.name.getText(sourceFile) === 'aui');
        const expression = own?.initializer && ts.isJsxExpression(own.initializer) ? own.initializer.expression : undefined;
        if (usesPaneConstant(expression)) {
          report('AUI-09', line, 'A pane written by hand from its constants.', 'Use `<Pane>` and `<PaneBody>` (kit/components/panes.md), or `<PaneTabBody>` for a filling tab card (kit/components/tabs.md). A pane written by hand passes no pane check.');
        }
      }
      if (CONTROL_TAGS.has(tag)) {
        report('AUI-01', line, `Hand-built <${tag}>.`, 'Use the AtomicAUI part from the component chooser (kit/chooser.md).');
      } else if (LAYOUT_TAGS.has(tag)) {
        report('AUI-03', line, `Plain <${tag}> used for layout.`, 'Use <View> with aui.sx (display, flexDirection, gap).');
      }
      const attributes = node.attributes.properties.filter(ts.isJsxAttribute);
      const has = (name) => attributes.some((attribute) => attribute.name.getText(sourceFile) === name);
      const handler = ['onClick', 'onDoubleClick', 'onKeyDown', 'tabIndex'].find(has);
      if (/^[a-z]/.test(tag) && handler && !CONTROL_TAGS.has(tag)) {
        report('AUI-01', line, `<${tag}> with ${handler}: a hand-built control.`, 'Use Button or IconButton, or <View interactive> for a clickable surface (kit/components/view.md).');
      }
      if (tag === 'View' && ['onClick', 'onDoubleClick'].some(has) && !has('interactive')) {
        report('AUI-01', line, '<View> with a click handler but no `interactive`: no keyboard, no role, no focus ring.', 'Add `interactive`, or use Button.');
      }
      if (tag === 'Type' && !has('aui')) {
        const as = attributes.find((attribute) => attribute.name.getText(sourceFile) === 'as')?.initializer;
        const inline = as && ts.isStringLiteral(as) && INLINE_TEXT_TAGS.has(as.text);
        if (!inline) report('AUI-05', line, '<Type> renders a block tag that keeps the browser margins.', 'Add aui={TEXT_AUI} (from @/recipes/shared/aui), or as="span" for text inside a row.');
      }
      if (attributes.some((attribute) => attribute.name.getText(sourceFile) === 'style')) {
        report('AUI-02', line, `Inline style on <${tag}>.`, 'Move the look into the aui prop (color, paint, scale, profile, shape, sx).');
      }
      const auiAttribute = attributes.find((attribute) => attribute.name.getText(sourceFile) === 'aui');
      const auiExpression = auiAttribute?.initializer && ts.isJsxExpression(auiAttribute.initializer) ? auiAttribute.initializer.expression : undefined;
      // AUI-09: a control keeps its part's shape. Only the kit's shared constants (src/recipes/shared/aui.ts) set one.
      if (SHAPE_CONTROLS.test(tag) && setsShape(auiExpression)) {
        report('AUI-09', line, `<${tag}> sets aui.shape.`, "Delete it. Shape is the part's default; set it only where a kit recipe does (kit/rules.md AUI-09).");
      }
      if (tag === 'Table' && !attributes.some((attribute) => attribute.name.getText(sourceFile) === 'a11y' && attribute.initializer?.getText(sourceFile) === '"tree"')) {
        const spreadAt = node.attributes.properties.findIndex((property) => ts.isJsxSpreadAttribute(property) && property.expression.getText(sourceFile) === 'TABLE_PROPS');
        if (spreadAt < 0) {
          report('AUI-09', line, '<Table> without the kit table look.', 'Spread the shared props: <Table {...TABLE_PROPS} ...> (from @/recipes/shared/aui). They give the frame, the dividers, the raised header and a table that scrolls in its own frame.');
        } else {
          // A prop written beside the spread wins over it: the look is then changed after the shared constant.
          const TABLE_LOOK = ['scroll', 'fit', 'bodyFit', 'border', 'borderStyle', 'headerCellAui', 'cellAui', 'aui', 'selectionToggleAui', 'expandTriggerAui', 'rowAui'];
          const overridden = attributes.map((attribute) => attribute.name.getText(sourceFile)).filter((name) => TABLE_LOOK.includes(name));
          if (node.attributes.properties.slice(spreadAt + 1).some((property) => ts.isJsxSpreadAttribute(property))) overridden.push('a second spread');
          if (overridden.length > 0) {
            report('AUI-09', line, `<Table> changes the kit table look after {...TABLE_PROPS}: ${overridden.join(', ')}.`, 'Delete them. The table look is the same on every screen; a different look is a line in GAPS.md (kit/components/table.md).');
          }
        }
      }
      if (/(^|\.)(SelectTrigger|Select\.Trigger)$/.test(tag)) {
        const text = auiExpression?.getText(sourceFile) ?? '';
        const onlySx = auiExpression && ts.isObjectLiteralExpression(auiExpression)
          && auiExpression.properties.every((property) => (ts.isSpreadAssignment(property) && property.expression.getText(sourceFile) === 'SELECT_TRIGGER_AUI') || (ts.isPropertyAssignment(property) && property.name.getText(sourceFile) === 'sx' && ts.isObjectLiteralExpression(property.initializer)
            && property.initializer.properties.every((key) => ts.isPropertyAssignment(key) && ['width', 'minWidth', 'maxWidth', 'flex'].includes(key.name.getText(sourceFile)))));
        if (!text.includes('SELECT_TRIGGER_AUI')) {
          report('AUI-09', line, `<${tag}> without the kit select look.`, 'Add aui={SELECT_TRIGGER_AUI} (from @/recipes/shared/aui): a select looks like an input.');
        } else if (text !== 'SELECT_TRIGGER_AUI' && !(onlySx && /^\{\s*\.\.\.SELECT_TRIGGER_AUI/.test(text))) {
          report('AUI-09', line, `<${tag}> changes the kit select look after SELECT_TRIGGER_AUI.`, 'Use aui={SELECT_TRIGGER_AUI}, or a spread of it followed by sx with sizing keys only (width, minWidth, maxWidth, flex).');
        }
      }
      // The looks all ten prototypes share must not fall back to the library default, and nothing is written after the constant:
      // a key that follows it in the same object would win.
      const auiText = (auiExpression?.getText(sourceFile) ?? '').trim();
      if (/(^|\.)(Checkbox|Radio)$/.test(tag) && auiText !== 'TOGGLE_AUI') {
        if (!/\bTOGGLE_AUI\b/.test(auiText)) report('AUI-09', line, `<${tag}> without the kit checkbox look.`, 'Add aui={TOGGLE_AUI} (from @/recipes/shared/aui): a 1 px outlined box, solid primary when ticked.');
        else report('AUI-09', line, `<${tag}> changes the kit checkbox look after TOGGLE_AUI.`, 'Write aui={TOGGLE_AUI} and nothing else: the look is the same on every screen.');
      }
      if (/(^|\.)Switch$/.test(tag) && auiText !== 'SWITCH_AUI') {
        if (!/\bSWITCH_AUI\b/.test(auiText)) report('AUI-09', line, `<${tag}> without the kit switch look: the library default is faint when on.`, 'Add aui={SWITCH_AUI} (from @/recipes/shared/aui): solid primary when on (kit/components/switch.md).');
        else report('AUI-09', line, `<${tag}> changes the kit switch look after SWITCH_AUI.`, 'Write aui={SWITCH_AUI} and nothing else: the look is the same on every screen.');
      }
      // A look may be a constant of this file (a search field in a bar): read what it holds.
      const bare = (expression) => (expression && (ts.isAsExpression(expression) || ts.isSatisfiesExpression(expression) || ts.isParenthesizedExpression(expression)) ? bare(expression.expression) : expression);
      // A field has one of three layouts, on every screen: stacked in a page (label above the control, FIELD_AUI or FIELD_WIDE_AUI, 3 px between them), stacked in a dialog or a popup (FIELD_DIALOG_AUI or FIELD_DIALOG_WIDE_AUI, the library's own 6 px) or inline (label beside the control: FIELD_INLINE_AUI is the column, and the row inside it is a View with FIELD_INLINE_ROW_AUI, the library's own gap). No other gap by hand; after the constant only a size (`scale`, one of the five library steps, written out) and layout keys may follow.
      // Where a field is, one way only: the page look with a part of a `Dialog` or a `Popover` around the `Field` fails (`Dialog.Popup`, `Dialog.Body`, `Popover.Popup` and every other part but the root and `Trigger`, which stand on the page). A `Field` built apart from its dialog (in a variable, a helper or a component of its own) cannot be placed by a static check: it is held by the `dialog` prop of `FormField`, not by this rule, and the dialog look is accepted anywhere.
      if (tag === 'Field') {
        const FIELD_SX = ['gridColumn', 'width', 'minWidth', 'flex'];
        const FIELD_SCALES = ['xs', 'sm', 'md', 'lg', 'xl'];
        const FIELD_LOOKS = ['FIELD_AUI', 'FIELD_WIDE_AUI', 'FIELD_INLINE_AUI', 'FIELD_DIALOG_AUI', 'FIELD_DIALOG_WIDE_AUI'];
        // A constant of the kit, or a choice between constants (a ternary, nested if need be).
        const plainLook = (expression) => {
          const inner = bare(expression);
          if (!inner) return false;
          if (ts.isIdentifier(inner)) return FIELD_LOOKS.includes(inner.text);
          if (ts.isConditionalExpression(inner)) return plainLook(inner.whenTrue) && plainLook(inner.whenFalse);
          return false;
        };
        const own = bare(auiExpression && ts.isIdentifier(auiExpression) && !FIELD_LOOKS.includes(auiExpression.text) ? constants.get(auiExpression.text) : auiExpression);
        const base = own && ts.isObjectLiteralExpression(own) && own.properties.length > 0 && ts.isSpreadAssignment(own.properties[0]) ? own.properties[0].expression.getText(sourceFile) : '';
        // The two with a gap-free sx of their own (FIELD_AUI, FIELD_INLINE_AUI) are spread again inside the sx that follows; the dialog look has no sx, so only layout keys follow it. The two wide ones take a size and no sx.
        const ownSx = ['FIELD_AUI', 'FIELD_INLINE_AUI'].includes(base);
        const sizeOrLayoutAfter = FIELD_LOOKS.includes(base)
          && own.properties.slice(1).every((property) => {
            if (!ts.isPropertyAssignment(property)) return false;
            const name = property.name.getText(sourceFile);
            const value = bare(property.initializer);
            if (name === 'scale') return ts.isStringLiteral(value) && FIELD_SCALES.includes(value.text);
            return name === 'sx' && ts.isObjectLiteralExpression(value) && (ownSx || base === 'FIELD_DIALOG_AUI')
              && (!ownSx || value.properties.some((key) => ts.isSpreadAssignment(key) && key.expression.getText(sourceFile) === `${base}.sx`))
              && value.properties.every((key) => (ownSx && ts.isSpreadAssignment(key) && key.expression.getText(sourceFile) === `${base}.sx`) || (ts.isPropertyAssignment(key) && FIELD_SX.includes(key.name.getText(sourceFile))));
          });
        const lookText = own?.getText(sourceFile) ?? auiText;
        if (!plainLook(own ?? auiExpression) && !sizeOrLayoutAfter) {
          if (!/\bFIELD_(WIDE_|INLINE_|DIALOG_|DIALOG_WIDE_)?AUI\b/.test(lookText)) report('AUI-09', line, '<Field> without the kit field look: a label above the control (3 px in a page, the library gap in a dialog or popup) or beside it (the library gap).', "Add aui={FIELD_AUI} (label above the control in a page), FIELD_WIDE_AUI (the same across both columns of the form grid), FIELD_DIALOG_AUI or FIELD_DIALOG_WIDE_AUI (the same in a dialog or popup) or FIELD_INLINE_AUI (label beside the control: the constant is the column, and the label and the control go in a row inside it, <View aui={FIELD_INLINE_ROW_AUI}>), from @/recipes/shared/aui (kit/components/field.md). A gap written by hand fails. The size is aui.scale next to the constant: aui={{ ...FIELD_AUI, scale: 'md' }} (xs, sm, md, lg or xl; the constants are sm).");
          else report('AUI-09', line, '<Field> changes the kit field look after the shared constant: a gap, a layout or a size of its own.', `Write one of the five constants, or a spread of one followed by the size, scale: 'xs', 'sm', 'md', 'lg' or 'xl' (written out, not a variable), and, after FIELD_AUI or FIELD_INLINE_AUI, sx: { ...FIELD_AUI.sx, ... } (after FIELD_DIALOG_AUI, sx: { ... }) with layout keys only (${FIELD_SX.join(', ')}).`);
        } else if (/\bFIELD_(WIDE_)?AUI\b/.test(lookText)) {
          const isLayerPart = (element) => (ts.isJsxOpeningElement(element) || ts.isJsxSelfClosingElement(element)) && /^(Dialog|Popover)\.(?!(?:Root|Trigger)$)\w+$/.test(element.tagName.getText(sourceFile));
          for (let parent = node.parent; parent && !ts.isSourceFile(parent); parent = parent.parent) {
            if (!isLayerPart(ts.isJsxElement(parent) ? parent.openingElement : parent)) continue;
            report('AUI-09', line, '<Field> with the page field look inside a dialog or popup.', 'A dialog or popup takes FIELD_DIALOG_AUI or FIELD_DIALOG_WIDE_AUI: no gap written, so the library gap applies (kit/components/field.md).');
            break;
          }
        }
      }
      // A popover's panel floats with one look on every screen (hs, hcs): render={<View aui={POPUP_AUI} />}. After a spread of it only height and overflow keys.
      if (tag === 'Popover.Popup') {
        const POPUP_SX = ['height', 'minHeight', 'maxHeight', 'overflow'];
        const render = attributes.find((attribute) => attribute.name.getText(sourceFile) === 'render');
        const element = render?.initializer && ts.isJsxExpression(render.initializer) ? render.initializer.expression : undefined;
        const view = element && (ts.isJsxSelfClosingElement(element) ? element : ts.isJsxElement(element) ? element.openingElement : undefined);
        const viewAui = view?.tagName.getText(sourceFile) === 'View' ? view.attributes.properties.find((property) => ts.isJsxAttribute(property) && property.name.getText(sourceFile) === 'aui') : undefined;
        const look = viewAui?.initializer && ts.isJsxExpression(viewAui.initializer) ? viewAui.initializer.expression : undefined;
        const own = bare(look && ts.isIdentifier(look) && look.text !== 'POPUP_AUI' ? constants.get(look.text) : look);
        const plain = own && ts.isIdentifier(own) && own.text === 'POPUP_AUI';
        const layoutAfter = own && ts.isObjectLiteralExpression(own) && own.properties.length > 0
          && ts.isSpreadAssignment(own.properties[0]) && own.properties[0].expression.getText(sourceFile) === 'POPUP_AUI'
          && own.properties.slice(1).every((property) => ts.isPropertyAssignment(property) && property.name.getText(sourceFile) === 'sx' && ts.isObjectLiteralExpression(property.initializer)
            && property.initializer.properties.some((key) => ts.isSpreadAssignment(key) && key.expression.getText(sourceFile) === 'POPUP_AUI.sx')
            && property.initializer.properties.every((key) => (ts.isSpreadAssignment(key) && key.expression.getText(sourceFile) === 'POPUP_AUI.sx') || (ts.isPropertyAssignment(key) && POPUP_SX.includes(key.name.getText(sourceFile)))));
        if (!plain && !layoutAfter) {
          if (!/\bPOPUP_AUI\b/.test(own?.getText(sourceFile) ?? look?.getText(sourceFile) ?? '')) report('AUI-09', line, '<Popover.Popup> without the kit popup look: the library popup paints nothing.', 'Add render={<View aui={POPUP_AUI} />} (from @/recipes/shared/aui): a floating surface, elevation 4, 320 wide (kit/components/popover.md).');
          else report('AUI-09', line, '<Popover.Popup> changes the kit popup look after POPUP_AUI.', `Write render={<View aui={POPUP_AUI} />}, or a spread of it followed by sx: { ...POPUP_AUI.sx, ... } with ${POPUP_SX.join(', ')} only.`);
        }
      }
      const SECTION = /^(SECTION_ITEM_AUI|SECTION_DIVIDER_AUI|SECTION_CARD_AUI|[^?{}]+\?\s*SECTION_(ITEM|DIVIDER)_AUI\s*:\s*SECTION_(ITEM|DIVIDER)_AUI)$/;
      if (tag === 'Accordion.Item' && !SECTION.test(auiText)) {
        if (!/\bSECTION_(ITEM|DIVIDER)_AUI\b/.test(auiText)) report('AUI-09', line, '<Accordion.Item> without the kit section look.', 'Use <Sections> from @/recipes/layout. By hand: first section aui={SECTION_ITEM_AUI}, every other one aui={SECTION_DIVIDER_AUI} (from @/recipes/shared/aui).');
        else report('AUI-09', line, '<Accordion.Item> changes the kit section look after the shared constant.', 'Write aui={SECTION_ITEM_AUI} on the first section and aui={SECTION_DIVIDER_AUI} on every other one, and nothing else.');
      }
      // A tab panel has no padding of its own: what it holds starts at the left edge of the tab row. Only layout keys may follow the constant.
      // The one other look is the panel of a pane whose header holds the tab row: it is the row of that pane (PANE_TAB_PANEL_AUI, as it is).
      if (tag === 'Tabs.Panel' && auiText !== 'TAB_PANEL_AUI' && auiText !== 'PANE_TAB_PANEL_AUI') {
        const TAB_PANEL_SX = ['display', 'flexDirection', 'flex', 'minHeight', 'minWidth', 'height', 'width', 'overflow'];
        const layoutAfter = auiExpression && ts.isObjectLiteralExpression(auiExpression) && auiExpression.properties.length > 0
          && ts.isSpreadAssignment(auiExpression.properties[0]) && auiExpression.properties[0].expression.getText(sourceFile) === 'TAB_PANEL_AUI'
          && auiExpression.properties.slice(1).every((property) => ts.isPropertyAssignment(property) && property.name.getText(sourceFile) === 'sx' && ts.isObjectLiteralExpression(property.initializer)
            && property.initializer.properties.every((key) => ts.isPropertyAssignment(key) && TAB_PANEL_SX.includes(key.name.getText(sourceFile))));
        if (!/\bTAB_PANEL_AUI\b/.test(auiText)) report('AUI-09', line, '<Tabs.Panel> without the kit tab-panel look: its default padding puts a table 8 px inside the tab row.', 'Add aui={TAB_PANEL_AUI} (from @/recipes/shared/aui): the panel has no padding, so what it holds lines up with the tabs. In a pane whose header holds the tab row: aui={PANE_TAB_PANEL_AUI} (kit/components/tabs.md).');
        else if (!layoutAfter) report('AUI-09', line, '<Tabs.Panel> changes the kit tab-panel look after TAB_PANEL_AUI.', `Write aui={TAB_PANEL_AUI}, or a spread of it followed by sx with layout keys only (${TAB_PANEL_SX.join(', ')}).`);
      }
      // The picked look is the same on every screen: a row gets it from TABLE_PROPS, a card from SELECTED_CARD_AUI.
      const spread = node.attributes.properties.some((property) => ts.isJsxSpreadAttribute(property));
      if (tag === 'Table.Row' && (has('aui') || spread)) {
        report('AUI-09', line, '<Table.Row> sets aui or spreads props: the look of a row, picked or not, comes from TABLE_PROPS.', 'Delete it. The picked row is the same on every screen (SELECTED_ROW_AUI inside TABLE_PROPS). Too faint for your screen: one line in GAPS.md, not a screen change (kit/components/table.md).');
      }
      const CELL = /^(CELL_START_AUI|CELL_CENTER_AUI|[^?{}]+\?\s*CELL_(START|CENTER)_AUI\s*:\s*CELL_(START|CENTER)_AUI)$/;
      if (tag === 'Table.Cell' && ((has('aui') && !CELL.test(auiText)) || spread)) {
        report('AUI-09', line, '<Table.Cell> changes the kit cell look: a cell fill paints over the picked row.', 'Write aui={CELL_START_AUI} on the first column and aui={CELL_CENTER_AUI} on the others, and nothing else (kit/components/table.md).');
      }
      if (tag === 'View' && has('selected')) {
        let look = unwrap(auiExpression);
        if (look && ts.isIdentifier(look) && look.text !== 'SELECTED_CARD_AUI') look = unwrap(constants.get(look.text));
        const LOOK_KEY = /^(background|foreground|borderColor|border\w*Width|borderStyle|radius\w*)$/;
        const layoutOnly = (property) => ts.isPropertyAssignment(property) && property.name.getText(sourceFile) === 'sx' && ts.isObjectLiteralExpression(unwrap(property.initializer))
          && unwrap(property.initializer).properties.every((key) => ts.isPropertyAssignment(key) && !LOOK_KEY.test(key.name.getText(sourceFile)));
        const kitLook = look && ((ts.isIdentifier(look) && look.text === 'SELECTED_CARD_AUI')
          || (ts.isObjectLiteralExpression(look) && look.properties.length > 0 && ts.isSpreadAssignment(look.properties[0]) && look.properties[0].expression.getText(sourceFile) === 'SELECTED_CARD_AUI' && look.properties.slice(1).every(layoutOnly)));
        // An icon toggle (the shell's pin: a square profile) is not a card.
        const squareProfile = look && ts.isObjectLiteralExpression(look) && look.properties.some((property) => ts.isPropertyAssignment(property) && property.name.getText(sourceFile) === 'profile' && ts.isStringLiteralLike(property.initializer) && SQUARE_PROFILES.has(property.initializer.text));
        if (spread || (!kitLook && !squareProfile)) {
          report('AUI-09', line, '<View selected> without the kit selected-card look, or with that look changed.', 'Use aui={SELECTED_CARD_AUI} (from @/recipes/shared/aui), or a constant in this file that starts with ...SELECTED_CARD_AUI and adds only sx with layout keys (no colour, no border): kit/style/examples/selection-cards.md. Too faint for your screen: one line in GAPS.md, not a screen change.');
        } else if (!squareProfile && !test && !isKitOwned(file) && readSource(file, text).markers.length === 0) {
          // A picked View lives in a styled piece: its marker brings the GAPS.md line check (styledPieces). Cards to pick are the copied selection-cards.
          report('AUI-09', line, '<View selected> is a hand-built card to pick: this file has no data-aui-styled marker, so it is not a styled piece.', 'Copy the piece and use it: `cp src/recipes/styled/SelectionCards.tsx src/screens/<Name>/SelectionCards.tsx` (Windows: `Copy-Item`), then <SelectionCards label options value onChange />. Add its gap line to GAPS.md: - Styled piece `selection-cards`: no card-pick part that matches our apps; <screen>; <file>. (kit/style/examples/selection-cards.md; kit/chooser.md, "Selected card").');
        }
      }
      const closeSiblings = tag === 'Tabs.CloseButton' ? (ts.isJsxOpeningElement(node) ? node.parent : node).parent : undefined;
      const labelSlot = (child) => (ts.isJsxElement(child) ? child.openingElement : child).attributes?.properties
        .some((attribute) => ts.isJsxAttribute(attribute) && attribute.name.getText(sourceFile) === 'aui' && attribute.initializer?.getText(sourceFile) === '{TAB_LABEL_AUI}');
      if (tag === 'Tabs.CloseButton' && !((ts.isJsxElement(closeSiblings) || ts.isJsxFragment(closeSiblings)) && closeSiblings.children.some(labelSlot))) {
        report('AUI-09', line, '<Tabs.CloseButton> without a label slot: the close button would not sit at the far right.', 'Put the tab label in <View as="span" aui={TAB_LABEL_AUI}> before the button (kit/components/tabs.md).');
      }
      // AUI-01: a Button or View given aria-expanded is a fold built by hand: the part that folds carries aria-expanded, aria-controls and the keys.
      if (!test && !isKitOwned(file) && /^(Button|IconButton|View)$/.test(tag) && attributes.some((attribute) => attribute.name.getText(sourceFile) === 'aria-expanded')) {
        report('AUI-01', line, `<${tag}> with aria-expanded: a fold built by hand (an own keyboard and a11y pattern).`, 'Use Collapsible for one block that folds open and shut (kit/components/collapsible.md), Sections for several under each other, Pane with collapsible for a side pane (@/recipes/layout).');
      }
      if (ICON_ONLY_PARTS.test(tag)) {
        const named = attributes.some((attribute) => ['aria-label', 'aria-labelledby'].includes(attribute.name.getText(sourceFile)));
        if (!named) report('AUI-11', line, `<${tag}> has no accessible name.`, 'Add aria-label="What it does".');
        const auiInit = attributes.find((attribute) => attribute.name.getText(sourceFile) === 'aui')?.initializer;
        const aui = auiInit && ts.isJsxExpression(auiInit) ? auiInit.expression : undefined;
        const profileProperty = aui && ts.isObjectLiteralExpression(aui)
          ? aui.properties.find((property) => ts.isPropertyAssignment(property) && property.name.getText(sourceFile) === 'profile')
          : undefined;
        const profile = profileProperty && ts.isStringLiteralLike(profileProperty.initializer) ? profileProperty.initializer.text : undefined;
        if (profile && !SQUARE_PROFILES.has(profile)) {
          report('AUI-11', line, `<${tag}> with profile '${profile}': an icon button is not square.`, "Use the profile AtomicAUI defines for square icon controls: 'square' (or 'square-compact' in a compact row).");
        }
      }
    }
    if (!test && ts.isPropertyAssignment(node) && node.name.getText(sourceFile) === 'sx' && ts.isObjectLiteralExpression(node.initializer)) {
      for (const property of node.initializer.properties) {
        if (ts.isPropertyAssignment(property) && ts.isNumericLiteral(property.initializer)) {
          report('AUI-05', lineOf(sourceFile, property), `sx.${property.name.getText(sourceFile)} is a number.`, `Use a token string such as '${property.initializer.text}' or 'fill'.`);
        }
      }
    }
    if (!test && (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node) || ts.isTemplateHead(node) || ts.isTemplateMiddle(node) || ts.isTemplateTail(node))) {
      const value = node.text;
      const line = lineOf(sourceFile, node);
      const colour = value.match(HEX_COLOUR) ?? value.match(FUNCTION_COLOUR);
      if (colour && !fixture && !ts.isImportDeclaration(node.parent)) {
        report('AUI-02', line, `Raw colour "${colour[0]}".`, 'Use aui.color (and aui.paint). Colours come from the token theme.');
      }
      const length = value.match(PIXEL_LENGTH);
      if (length && !ts.isImportDeclaration(node.parent)) {
        report('AUI-02', line, `Pixel value "${length[0]}".`, "Use a profile or a token string in aui.sx, for example '28'.");
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return problems;
}

/** AUI-02 and AUI-03 for app stylesheets: no raw colour or pixel value, and a `why:` comment on every rule. */
export function checkStylesheet(file, text) {
  const problems = [];
  const lines = text.split('\n');
  let inBlockComment = false;
  let lastComment = '';
  lines.forEach((raw, index) => {
    const lineNumber = index + 1;
    const accepted = allowedRules(`${lines[index - 1] ?? ''}\n${raw}`);
    let code = raw;
    if (inBlockComment) {
      lastComment = raw;
      if (raw.includes('*/')) inBlockComment = false;
      return;
    }
    const blockStart = raw.indexOf('/*');
    if (blockStart >= 0 && !raw.includes('*/', blockStart)) {
      inBlockComment = true;
      lastComment = raw;
      code = raw.slice(0, blockStart);
    }
    const lineComment = code.indexOf('//');
    const trimmed = (lineComment >= 0 ? code.slice(0, lineComment) : code).replace(/\/\*.*?\*\//g, '').trim();
    if (lineComment >= 0 && trimmed === '') {
      lastComment = raw;
      return;
    }
    if (/^\/\*.*\*\/$/.test(raw.trim())) {
      lastComment = raw;
      return;
    }
    if (trimmed === '') return;
    const colour = trimmed.match(HEX_COLOUR) ?? trimmed.match(FUNCTION_COLOUR);
    if (colour && !accepted.has('AUI-02')) {
      problems.push(problem('AUI-02', file, lineNumber, `Raw colour "${colour[0]}" in app CSS.`, 'Use a token variable from the library (for example var(--theme-...)) or set it with the aui prop.'));
    }
    const length = trimmed.match(PIXEL_LENGTH);
    if (length && !accepted.has('AUI-02')) {
      problems.push(problem('AUI-02', file, lineNumber, `Pixel value "${length[0]}" in app CSS.`, 'Use a token (var(--p-px-N)) or set it with aui.sx.'));
    }
    if (trimmed.endsWith('{') && !accepted.has('AUI-03') && !/why:/i.test(lastComment)) {
      problems.push(problem('AUI-03', file, lineNumber, 'CSS rule without a "why:" comment above it.', 'Add "// why: <reason the aui prop cannot do this>" on the line above.'));
    }
    // A selector list keeps its comment until the rule opens.
    if (!trimmed.endsWith(',')) lastComment = '';
  });
  // AUI-03: app CSS places the outer page. A look in CSS is a second design system, whatever its values and its comment.
  for (const found of lookDeclarations(text)) {
    if (allowedRules(`${lines[found.line - 2] ?? ''}\n${lines[found.line - 1] ?? ''}`).has('AUI-03')) continue;
    problems.push(problem('AUI-03', file, found.line, `App CSS sets a look: "${found.property}" in the rule "${found.selector}".`, 'App CSS only places the outer page (position, size, grid placement, scroll). Colour, border, padding, margin, gap, font, radius, shadow and outline come from the aui prop of a View, a Type or a part. A piece AtomicAUI has no part for: kit/style/start.md.'));
  }
  return problems.sort((a, b) => a.line - b.line);
}

/** The kit's own look constants (src/recipes/shared/aui.ts), so a piece that spreads one can be read. */
function sharedConstants(root) {
  const file = path.join(root, 'src/recipes/shared/aui.ts');
  if (!fs.existsSync(file)) return new Map();
  return collectConstants(ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true));
}

/**
 * The styled pieces of an app: every data-aui-styled marker in app code (not in kit-owned folders).
 * Returns [{ name, file, line, problems, outside }]: `problems` fail the check (no line in GAPS.md, an elevation);
 * `outside` lists the looks that are not in the usage profile. Those do not fail: each is removed, or explained on the evidence sheet.
 */
export function styledPieces(root, files) {
  const profile = loadProfile(root);
  const shared = sharedConstants(root);
  const gapsFile = path.join(root, 'GAPS.md');
  const gaps = gapNames(fs.existsSync(gapsFile) ? fs.readFileSync(gapsFile, 'utf8') : '');
  const pieces = [];
  for (const file of files) {
    if (!/\.[jt]sx$/.test(file) || isKitOwned(file) || isTestFile(file)) continue;
    const text = fs.readFileSync(path.join(root, file), 'utf8');
    if (!text.includes('data-aui-styled')) continue;
    const { uses, markers } = readSource(file, text, shared);
    const outside = outsideProfile(uses, profile).map((look) => `${look} (line ${uses.find((use) => `${use.set} ${use.key}` === look).line})`);
    markers.forEach((marker, index) => {
      // The looks of a file belong to its first piece: one file per piece.
      const piece = { name: marker.name, file, line: marker.line, uses: index === 0 ? uses : [] };
      pieces.push({ name: marker.name, file, line: marker.line, problems: checkPiece(piece, gaps), outside: index === 0 ? outside : [] });
    });
  }
  return pieces;
}

/** KIT-01: size budgets keep the reading path small enough for a lower-tier model. */
export const SIZE_BUDGETS = [
  { match: (file) => file === 'AGENTS.md', max: 100 },
  // The styled-piece skill: its entry page stays in context once loaded; an example is measured in bytes, because class lists make lines long.
  { match: (file) => file === 'kit/style/start.md', max: 90 },
  { match: (file) => file === 'kit/style/roles.md', max: 120 },
  // 12288: the selection-cards example carries two card forms (one line; title and text), each with its class lists.
  { match: (file) => file.startsWith('kit/style/examples/'), max: 150, maxBytes: 12288 },
  { match: (file) => file.startsWith('kit/style/') && file.endsWith('.md'), max: 80 },
  { match: (file) => file.startsWith('kit/components/'), max: 120 },
  { match: (file) => file.startsWith('kit/') && file.endsWith('.md'), max: 150 },
];

export function checkSizes(files, readText) {
  const problems = [];
  for (const file of files) {
    const budget = SIZE_BUDGETS.find((candidate) => candidate.match(file));
    if (!budget) continue;
    const count = readText(file).trimEnd().split('\n').length;
    if (count > budget.max) {
      problems.push(problem('KIT-01', file, 1, `${count} lines; the budget is ${budget.max}.`, 'Cut it: move history and examples out, keep rules, tables and one example.'));
    }
    const bytes = Buffer.byteLength(readText(file));
    if (budget.maxBytes && bytes > budget.maxBytes) {
      problems.push(problem('KIT-01', file, 1, `${bytes} bytes; the budget is ${budget.maxBytes}.`, 'Make the example smaller: fewer repeated blocks in its case (src/standard/cases.tsx), a shorter source file.'));
    }
  }
  return problems;
}

/** KIT-02: nothing private ships. Patterns are built from parts so this file does not match itself. */
const part = (...pieces) => pieces.join('');
export const PRIVATE_PATTERNS = [
  { pattern: new RegExp(part('/Us', 'ers/'), 'i'), what: 'a home path' },
  // Case-sensitive: a home folder on Linux is lower case, and a screen folder named Home (src/screens/Home/Home.tsx) is not a path.
  { pattern: new RegExp(part('/ho', 'me/[a-z]')), what: 'a home path' },
  { pattern: new RegExp(part('first', 'mate'), 'i'), what: 'agent-fleet wording' },
  { pattern: new RegExp(part('\\bcap', 'tain\\b'), 'i'), what: 'private decision wording' },
  { pattern: new RegExp(part('figma\\.', 'site'), 'i'), what: 'a site address' },
  { pattern: new RegExp(part('fontawesome\\.com/(?!c852dd', 'bb54\\.js)[a-z0-9]{8,}\\.js'), 'i'), what: 'an icon kit id other than the AtomicAUI Global Kit' },
  { pattern: new RegExp(part('(?:to', 'ken|secr', 'et|api[_-]?key)\\s*[:=]\\s*[\'"][^\'"]{8,}'), 'i'), what: 'a credential' },
];

export function checkPrivate(file, text) {
  const problems = [];
  const lines = text.split('\n');
  lines.forEach((line, index) => {
    if (allowedRules(`${lines[index - 1] ?? ''}\n${line}`).has('KIT-02')) return;
    for (const { pattern, what } of PRIVATE_PATTERNS) {
      if (pattern.test(line)) {
        problems.push(problem('KIT-02', file, index + 1, `Looks like ${what}.`, 'Remove it. The kit ships no private paths, names, quotes, keys or site addresses.'));
      }
    }
  });
  return problems;
}

/**
 * KIT-03: icons are automatic. Every page that has a <head> carries the AtomicAUI Global Kit script and no other kit id;
 * an app entry page (loads /src/main.tsx) gets it from src/app/icon-kit.ts, which must name the Global Kit.
 */
export function checkIconKit(file, text) {
  const page = inspectPage(text);
  if (page.skip) return [];
  const fix = `Run: node scripts/icon-kit.mjs <app folder>. The kit's icon kit is ${GLOBAL_KIT_ID}; icons load only on domains the kit owner has allowed.`;
  if (page.wrongIds.length > 0) return [problem('KIT-03', file, 1, `This page loads another icon kit (${page.wrongIds[0]}).`, fix)];
  if (page.missing && !text.includes('/src/main.tsx')) return [problem('KIT-03', file, 1, 'This page does not load the AtomicAUI Global Kit (no icons would show).', fix)];
  return [];
}

// Text the whole-repository rules read. C# and Razor are here since the kit ships sample projects written in them.
const TEXT_FILES = /\.(md|json|tsx?|jsx?|scss|css|html|mjs|svg|yml|yaml|cs|cshtml|razor|csproj)$/;
// Pages that are not asked for the icon kit, each for its own reason.
const NO_ICON_KIT = new Set([
  'src/standard/cases.html', // only the recipe build opens it
  'src/standard/pages.html', // only the recipe build opens it, once for each page recipe
  'src/standard/behaviour.html', // only the behaviour build and check open it
  // Stand-ins for documents a host owns: their <head> is not ours to add to. form-onload.js adds the kit when the form loads.
  'kit/samples/aras-standin/host.html',
  'kit/samples/aras-standin/form.html',
  'kit/samples/aras-standin/form.template.html',
  'kit/samples/legacy/react/index.html', // an old page on purpose: it is the thing to convert, so it loads no icon kit
  'kit/samples/legacy/react/reference/index.html', // its main.tsx loads the icon kit, as the starter's does
  'kit/samples/legacy/html/index.html', // old pages on purpose: they are the things to restyle, so they load no icon kit
  'kit/samples/legacy/razor/Pages/Shared/_Layout.cshtml',
]);

// The record a conversion keeps of the old app (kit/paths/convert.md, step 1): CONVERSION.md and the views, pictures and measurements under conversion/ hold the old page addresses as they are. Not the kit's shipped text, so KIT-02 does not read it.
const isConversionRecord = (file) => file === 'CONVERSION.md' || file.startsWith('conversion/');

/**
 * Which files the whole-repository rules look at. `files`: paths from the project root, with forward slashes.
 * What building or setting up a sample project leaves behind is never read: it is not shipped, and it holds the
 * paths of the machine that built it.
 */
export function filesToRead(files) {
  const text = files.filter((file) => TEXT_FILES.test(file) && !file.endsWith('package-lock.json') && !isSampleOutput(file));
  const shipped = text.filter(
    (file) => !file.startsWith(`${VENDOR_DIR}/`) && !file.startsWith('public/') && !file.startsWith('scripts/check-rules') && !file.startsWith('.claude/') && !file.startsWith('evidence/') && !file.startsWith('dist-skill/') && !file.startsWith('src/data/legacy/') && !isConversionRecord(file),
  );
  const iconPages = text.filter((file) => /\.(html?|cshtml|razor)$/i.test(file) && !/^(dist|evidence|dist-skill|public)\//.test(file) && !file.startsWith(`${VENDOR_DIR}/`) && !NO_ICON_KIT.has(file));
  return { text, shipped, iconPages };
}

/** Runs every rule over a project root and returns the problems, sorted by file and line. */
export function runChecks(root) {
  const problems = [...checkVendor(root), ...checkReleaseStamp(root), ...checkKit(root)];
  const sourceFiles = walk(path.join(root, 'src'), (file) => /\.(tsx?|scss|css)$/.test(file), root).map((file) => file.split(path.sep).join('/')).filter((file) => !file.startsWith('src/data/legacy/'));
  const legacyRoot = path.join(root, 'src/data/legacy');
  if (fs.existsSync(legacyRoot)) {
    for (const file of walk(legacyRoot, (name) => /\.[jt]sx$/.test(name), root)) {
      problems.push(problem('KIT-04', file.split(path.sep).join('/'), 1, 'UI files are not allowed in src/data/legacy/.', 'Move any UI into a screen under src/screens/ where AtomicAUI rules check it. Keep only .js and .ts logic in src/data/legacy/.'));
    }
  }
  for (const file of sourceFiles) {
    if (file.startsWith(`${VENDOR_DIR}/`)) continue;
    const text = fs.readFileSync(path.join(root, file), 'utf8');
    if (/\.(tsx?)$/.test(file)) problems.push(...checkTypeScript(file, text));
    else problems.push(...checkStylesheet(file, text));
  }
  problems.push(...checkPackData(root, sourceFiles));
  problems.push(...checkGapsKept(root), ...checkGapPieces(root));
  for (const piece of styledPieces(root, sourceFiles)) problems.push(...piece.problems);
  const { text: textFiles, shipped, iconPages } = filesToRead(walk(root, (file) => TEXT_FILES.test(file), root).map((file) => file.split(path.sep).join('/')));
  const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
  problems.push(...checkSizes(textFiles, read));
  for (const file of shipped) problems.push(...checkPrivate(file, read(file)));
  for (const file of iconPages) problems.push(...checkIconKit(file, read(file)));
  const iconKitFile = 'src/app/icon-kit.ts';
  if (fs.existsSync(path.join(root, iconKitFile)) && !read(iconKitFile).includes(`'${GLOBAL_KIT_ID}'`)) {
    problems.push(problem('KIT-03', iconKitFile, 1, 'The starter does not default to the AtomicAUI Global Kit.', `Set the default id to '${GLOBAL_KIT_ID}'. VITE_ICON_KIT_ID stays an optional override.`));
  }
  return problems.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line);
}

export function formatProblem({ rule, file, line, message, fix }) {
  const see = rule.startsWith('AUI') ? ` See kit/rules.md#${rule.toLowerCase()}.` : '';
  return `${rule}: ${message} ${file}:${line}\n    Fix: ${fix}${see}`;
}
