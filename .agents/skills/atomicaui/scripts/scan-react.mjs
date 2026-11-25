// The app scan for React: reads the old app's source files with the TypeScript parser and lists every control it writes.
// No install of the old app, no running app, no browser. It never writes anything and never follows a path out of the app folder.
// What each rule does and why: kit/convert/scan.md (people) and the tests in scan-react.test.mjs (one planted input per rule).
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import { behaviours, classify, dateBoxKind, withMap } from './scan-classify.mjs';
import { makeReach } from './scan-report.mjs';

const has = (object, key) => Object.hasOwn(object ?? {}, key);
const byCode = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
const SOURCE = /\.(tsx|jsx|ts|js|mjs)$/;
/** Folder names skipped at any depth. `vendor` holds libraries; one that holds atomic-aui marks the app as already on AtomicAUI. */
const SKIP_ANYWHERE = new Set(['node_modules', 'dist', '.git', '__tests__', 'coverage', '.storybook', 'bin', 'obj', 'vendor']);
/** Folder names skipped only directly under the app folder: an app may give a page folder such a name (src/pages/tests/). */
const SKIP_TOP = new Set(['build', 'out', 'tests', 'test', 'e2e', 'public', 'docs', 'scripts', 'tools', 'evidence', '_vaults']);
const SKIP_FILE = /(\.(test|spec|stories|config)\.[^.]+|\.d\.ts)$/;
const CLICK = ['onClick', 'onDoubleClick', 'onMouseDown', 'onPointerDown'];
const KEYS = ['onKeyDown', 'onKeyUp', 'onKeyPress'];
const DRAG = ['onDragStart', 'onDrop', 'onDragOver'];
const NATIVE = ['alert', 'confirm', 'prompt'];
const GRID_KINDS = new Set(['data-grid', 'tree-grid']);
const EXTENSIONS = ['', '.tsx', '.ts', '.jsx', '.js', '/index.tsx', '/index.ts', '/index.jsx', '/index.js'];
/** Bare import prefixes that are always the app's own: each with the folder it stands for. */
const ALIASES = [['@/', 'src/'], ['~/', 'src/'], ['@components/', 'src/components/'], ['components/', 'src/components/'], ['src/', 'src/']];
const REACT_ROUTER = /^react-router(?:-dom)?$/;

const toRelative = (appDir, file) => path.relative(appDir, file).split(path.sep).join('/');
const packageOf = (spec) => (spec.startsWith('@') ? spec.split('/').slice(0, 2).join('/') : spec.split('/')[0]);
const pascal = (text) => text.split(/[-_]/).map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join('');
const capital = (name) => /^[A-Z]/.test(name);
const joinPath = (parts) => parts.reduce((parent, part) => {
  const base = parent.replace(/\/+$/, '') || '/';
  const child = `/${part}`.replace(/\/+/g, '/');
  if (part.startsWith('/') && (base === '/' || child === base || child.startsWith(`${base}/`))) return child;
  return `${base}/${part}`.replace(/\/+/g, '/');
}, '/');
/**
 * The component a wrapper call wraps: its first argument that starts with a capital, all capitals included (`BOM`), also inside a call among them
 * (`withStyles(styles)(Orders)`, `inject('store')(observer(Orders))`, `withAuth(Orders, ROLES)`, `memo(Orders, same)`); null for anything else.
 */
const wrapped = (node) => {
  if (!node || !ts.isCallExpression(node)) return null;
  for (const argument of node.arguments) {
    const inner = ts.isIdentifier(argument) ? (capital(argument.text) ? argument.text : null) : wrapped(argument);
    if (inner) return inner;
  }
  return null;
};

/** `baseUrl` and `paths` of the app's tsconfig.json, or else its jsconfig.json, as folders of the app. A linked or broken file is not read. */
function readAliases(appDir, notRead) {
  for (const name of ['tsconfig.json', 'jsconfig.json']) {
    const file = path.join(appDir, name);
    const entry = fs.lstatSync(file, { throwIfNoEntry: false });
    if (!entry) continue;
    if (entry.isSymbolicLink()) {
      notRead.push({ file: name, why: 'a link: not followed' });
      break;
    }
    if (!entry.isFile()) continue;
    const { config, error } = ts.parseConfigFileTextToJson(name, fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, ''));
    if (error) {
      notRead.push({ file: name, why: 'parse errors' });
      break;
    }
    const options = config?.compilerOptions ?? {};
    const baseUrl = typeof options.baseUrl === 'string' ? options.baseUrl.replace(/\\/g, '/') : null;
    const paths = Object.entries(options.paths ?? {}).filter(([, targets]) => Array.isArray(targets));
    return { baseUrl, paths: paths.map(([pattern, targets]) => [pattern, targets.filter((one) => typeof one === 'string').map((one) => path.posix.join(baseUrl ?? '.', one.replace(/\\/g, '/')))]) };
  }
  return { baseUrl: null, paths: [] };
}

