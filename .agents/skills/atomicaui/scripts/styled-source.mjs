// Reads the looks a React source file sets: every `aui` on a View, every Type, and every styled-piece marker.
// Constants are followed inside the file (and inside `shared`, the kit's own look constants).
// Used by `npm run check` for styled pieces and by the maintainers' usage-profile script. Needs the typescript package.
import ts from 'typescript';
import { usesOfType, usesOfView } from './styled-rules.mjs';

const strip = (node) => {
  while (node && (ts.isAsExpression(node) || ts.isParenthesizedExpression(node) || ts.isSatisfiesExpression(node))) node = node.expression;
  return node;
};

/** Top-level look constants (`const NAME = { ... }`, `const NAME = '...'`) and small functions of one file, added to `into` (name to syntax node). */
export function collectConstants(sourceFile, into = new Map()) {
  for (const statement of sourceFile.statements) {
    if (ts.isFunctionDeclaration(statement) && statement.name && statement.body) into.set(statement.name.text, statement);
    if (!ts.isVariableStatement(statement)) continue;
    for (const declaration of statement.declarationList.declarations) {
      const initializer = strip(declaration.initializer);
      if (ts.isIdentifier(declaration.name) && initializer && (ts.isObjectLiteralExpression(initializer) || ts.isStringLiteral(initializer) || ts.isArrowFunction(initializer))) into.set(declaration.name.text, initializer);
    }
  }
  return into;
}

/** What a small function can return: `tone(passed)` that returns 'success' or 'error' is both. */
function returned(node, constants, depth) {
  if (ts.isArrowFunction(node) && !ts.isBlock(node.body)) return literal(node.body, constants, depth + 1);
  const found = [];
  const visit = (child) => {
    if (ts.isFunctionLike(child) && child !== node) return;
    if (ts.isReturnStatement(child) && child.expression) found.push(literal(child.expression, constants, depth + 1));
    ts.forEachChild(child, visit);
  };
  if (node.body) visit(node.body);
  return found.length === 0 ? '$expression' : found.length === 1 ? found[0] : { $if: found };
}

/** A syntax node as plain data. A condition becomes { $if: [a, b] }; anything that cannot be read becomes a string that starts with `$`. */
function literal(node, constants, depth = 0) {
  node = strip(node);
  if (!node) return undefined;
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
  if (ts.isNumericLiteral(node)) return Number(node.text);
  if (ts.isIdentifier(node)) return depth < 6 && constants.has(node.text) ? literal(constants.get(node.text), constants, depth + 1) : `$${node.text}`;
  if (ts.isFunctionLike(node)) return '$function';
  if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && depth < 6 && constants.has(node.expression.text) && ts.isFunctionLike(constants.get(node.expression.text))) return returned(constants.get(node.expression.text), constants, depth);
  if (ts.isPropertyAccessExpression(node)) {
    const base = literal(node.expression, constants, depth + 1);
    return base && typeof base === 'object' && node.name.text in base ? base[node.name.text] : '$expression';
  }
  if (ts.isElementAccessExpression(node)) {
    // LOOKS[level]: a table of named looks. Every row can be the value.
    const base = literal(node.expression, constants, depth + 1);
    const rows = base && typeof base === 'object' && !base.$if ? Object.values(base).filter((row) => row && typeof row === 'object') : [];
    return rows.length > 0 ? { $if: rows } : '$expression';
  }
  if (ts.isConditionalExpression(node)) return { $if: [literal(node.whenTrue, constants, depth + 1), literal(node.whenFalse, constants, depth + 1)] };
  if (ts.isObjectLiteralExpression(node)) {
    const out = {};
    for (const property of node.properties) {
      if (ts.isSpreadAssignment(property)) {
        const spread = literal(property.expression, constants, depth + 1);
        if (spread && typeof spread === 'object' && !spread.$if) Object.assign(out, spread);
        else out.$open = true; // a spread that cannot be followed: the look is not fully known
      } else if (ts.isPropertyAssignment(property)) {
        out[property.name.getText().replace(/['"]/g, '')] = literal(property.initializer, constants, depth + 1);
      }
    }
    return out;
  }
  return '$expression';
}

/** A look whose axes may hold conditions, as every plain look it can be (at most 16). */
function variants(value) {
  if (!value || typeof value !== 'object') return [];
  if (value.$if) return value.$if.flatMap(variants).slice(0, 16);
  let found = [{}];
  for (const [key, one] of Object.entries(value)) {
    const flat = (option) => (option && typeof option === 'object' && option.$if ? option.$if.flatMap(flat) : [option]);
    const options = key === 'sx' && one && typeof one === 'object' && !one.$if ? variants(one) : flat(one);
    found = found.flatMap((look) => options.map((option) => ({ ...look, [key]: option }))).slice(0, 16);
  }
  return found;
}

/**
 * Returns { uses, markers }.
 *   uses     [{ set, key, line }]  usage-profile keys of every View look and every Type in the file
 *   markers  [{ name, line }]      every data-aui-styled="<name>"
 */
export function readSource(file, text, shared = new Map()) {
  const sourceFile = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, /\.[jt]s$/.test(file) ? ts.ScriptKind.TS : ts.ScriptKind.TSX);
  const constants = collectConstants(sourceFile, new Map(shared));
  const uses = [];
  const markers = [];
  const lineOf = (node) => sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1;
  const visit = (node) => {
    if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
      const tag = node.tagName.getText(sourceFile);
      const line = lineOf(node);
      const read = {};
      for (const attribute of node.attributes.properties) {
        if (!ts.isJsxAttribute(attribute)) continue;
        const name = attribute.name.getText(sourceFile);
        const initializer = attribute.initializer;
        read[name] = initializer === undefined ? true : literal(ts.isJsxExpression(initializer) ? initializer.expression : initializer, constants);
      }
      if (typeof read['data-aui-styled'] === 'string') markers.push({ name: read['data-aui-styled'], line });
      if (tag === 'View') for (const look of variants(read.aui ?? {})) for (const use of usesOfView(look)) uses.push({ ...use, line });
      if (tag === 'Type') {
        const sx = variants(read.aui ?? {}).map((look) => look.sx).find((one) => one && typeof one === 'object');
        for (const role of variants({ role: read.role, weight: read.weight, color: read.color })) for (const use of usesOfType({ ...role, sx })) uses.push({ ...use, line });
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return { uses, markers };
}