/** The source files of an app, sorted, and whether the app carries the AtomicAUI library. A link is listed in notRead, not followed. */
function listFiles(appDir, ignore, hit, notRead) {
  const src = path.join(appDir, 'src');
  const base = fs.existsSync(src) && fs.statSync(src).isDirectory() ? src : appDir;
  if (base === src) {
    const relative = path.relative(fs.realpathSync.native(appDir), fs.realpathSync.native(src));
    if (relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) throw new Error('src folder resolves outside the app.');
  }
  const found = [];
  let atomicaui = false;
  const visit = (dir, top) => {
    const entries = fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => byCode(a.name, b.name));
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      const relative = toRelative(appDir, full);
      const ignored = ignore.find((prefix) => relative === prefix || relative.startsWith(`${prefix}/`));
      if (ignored) {
        hit.add(ignored);
        continue;
      }
      if (entry.isDirectory()) {
        if (SKIP_ANYWHERE.has(entry.name)) {
          if (entry.name === 'vendor' && fs.existsSync(path.join(full, 'atomic-aui'))) atomicaui = true;
          continue;
        }
        if (top && base === appDir && SKIP_TOP.has(entry.name)) continue;
        visit(full, false);
      } else if (entry.isFile() && SOURCE.test(entry.name) && !SKIP_FILE.test(entry.name)) {
        found.push(full);
      } else if (entry.isSymbolicLink() && !SKIP_ANYWHERE.has(entry.name) && !(top && base === appDir && SKIP_TOP.has(entry.name))) {
        notRead.push({ file: relative, why: 'a link: not followed' });
      }
    }
  };
  visit(base, true);
  return { files: found, atomicaui };
}

/** Every string literal and template text under a node. The callback returns nothing: forEachChild stops on a value. */
const literalTexts = (node, out = []) => {
  if (!node) return out;
  if (ts.isBinaryExpression(node) && [ts.SyntaxKind.EqualsEqualsToken, ts.SyntaxKind.EqualsEqualsEqualsToken, ts.SyntaxKind.ExclamationEqualsToken, ts.SyntaxKind.ExclamationEqualsEqualsToken].includes(node.operatorToken.kind)) {
    return out;
  }
  if (ts.isCaseClause(node)) {
    for (const statement of node.statements) literalTexts(statement, out);
    return out;
  }
  if (ts.isStringLiteralLike(node)) out.push(node.text);
  else if (node.kind === ts.SyntaxKind.TemplateHead || node.kind === ts.SyntaxKind.TemplateMiddle || node.kind === ts.SyntaxKind.TemplateTail) out.push(node.text);
  ts.forEachChild(node, (child) => void literalTexts(child, out));
  return out;
};

/**
 * @param {string} appDir absolute folder of the old app
 * @param {object} inputTables from loadTables()
 * @param {object} appMap the answers file (conversion/scan-map.json), or {}
 */
export function scanReact(appDir, inputTables, appMap = {}) {
  const tables = withMap(inputTables, appMap);
  const used = new Set();
  const warnings = new Set();
  const ignore = (appMap.ignore ?? []).map((one) => one.replace(/\\/g, '/').replace(/^\.\//, '').replace(/\/$/, ''));
  const ignoreHit = new Set();
  const notRead = [];
  const { files, atomicaui: vendored } = listFiles(appDir, ignore, ignoreHit, notRead);
  const fileSet = new Set(files.map((file) => toRelative(appDir, file)));
  const aliases = readAliases(appDir, notRead);
  const result = { files: files.length, elements: 0, findings: [], uses: [], routes: [], definitions: [], libraries: {}, notRead, atomicaui: vendored, reexports: [], hashRoots: [], used, unmatched: [], warnings: [] };

  // A bare import through the app's baseUrl or paths: the folders it may stand for, in the order TypeScript tries them.
  const configured = (spec) => {
    const out = [];
    for (const [pattern, targets] of aliases.paths) {
      const star = pattern.indexOf('*');
      const head = star < 0 ? pattern : pattern.slice(0, star);
      const tail = star < 0 ? '' : pattern.slice(star + 1);
      if (star < 0 ? spec !== pattern : !(spec.length >= head.length + tail.length && spec.startsWith(head) && spec.endsWith(tail))) continue;
      out.push(...targets.map((one) => one.replace('*', spec.slice(head.length, spec.length - tail.length))));
    }
    if (aliases.baseUrl !== null) out.push(path.posix.join(aliases.baseUrl, spec));
    return out.map((one) => path.posix.normalize(one));
  };
  const resolveLocal = (fromRelative, spec) => {
    const alias = ALIASES.find(([prefix]) => spec.startsWith(prefix));
    const bases = spec.startsWith('.') ? [path.posix.join(path.posix.dirname(fromRelative), spec)] : [...configured(spec), alias ? `${alias[1]}${spec.slice(alias[0].length)}` : spec];
    for (const base of bases.map((one) => path.posix.normalize(one))) for (const extension of EXTENSIONS) if (fileSet.has(`${base}${extension}`)) return `${base}${extension}`;
    return null;
  };
  // Local: a relative import, a known alias, or a bare import that baseUrl or paths turn into a file or folder of the app (read or not), never one in node_modules.
  const localSpecs = new Map();
  const isLocal = (spec) => {
    if (!localSpecs.has(spec)) {
      const inApp = (base) => base !== '..' && !base.startsWith('../') && !path.posix.isAbsolute(base) && !base.split('/').includes('node_modules') && EXTENSIONS.some((extension) => fs.existsSync(path.join(appDir, `${base}${extension}`)));
      localSpecs.set(spec, spec.startsWith('.') || ALIASES.some(([prefix]) => spec.startsWith(prefix)) || configured(spec).some(inApp));
    }
    return localSpecs.get(spec);
  };
  const importKind = (spec) => (spec.includes('vendor/atomic-aui') || packageOf(spec).includes('atomic-aui') ? 'atomicaui' : isLocal(spec) ? 'local' : 'package');

  for (const file of files) {
    const relative = toRelative(appDir, file);
    const extension = path.extname(file);
    const text = fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, '');
    const scriptKind = extension === '.tsx' ? ts.ScriptKind.TSX : extension === '.ts' ? ts.ScriptKind.TS : ts.ScriptKind.JSX;
    const source = ts.createSourceFile(relative, text, ts.ScriptTarget.Latest, true, scriptKind);
    if (source.parseDiagnostics?.length > 0) result.notRead.push({ file: relative, why: 'parse errors' });
    const lineOf = (node) => source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1;

    // 1 Imports, top-level declarations, constants (rules 2 and 3).
    const imports = new Map();
    const declared = new Set();
    const constants = new Map();
    const reexported = [];
    const note = (name, node, local) => {
      if (local) declared.add(name);
      if (capital(name)) result.definitions.push({ key: `${relative}#${name}`, name, file: relative, line: lineOf(node) });
    };
    const lazySpec = (initializer) => {
      if (!initializer || !ts.isCallExpression(initializer)) return null;
      const callee = initializer.expression.getText(source);
      if (callee !== 'lazy' && callee !== 'React.lazy') return null;
      let spec = null;
      const find = (node) => {
        if (spec) return;
        if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword && node.arguments[0] && ts.isStringLiteralLike(node.arguments[0])) spec = node.arguments[0].text;
        else ts.forEachChild(node, (child) => void find(child));
      };
      find(initializer);
      return spec;
    };
    for (const statement of source.statements) {
      if (ts.isImportDeclaration(statement) && ts.isStringLiteral(statement.moduleSpecifier) && statement.importClause && !statement.importClause.isTypeOnly) {
        const spec = statement.moduleSpecifier.text;
        const clause = statement.importClause;
        if (clause.name) imports.set(clause.name.text, { spec, imported: 'default' });
        if (clause.namedBindings && ts.isNamespaceImport(clause.namedBindings)) imports.set(clause.namedBindings.name.text, { spec, imported: '*' });
        if (clause.namedBindings && ts.isNamedImports(clause.namedBindings)) {
          for (const element of clause.namedBindings.elements) if (!element.isTypeOnly) imports.set(element.name.text, { spec, imported: (element.propertyName ?? element.name).text });
        }
      } else if (ts.isExportDeclaration(statement) && statement.moduleSpecifier && ts.isStringLiteral(statement.moduleSpecifier) && !statement.isTypeOnly) {
        const to = isLocal(statement.moduleSpecifier.text) ? resolveLocal(relative, statement.moduleSpecifier.text) : null;
        if (to) {
          if (statement.exportClause && ts.isNamedExports(statement.exportClause)) {
            for (const element of statement.exportClause.elements) result.reexports.push({ file: relative, to, exported: element.name.text, imported: (element.propertyName ?? element.name).text });
          } else if (!statement.exportClause) {
            result.reexports.push({ file: relative, to, exported: null, imported: null });
          }
        }
      } else if (ts.isExportDeclaration(statement) && !statement.moduleSpecifier && !statement.isTypeOnly && statement.exportClause && ts.isNamedExports(statement.exportClause)) {
        for (const element of statement.exportClause.elements) if (!element.isTypeOnly) reexported.push({ exported: element.name.text, inner: (element.propertyName ?? element.name).text, node: element, wrapper: false });
      } else if (ts.isFunctionDeclaration(statement) || ts.isClassDeclaration(statement)) {
        if (statement.name) {
          note(statement.name.text, statement.name, true);
          if (statement.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.DefaultKeyword)) result.reexports.push({ file: relative, to: relative, exported: 'default', imported: statement.name.text });
        } else if (statement.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.DefaultKeyword)) {
          result.definitions.push({ key: `${relative}#default`, name: 'default', file: relative, line: lineOf(statement) });
        }
      } else if (ts.isVariableStatement(statement)) {
        for (const declaration of statement.declarationList.declarations) {
          if (!ts.isIdentifier(declaration.name)) continue;
          const name = declaration.name.text;
          const spec = lazySpec(declaration.initializer);
          if (spec) {
            imports.set(name, { spec, imported: 'default' });
            continue;
          }
          constants.set(name, declaration.initializer);
          const inner = wrapped(declaration.initializer);
          if (inner) {
            declared.add(name);
            reexported.push({ exported: name, inner, node: declaration.name, wrapper: true });
          } else {
            note(name, declaration.name, true);
          }
        }
      } else if (ts.isExportAssignment(statement) && !statement.isExportEquals) {
        const inner = ts.isIdentifier(statement.expression) ? statement.expression.text : wrapped(statement.expression);
        if (inner) reexported.push({ exported: 'default', inner, node: statement, wrapper: !ts.isIdentifier(statement.expression) });
        else result.definitions.push({ key: `${relative}#default`, name: 'default', file: relative, line: lineOf(statement) });
      }
    }
    // An export that names another component (`export default Orders`, `export { View as Orders }`, `export default connect(map)(Orders)`)
    // is that component, in this file or the file it is imported from. A wrapper of nothing the scan can follow stays a definition of its own.
    for (const { exported, inner, node, wrapper } of reexported) {
      const found = imports.get(inner);
      const to = found ? (found.imported !== '*' && importKind(found.spec) === 'local' ? resolveLocal(relative, found.spec) : null) : declared.has(inner) ? relative : null;
      if (to && (to !== relative || inner !== exported)) result.reexports.push({ file: relative, to, exported, imported: found ? found.imported : inner });
      else if (wrapper && exported === 'default') result.definitions.push({ key: `${relative}#default`, name: 'default', file: relative, line: lineOf(node) });
      else if (wrapper) note(exported, node, false);
    }
    for (const name of Object.keys(appMap.components ?? {})) if (declared.has(name) || imports.has(name)) used.add(`components:${name}`);
    const importsRenderer = [...imports.values()].some((found) => tables.renderers.has(packageOf(found.spec)));
    if ([...imports.values()].some((found) => importKind(found.spec) === 'atomicaui')) result.atomicaui = true;
    const binds = (binding, name) => binding ? ts.isIdentifier(binding) ? binding.text === name : ts.isBindingPattern(binding) && binding.elements.some((element) => binds(element.name, name)) : false;
    const declares = (statement, name) => ts.isVariableStatement(statement) ? statement.declarationList.declarations.some((declaration) => binds(declaration.name, name)) : (ts.isFunctionDeclaration(statement) || ts.isClassDeclaration(statement)) && statement.name?.text === name;
    const hasHoistedVar = (body, name) => {
      let found = false;
      const visit = (node) => {
        if (found || (node !== body && ts.isFunctionLike(node))) return;
        if (ts.isVariableDeclaration(node) && !(node.parent.flags & ts.NodeFlags.BlockScoped) && binds(node.name, name)) found = true;
        ts.forEachChild(node, (child) => void visit(child));
      };
      visit(body);
      return found;
    };
    const boundAt = (node, name) => {
      if (imports.has(name)) return true;
      for (let scope = node.parent; scope; scope = scope.parent) {
        if (ts.isFunctionLike(scope) && (scope.parameters.some((parameter) => binds(parameter.name, name)) || scope.name && ts.isIdentifier(scope.name) && scope.name.text === name || scope.body && hasHoistedVar(scope.body, name))) return true;
        if (ts.isCatchClause(scope) && scope.variableDeclaration && binds(scope.variableDeclaration.name, name)) return true;
        if ((ts.isForStatement(scope) || ts.isForInStatement(scope) || ts.isForOfStatement(scope)) && scope.initializer && ts.isVariableDeclarationList(scope.initializer) && scope.initializer.declarations.some((declaration) => binds(declaration.name, name))) return true;
        if (ts.isCaseBlock(scope) && scope.clauses.some((clause) => clause.statements.some((statement) => declares(statement, name)))) return true;
        if ((ts.isBlock(scope) || ts.isSourceFile(scope)) && scope.statements.some((statement) => declares(statement, name))) return true;
      }
      return false;
    };

    // Class texts: the literals, and the literals of each same-file top-level constant the expression names (one step).
    const classTexts = (node) => {
      const out = literalTexts(node);
      const names = (at) => {
        if (ts.isIdentifier(at) && constants.has(at.text)) out.push(...literalTexts(constants.get(at.text)));
        ts.forEachChild(at, (child) => void names(child));
      };
      if (node) names(node);
      return out;
    };
    // The component an element is written in: the outermost top-level function, class or variable around it.
    const ownerOf = (node) => {
      let name = null;
      for (let at = node.parent; at && at !== source; at = at.parent) {
        if (at.parent === source && (ts.isFunctionDeclaration(at) || ts.isClassDeclaration(at))) name = at.name?.text ?? (at.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.DefaultKeyword) ? 'default' : null);
        if (at.parent === source && ts.isExportAssignment(at) && !ts.isIdentifier(at.expression)) name = 'default';
        if (ts.isVariableDeclaration(at) && at.parent?.parent?.parent === source && ts.isIdentifier(at.name)) name = at.name.text;
      }
      return `${relative}#${name ?? '(module)'}`;
    };
    const attributesOf = (opening) => {
      const map = new Map();
      for (const attribute of opening.attributes.properties) if (ts.isJsxAttribute(attribute)) map.set(attribute.name.getText(source), attribute.initializer ?? true);
      return map;
    };
    const stringOf = (initializer) => {
      if (initializer === undefined || initializer === true) return '';
      return literalTexts(initializer)[0] ?? '';
    };
    const typeOf = (initializer) => {
      if (initializer === undefined) return undefined;
      if (initializer === true) return null;
      if (ts.isJsxExpression(initializer)) return initializer.expression ? typeOf(initializer.expression) : null;
      if (ts.isParenthesizedExpression(initializer)) return typeOf(initializer.expression);
      return ts.isStringLiteralLike(initializer) ? initializer.text : null;
    };
    const enabled = (initializer) => initializer !== undefined && !(ts.isJsxExpression(initializer) && initializer.expression?.kind === ts.SyntaxKind.FalseKeyword) && stringOf(initializer) !== 'false';
    const falseValue = (initializer) => {
      if (!initializer || initializer === true) return false;
      if (ts.isJsxExpression(initializer) || ts.isParenthesizedExpression(initializer)) return falseValue(initializer.expression);
      return initializer.kind === ts.SyntaxKind.FalseKeyword || ts.isStringLiteralLike(initializer) && initializer.text === 'false';
    };
    const featureDisabled = (initializer) => {
      if (falseValue(initializer)) return true;
      const value = initializer && initializer !== true && ts.isJsxExpression(initializer) ? initializer.expression : initializer;
      return Boolean(value && value !== true && ts.isObjectLiteralExpression(value) && value.properties.some((property) => ts.isPropertyAssignment(property) && ((['visible', 'enabled'].includes(property.name.getText(source)) && falseValue(property.initializer)) || (property.name.getText(source) === 'mode' && typeOf(property.initializer) === 'none'))));
    };
    const featureElementDisabled = (attributes) => ['visible', 'enabled'].some((name) => falseValue(attributes.get(name))) || typeOf(attributes.get('mode')) === 'none';
    const classesOf = (attributes) => {
      const found = [];
      for (const name of ['className', 'class']) {
        const initializer = attributes.get(name);
        if (initializer && initializer !== true) found.push(...classTexts(initializer));
      }
      return found.flatMap((one) => one.split(/\s+/)).filter(Boolean);
    };
    const add = (node, kind, by, extra = {}) => result.findings.push({ kind, by, file: relative, line: lineOf(node), owner: ownerOf(node), ...extra });

    // 2 An element of the page (rules 4 to 7 and 17).
    const htmlElement = (node, opening, tag) => {
      const attributes = attributesOf(opening);
      const flag = (names) => names.some((name) => attributes.has(name));
      const classes = classesOf(attributes);
      const observation = {
        tag,
        role: stringOf(attributes.get('role')),
        type: typeOf(attributes.get('type')),
        classes,
        flags: {
          click: flag(CLICK),
          keys: flag(KEYS),
          drag: enabled(attributes.get('draggable')) || flag(DRAG),
          editable: enabled(attributes.get('contentEditable')),
          context: attributes.has('onContextMenu'),
          rawHtml: attributes.has('dangerouslySetInnerHTML'),
        },
      };
      let found = classify(observation, tables);
      const mappedElement = has(appMap.elements, tag);
      const mappedClasses = classes.filter((name) => has(appMap.classes, name));
      if (mappedElement) used.add(`elements:${tag}`);
      for (const name of mappedClasses) used.add(`classes:${name}`);
      if (found && !found.unknown) {
        if (mappedElement && appMap.elements[tag] !== found.kind) warnings.add(`answers file: element <${tag}> is already "${found.kind}" in the kit; yours is ignored.`);
        for (const name of mappedClasses) if (appMap.classes[name] !== found.kind) warnings.add(`answers file: class ${name} is already "${found.kind}" in the kit; yours is ignored.`);
      } else if (mappedElement) {
        found = appMap.elements[tag] === null ? null : { kind: appMap.elements[tag], by: `your map: <${tag}>` };
      } else if (mappedClasses.length) {
        const name = mappedClasses[0];
        found = appMap.classes[name] === null ? null : { kind: appMap.classes[name], by: `your map: class ${name}` };
      }
      if (found?.kind === 'drawing' && tag === 'svg') {
        // A size is a string ("24") or a number ({24}); both are read as a number.
        const sizeOf = (name) => {
          const initializer = attributes.get(name);
          if (!initializer || initializer === true) return Number.NaN;
          const expression = ts.isJsxExpression(initializer) ? initializer.expression : initializer;
          return expression && (ts.isNumericLiteral(expression) || ts.isStringLiteralLike(expression)) ? Number.parseFloat(expression.text) : Number.NaN;
        };
        const small = ['width', 'height'].some((name) => sizeOf(name) <= 48);
        if (small || attributes.has('aria-hidden') || classes.some((name) => name.includes('icon'))) found = { kind: 'icon', by: 'small <svg>' };
      }
      if (tag === 'tr' && found?.kind === 'clickable-box') found = { kind: 'row-click', by: 'click handler on <tr>' };
      if (found?.unknown && importsRenderer && (found.kind.startsWith('tag:') || found.kind.startsWith('element:'))) found = null;
      if (found) add(node, found.kind, found.by, found.unknown ? { unknown: true } : {});
      for (const one of behaviours(observation.flags)) add(node, one.kind, one.by);
    };

    // 3 A component: AtomicAUI, one of the app, or one of a package (rules 8 to 12 and 17). Returns true to leave its children unread.
    const component = (node, opening, tagText) => {
      const root = tagText.split('.')[0];
      const dotted = tagText.includes('.');
      const found = imports.get(root);
      if (!found && !declared.has(root)) return false;
      const sub = dotted ? tagText.slice(root.length + 1) : '';
      const name = found ? (found.imported === 'default' || found.imported === '*' ? (found.imported === '*' && sub ? sub.split('.')[0] : root) : found.imported) : root;
      const kind = found ? importKind(found.spec) : 'local';
      const mapped = has(appMap.components, name);
      if (mapped) used.add(`components:${name}`);
      if (kind === 'local') {
        if (mapped && appMap.components[name] !== null) add(node, appMap.components[name], `your map: ${name}`);
        const spec = found?.spec;
        const target = spec ? resolveLocal(relative, spec) : relative;
        if (target) {
          const to = `${target}#${found?.imported === 'default' ? 'default' : (found?.imported === '*' ? name : found?.imported) ?? root}`;
          result.uses.push({ from: ownerOf(node), to });
          if (hashed(node)) result.hashRoots.push(to);
        }
        return false;
      }
      if (kind === 'atomicaui') {
        const key = found.imported === '*' ? sub : dotted ? `${found.imported}.${sub}` : found.imported;
        const components = tables.libraries.atomicaui.components;
        if (has(components, key)) {
          if (mapped && appMap.components[name] !== components[key]) warnings.add(`answers file: component ${name} is already "${components[key]}" in the kit; yours is ignored.`);
          if (components[key] !== null) add(node, components[key], `AtomicAUI <${key}>`);
        } else if (mapped) {
          if (appMap.components[name] !== null) add(node, appMap.components[name], `your map: ${name}`);
        } else if (!dotted) {
          add(node, `library:atomic-aui:${key}`, `AtomicAUI <${key}>`, { unknown: true });
        }
        return false;
      }
      const pkg = packageOf(found.spec);
      result.libraries[pkg] = (result.libraries[pkg] ?? 0) + 1;
      const lib = has(tables.libraries, pkg) && !Array.isArray(tables.libraries[pkg]) ? tables.libraries[pkg] : {};
      const label = lib.name ?? pkg;
      const canonical = dotted ? tagText.split('.').pop() : found.imported === 'default' && found.spec !== pkg ? pascal(found.spec.split('/').pop()) : found.imported === 'default' || found.imported === '*' ? root : found.imported;
      const known = has(lib.components, canonical) ? lib.components[canonical] : has(lib.features, canonical) ? lib.features[canonical] : has(lib, 'any') ? lib.any : (lib.settings ?? []).includes(canonical) ? null : undefined;
      const kitKind = pkg === 'devextreme-react' && canonical === 'DateBox' ? dateBoxKind(typeOf(attributesOf(opening).get('type'))) : known;
      if (mapped && known !== undefined && appMap.components[name] !== kitKind) warnings.add(`answers file: component ${name} is already "${kitKind}" in the kit; yours is ignored.`);
      if (known === undefined && mapped) {
        if (appMap.components[name] !== null) add(node, appMap.components[name], `your map: ${name}`);
        return false;
      }
      if (has(lib.features, canonical) && featureElementDisabled(attributesOf(opening))) return true;
      let claimed = false;
      if (has(lib.components, canonical)) {
        const kindOf = kitKind;
        if (kindOf !== null) add(node, kindOf, `${label} <${canonical}>`);
        if (GRID_KINDS.has(kindOf)) {
          for (const [attribute, initializer] of attributesOf(opening)) if (has(lib.props, attribute) && !featureDisabled(initializer)) add(node, lib.props[attribute], `${label} <${canonical} ${attribute}>`);
        }
        claimed = Boolean(lib.claims?.includes(canonical));
      } else if (has(lib.features, canonical)) {
        add(node, lib.features[canonical], `${label} <${canonical}>`);
      } else if (has(lib, 'any')) {
        if (lib.any !== null) add(node, lib.any, `${label} <${canonical}>`);
      } else if (!(lib.settings ?? []).includes(canonical)) {
        add(node, `library:${pkg}:${canonical}`, `${label} <${canonical}>`, { unknown: true });
      }
      return claimed;
    };

    // 4 Routes (rule 13).
    const targetOf = (tag) => {
      const root = tag.split('.')[0];
      const found = imports.get(root);
      if (!found) return declared.has(root) ? { name: tag, key: `${relative}#${root}` } : null;
      if (importKind(found.spec) !== 'local') return null;
      const to = resolveLocal(relative, found.spec);
      return to ? { name: tag, key: `${to}#${found.imported === 'default' ? 'default' : found.imported}` } : null;
    };
    // Capitalised tags: the ones outside attribute values first (the page), then those inside them (a Suspense fallback).
    const tagsIn = (...nodes) => {
      const outside = [];
      const inside = [];
      const walk = (node, out) => {
        const opening = ts.isJsxElement(node) ? node.openingElement : ts.isJsxSelfClosingElement(node) ? node : null;
        if (opening && capital(opening.tagName.getText(source))) out.push(opening.tagName.getText(source));
        ts.forEachChild(node, (child) => void walk(child, ts.isJsxAttributes(child) ? inside : out));
      };
      for (const node of nodes) if (node) walk(node, outside);
      return [...outside, ...inside];
    };
    // `own` are the route's own elements, `targets` also its parent layouts. A route's router: `from` is the component that renders a route list
    // relative to its parent route (JSX routes, useRoutes); `hash` is a hash router's route.
    const addRoute = (node, routePath, ownTags, ancestors, router) => {
      const own = ownTags.map(targetOf).filter(Boolean);
      const targets = [...own, ...ancestors.map(targetOf).filter(Boolean)];
      if (targets.length === 0) return;
      result.routes.push({ path: routePath, component: targets[0].name, file: relative, line: lineOf(node), targets: targets.map((one) => one.key), own: own.map((one) => one.key), from: router.from, hash: router.hash });
    };
    const hashScopes = new Set();
    const hashed = (node) => {
      for (let at = node; at; at = at.parent) if (hashScopes.has(at)) return true;
      return false;
    };
    const routerJsxName = (tag) => {
      const [root, member] = tag.split('.');
      const found = imports.get(root);
      if (!member) return found && REACT_ROUTER.test(found.spec) ? found.imported : tag;
      return found?.imported === '*' && REACT_ROUTER.test(found.spec) ? member : null;
    };
    const isRoute = (tag) => {
      const name = routerJsxName(tag);
      return name === 'Route' || /^[A-Z][A-Za-z]*Route$/.test(name ?? '');
    };
    const routePath = (initializer) => initializer && initializer !== true ? ts.isStringLiteralLike(initializer) ? initializer.text : ts.isJsxExpression(initializer) && initializer.expression && ts.isStringLiteralLike(initializer.expression) ? initializer.expression.text : '(computed)' : '';
    const routeTags = (node, opening) => {
      const attributes = attributesOf(opening);
      const element = attributes.get('element');
      const reference = attributes.get('component') ?? attributes.get('Component');
      const rendered = attributes.get('render');
      return element && element !== true ? tagsIn(element) : reference && reference !== true && ts.isJsxExpression(reference) && reference.expression && ts.isIdentifier(reference.expression) ? [reference.expression.text] : rendered && rendered !== true ? tagsIn(rendered) : ts.isJsxElement(node) ? tagsIn(...node.children.filter((child) => !(ts.isJsxElement(child) && isRoute(child.openingElement.tagName.getText(source))))) : [];
    };
    const jsxRoute = (node, opening) => {
      const parts = [];
      const ancestors = [];
      for (let at = node; at; at = at.parent) {
        const enclosing = ts.isJsxElement(at) ? at.openingElement : ts.isJsxSelfClosingElement(at) ? at : null;
        if (enclosing && isRoute(enclosing.tagName.getText(source))) {
          const attribute = enclosing.attributes.properties.find((one) => ts.isJsxAttribute(one) && one.name.getText(source) === 'path');
          const value = routePath(attribute?.initializer);
          if (value) parts.unshift(value);
          if (at !== node) ancestors.push(...routeTags(at, enclosing));
        }
      }
      addRoute(opening, joinPath(parts), routeTags(node, opening), ancestors, { from: ownerOf(node), hash: hashed(node) });
    };
    const objectViewTags = (node) => {
      const property = (name) => node.properties.find((one) => (ts.isPropertyAssignment(one) || ts.isShorthandPropertyAssignment(one)) && one.name.getText(source) === name);
      const view = property('element') ?? property('Component') ?? property('component');
      if (!view) return [];
      const value = ts.isShorthandPropertyAssignment(view) ? view.name : view.initializer;
      return ts.isIdentifier(value) ? [value.text] : tagsIn(value);
    };
    const objectRoute = (node, routePath, ancestors, router) => {
      const property = (name) => node.properties.find((one) => (ts.isPropertyAssignment(one) || ts.isShorthandPropertyAssignment(one)) && one.name.getText(source) === name);
      const own = property('path');
      const index = property('index');
      if (!own && !(index && ts.isPropertyAssignment(index) && index.initializer.kind === ts.SyntaxKind.TrueKeyword)) return;
      addRoute(node, routePath, objectViewTags(node), ancestors, router);
    };

    // 5 Calls (rule 14).
    const call = (node) => {
      const callee = node.expression;
      if (ts.isIdentifier(callee)) {
        const found = imports.get(callee.text);
        if (found) {
          const lib = tables.libraries[packageOf(found.spec)];
          for (const candidate of [found.imported, callee.text, found.spec.split('/').pop()]) {
            if (lib?.calls && has(lib.calls, candidate)) {
              add(node, lib.calls[candidate], `${lib.name} ${candidate}()`);
              return;
            }
          }
        } else if (NATIVE.includes(callee.text) && !boundAt(node, callee.text)) {
          add(node, 'native-dialog', `${callee.text}()`);
        }
        return;
      }
      if (!ts.isPropertyAccessExpression(callee)) return;
      const name = callee.name.text;
      if (ts.isIdentifier(callee.expression)) {
        const holder = callee.expression.text;
        const found = imports.get(holder);
        if (found) {
          const lib = tables.libraries[packageOf(found.spec)];
          if (lib?.calls && has(lib.calls, name)) add(node, lib.calls[name], `${lib.name} ${holder}.${name}()`);
        } else if (holder === 'window' && NATIVE.includes(name) && !boundAt(node, 'window')) {
          add(node, 'native-dialog', `window.${name}()`);
        }
      }
      if (has(tables.jqueryPlugins, name) && ts.isCallExpression(callee.expression) && ts.isIdentifier(callee.expression.expression) && ['$', 'jQuery'].includes(callee.expression.expression.text)) {
        const options = node.arguments[0];
        const typeProperty = options && ts.isObjectLiteralExpression(options) ? options.properties.find((property) => ts.isPropertyAssignment(property) && property.name.getText(source) === 'type') : null;
        const kind = name === 'dxDateBox' ? options && !ts.isObjectLiteralExpression(options) ? 'datebox' : dateBoxKind(typeProperty ? typeOf(typeProperty.initializer) : undefined) : tables.jqueryPlugins[name];
        add(node, kind, `jQuery .${name}()`);
      }
    };

    const routerMethods = new Set(['createBrowserRouter', 'createHashRouter', 'createMemoryRouter', 'useRoutes']);
    const routerMethod = (callee) => {
      const [holder, name] = ts.isIdentifier(callee) ? [callee, null] : ts.isPropertyAccessExpression(callee) && ts.isIdentifier(callee.expression) ? [callee.expression, callee.name.text] : [null, null];
      const found = holder ? imports.get(holder.text) : null;
      if (!found || !REACT_ROUTER.test(found.spec)) return null;
      const method = name === null ? found.imported : found.imported === '*' ? name : null;
      return routerMethods.has(method) ? method : null;
    };
    const routeNodes = new Map();
    const variableValue = (node) => {
      for (let scope = node.parent; scope; scope = scope.parent) {
        if (ts.isBlock(scope) || ts.isSourceFile(scope)) {
          for (const statement of scope.statements) {
            if (!ts.isVariableStatement(statement)) continue;
            for (const declaration of statement.declarationList.declarations) {
              if (ts.isIdentifier(declaration.name) && declaration.name.text === node.text) return declaration.initializer;
            }
          }
        }
        if (ts.isFunctionLike(scope) && scope.parameters.some((parameter) => ts.isIdentifier(parameter.name) && parameter.name.text === node.text)) return null;
      }
      return null;
    };
    const markRoutes = (node, router = { from: null, hash: false }, parts = [], ancestors = [], seen = new Set()) => {
      if (!node || seen.has(node)) return;
      seen.add(node);
      if (ts.isIdentifier(node)) {
        markRoutes(variableValue(node), router, parts, ancestors, seen);
      } else if (ts.isCallExpression(node)) {
        const method = routerMethod(node.expression);
        if (method) markRoutes(node.arguments[0], { from: method === 'useRoutes' ? ownerOf(node) : null, hash: method === 'createHashRouter' }, parts, ancestors, seen);
        else if (router.hash) hashScopes.add(node);
      } else if (ts.isArrayLiteralExpression(node)) {
        for (const element of node.elements) markRoutes(element, router, parts, ancestors, seen);
      } else if (ts.isObjectLiteralExpression(node)) {
        const pathProperty = node.properties.find((property) => (ts.isPropertyAssignment(property) || ts.isShorthandPropertyAssignment(property)) && property.name.getText(source) === 'path');
        const ownPath = !pathProperty ? null : ts.isPropertyAssignment(pathProperty) && ts.isStringLiteralLike(pathProperty.initializer) ? pathProperty.initializer.text : '(computed)';
        const nextParts = ownPath === null ? parts : [...parts, ownPath];
        const paths = routeNodes.get(node) ?? new Map();
        paths.set(joinPath(nextParts), { ancestors, router });
        routeNodes.set(node, paths);
        const children = node.properties.find((property) => (ts.isPropertyAssignment(property) || ts.isShorthandPropertyAssignment(property)) && property.name.getText(source) === 'children');
        if (children) markRoutes(ts.isShorthandPropertyAssignment(children) ? children.name : children.initializer, router, nextParts, [...objectViewTags(node), ...ancestors], seen);
      } else if (ts.isSpreadElement(node) || ts.isParenthesizedExpression(node) || ts.isAsExpression(node) || ts.isSatisfiesExpression(node) || ts.isJsxExpression(node)) {
        markRoutes(node.expression, router, parts, ancestors, seen);
      }
      seen.delete(node);
    };
    const findRouterRoots = (node) => {
      if (ts.isCallExpression(node) && routerMethod(node.expression)) markRoutes(node);
      if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node)) {
        const opening = ts.isJsxElement(node) ? node.openingElement : node;
        const tag = opening.tagName.getText(source);
        const found = imports.get(tag.split('.')[0]);
        if (found && REACT_ROUTER.test(found.spec) && routerJsxName(tag) === 'RouterProvider') markRoutes(attributesOf(opening).get('router'));
        if (found && REACT_ROUTER.test(found.spec) && routerJsxName(tag) === 'HashRouter') hashScopes.add(node);
      }
      ts.forEachChild(node, (child) => void findRouterRoots(child));
    };
    findRouterRoots(source);

    const visit = (node) => {
      let skip = false;
      if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node)) {
        const opening = ts.isJsxElement(node) ? node.openingElement : node;
        const tagText = opening.tagName.getText(source);
        result.elements += 1;
        if (/^[a-z][^.]*$/.test(tagText)) htmlElement(node, opening, tagText);
        else {
          skip = component(node, opening, tagText);
          if (isRoute(tagText) && (attributesOf(opening).has('path') || attributesOf(opening).has('index'))) jsxRoute(node, opening);
        }
      } else if (ts.isCallExpression(node)) {
        call(node);
      } else if (ts.isObjectLiteralExpression(node) && routeNodes.has(node)) {
        for (const [routePath, { ancestors, router }] of routeNodes.get(node)) objectRoute(node, routePath, ancestors, router);
      }
      if (!skip) ts.forEachChild(node, (child) => void visit(child));
    };
    visit(source);
  }

  // React Router v6 descendant routes: a route list rendered inside the own page of a splat route (`/admin/*`), not its parent layouts,
  // lives under the nearest such route's path, through every component between them, and on its router. A hash router (createHashRouter, or anything rendered inside <HashRouter>) serves `#/` addresses.
  const reach = makeReach(result);
  const hashKeys = reach(result.hashRoots);
  const splats = result.routes.filter((route) => /(^|\/)\*$/.test(route.path)).map((route) => ({ route, reached: reach(route.own) }));
  const placed = (route, visiting) => {
    const hash = route.hash || hashKeys.has(route.from);
    const next = new Set([...visiting, route]);
    const candidates = route.from ? splats.filter((one) => one.reached.has(route.from) && !next.has(one.route)) : [];
    const parents = candidates.filter((one) => !candidates.some((other) => other !== one && one.reached.has(other.route.from)));
    if (parents.length === 0) return [{ path: route.path, hash }];
    return parents.flatMap((one) => placed(one.route, next).map((parent) => {
      const base = parent.path.replace(/\/?\*$/, '') || '/';
      return { path: route.path === '/' ? base : joinPath([base, route.path]), hash: hash || parent.hash };
    }));
  };
  result.routes = result.routes.flatMap((route) => [...new Map(placed(route, new Set()).map((one) => [`${one.hash}${one.path}`, one])).values()].map((one) => ({ ...route, ...one })));

  // A mapped component counts at its uses; what is written inside its own definition is left out.
  const inside = new Set(Object.entries(appMap.components ?? {}).filter(([, kind]) => kind !== null).map(([name]) => name));
  if (inside.size > 0) result.findings = result.findings.filter((finding) => !inside.has(finding.owner.slice(finding.owner.indexOf('#') + 1)) || finding.by.startsWith('your map:'));
  // Names in the answers file that matched nothing (a typo must not silently change nothing).
  const wanted = [
    ...Object.keys(appMap.components ?? {}).map((name) => `components:${name}`),
    ...Object.keys(appMap.classes ?? {}).map((name) => `classes:${name}`),
    ...Object.keys(appMap.elements ?? {}).map((name) => `elements:${name}`),
    ...ignore.map((one) => `ignore:${one}`),
  ];
  for (const one of ignoreHit) used.add(`ignore:${one}`);
  result.unmatched = wanted.filter((one) => !used.has(one)).map((one) => one.replace(':', ' '));
  result.warnings = [...warnings].sort(byCode);
  result.findings.sort((a, b) => byCode(a.file, b.file) || a.line - b.line || byCode(a.kind, b.kind) || byCode(a.by, b.by));
  result.definitions.sort((a, b) => byCode(a.key, b.key));
  return result;
}
