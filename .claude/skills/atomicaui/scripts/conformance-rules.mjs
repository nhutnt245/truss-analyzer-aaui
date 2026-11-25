// The rules of the token check, as pure functions over what scripts/conformance-page.mjs returns (what a page renders)
// and the reference kit/standard/theme.json (what the kit's own AtomicAUI build allows: scripts/conformance-reference.mjs).
// A page passes when what it paints is a value of that reference, in light and in dark. No value is taken from the page as allowed.
// It reads values, not class names, so it holds for a page on any stack. Every problem is { rule, view, message, fix }.
// C1 a colour that is no theme role (a mark of a chart series may also take a colour of the library's default chart palette). C2 a colour that does not change with the theme. C3 a font that is not an AtomicAUI one.
// C4 a size and line that is no type role. C5 a corner that is no shape step. C6 a shadow outside a floating layer, or one that is no elevation of the library.
// C0 the page carries no theme, or a brand the reference does not have. C7 the page is not in the theme that was asked.
// The base palette (--p-palette-*) is never accepted: only the roles the theme itself names.

/** "rgb(30, 64, 175)", "rgba(30, 64, 175, 0.5)", "rgb(30 64 175 / 50%)" or "color(srgb 0.1 0.2 0.3 / 0.5)" as { r, g, b, a } (0 to 255, alpha 0 to 1); null when it is none of those. */
export function parseColour(text) {
  const one = /^(rgba?|color)\(([^)]*)\)$/i.exec(String(text).trim());
  if (!one) return null;
  const isColor = one[1].toLowerCase() === 'color';
  let body = one[2].trim();
  if (isColor && !/^srgb\s/.test(body)) return null;
  if (isColor) body = body.slice(4).trim();
  const [channels, slashed] = body.split('/').map((part) => part.trim());
  const parts = channels.split(/[\s,]+/).filter(Boolean);
  const [r, g, b] = parts.slice(0, 3).map((value) => Number(value.replace('%', '')) * (isColor ? 255 : 1));
  if (parts.length < 3 || [r, g, b].some(Number.isNaN)) return null;
  const alpha = slashed ?? parts[3];
  const a = alpha === undefined ? 1 : alpha.includes('%') ? Number(alpha.replace('%', '')) / 100 : Number(alpha);
  return { r: Math.round(r), g: Math.round(g), b: Math.round(b), a: Number.isNaN(a) ? 1 : a };
}

const same = (one, other) => one.r === other.r && one.g === other.g && one.b === other.b;
const show = (colour) => `rgb(${colour.r}, ${colour.g}, ${colour.b})`;

/** The roles that are solid colours: the shadow and transparent roles carry an alpha, they are not a colour to paint with. */
export function solidRoles(roles) {
  return Object.entries(roles).map(([name, value]) => ({ name, colour: parseColour(value) })).filter((role) => role.colour && role.colour.a === 1);
}

/** A colour in CIE Lab (D65): equal distances look about equally different, which a distance in rgb does not give. */
function lab({ r, g, b }) {
  const linear = [r, g, b].map((value) => { const c = value / 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; });
  const xyz = [(0.4124 * linear[0] + 0.3576 * linear[1] + 0.1805 * linear[2]) / 0.95047, 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2], (0.0193 * linear[0] + 0.1192 * linear[1] + 0.9505 * linear[2]) / 1.08883];
  const [fx, fy, fz] = xyz.map((value) => (value > 0.008856 ? Math.cbrt(value) : 7.787 * value + 16 / 116));
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}

/** The role nearest to a colour, as "--theme-surface (rgb(250, 250, 250))". */
export function nearestRole(colour, roles) {
  const solid = solidRoles(roles);
  const from = lab(colour);
  const distance = (role) => lab(role.colour).reduce((sum, value, at) => sum + (value - from[at]) ** 2, 0);
  const best = solid.reduce((close, role) => (distance(role) < distance(close) ? role : close));
  return `--theme-${best.name} (${show(best.colour)})`;
}

/** Is this colour a value of the theme: clear, or one whose opaque form is a role (the role itself, or a state layer over it: what color-mix(in srgb, <role> N%, transparent) computes to)? */
function isRole(colour, roles) {
  return colour.a === 0 || solidRoles(roles).some((role) => same(role.colour, colour));
}

/** Is this colour a shadow role (--theme-shadow-*), alpha included? */
function isShadowRole(colour, roles) {
  return Object.entries(roles).some(([name, value]) => {
    const role = name.startsWith('shadow-') ? parseColour(value) : null;
    return role !== null && same(role, colour) && role.a === colour.a;
  });
}

// A Fix line names a kit file only by where it is in both layouts: the starter (kit/) and an app that got the kit as a skill (references/).
const STANDARD = 'the standard folder (kit/standard/ in the starter, references/standard/ in the skill)';

const FIX = {
  C1: 'Take the nearest role: through the aui prop, or var(--theme-<role>) in your own CSS. Never a hex value, never a --p-palette-* value (the base palette is not a role), and never a --theme-* variable your own CSS adds or changes: a role is what AtomicAUI itself gives it.',
  C2: 'Use the role, not its value: a role changes with the theme, a fixed colour does not. In your own CSS write var(--theme-<role>); the theme attribute on <html> does the rest.',
  C3: 'Use the page font (Inter) or the mono font (JetBrains Mono) through the type role: <Type> in React, or the aui-typography-typescale-* class on a page without React. Never a font-family of your own.',
  C4: `Use a type role: a size and line pair of the type scale. <Type> in React, an aui-typography-typescale-* class otherwise. Never a size or line height of your own, and never a line height left at normal. A native <select> keeps normal whatever the page sets: appearance: none frees a drop-down one; nothing frees the options of a list <select> (multiple, or size above 1). There, or instead of both, use the select the library draws: the Select part in React, or on a page without React the select recipe in recipes/field.md of ${STANDARD}.`,
  C5: 'Use a shape: none (0), soft (4), smooth (8) or pill. A radius of exactly 50%, the circle the library draws, counts as pill; no other percentage does. In React the aui prop (shape), otherwise an aui-shape-* class.',
  C6: 'Delete the shadow: a card or a box sits flat. Only a floating layer (a menu, popup, dialog or toast the library draws in its own portal) has an elevation, and only the library\'s own: an aui-elevation-<n> class as it is, never a box-shadow you wrote.',
  C0: `Put data-aui-brand, data-aui-theme, data-aui-typeface and data-aui-typography on <html>, with a brand AtomicAUI has (page.html in ${STANDARD} shows them).`,
  C7: 'Make the page take its theme from the address: ?theme=light or ?theme=dark sets data-aui-theme on <html>. On a page without React load aui/aui-theme.js in <head> (it does this); in an app with its own theme state, start that state from the address.',
};

function find(view, code, message) {
  return { rule: code === 'C7' ? 'AUI-10' : 'AUI-02', view, message: `${message} [${code}]`, fix: FIX[code] };
}

const shadowKey = (layers) => JSON.stringify(layers.map(({ colour, lengths }) => [colour, lengths]));

/** Every colour one measured box paints, as [what, value, is it a shadow]: the same list, in the same order, for the same box in the other theme. */
function paints(item) {
  return [
    ['Text colour', item.text],
    ['Fill', item.fill],
    ['Stroke', item.stroke],
    ['Outline colour', item.outline],
    ...item.borders.map((border) => ['Border colour', border]),
    ...item.gradients.map((stop) => ['Gradient colour', stop]),
    ...shadowLayers(item.shadow).filter((layer) => layer.inset).map((layer) => ['Shadow colour', layer.text, true]),
    ...shadowLayers(item.textShadow).map((layer) => ['Text shadow colour', layer.text, true]),
  ].filter(([, value]) => value);
}

/**
 * C0, C1, and C3 to C7 over one measurement of one view in one theme.
 * `measured` is what scripts/conformance-page.mjs returned; `view` is the name of the measurement (view, size and theme);
 * `theme` is the theme that was asked for; `reference` is kit/standard/theme.json.
 */
export function checkTokens(view, measured, theme, reference) {
  const found = [];
  if (!measured.themed) return [find(view, 'C0', 'No element carries data-aui-theme, so the page has no theme to compare with and nothing was compared.')];
  if (measured.theme !== theme) return [find(view, 'C7', `The page is in the theme "${measured.theme}" where ${theme} was asked (?theme=${theme} in the address), so ${theme} was not measured.`)];
  const themed = reference.themes[measured.brand]?.[theme];
  if (!themed) return [find(view, 'C0', `The page carries data-aui-brand="${measured.brand}": AtomicAUI ${reference.atomicaui} has no such brand (it has ${Object.keys(reference.themes).join(', ')}), so nothing was compared.`)];
  const add = (rule, message) => found.push(find(view, rule, message));
  const { roles } = themed;
  const palette = themed.chart.map(parseColour);
  const { types, shapes, families, iconFamilies } = reference;
  const elevations = themed.elevations.map((level) => ({ ...level, layers: shadowLayers(level.shadow) }));
  for (const item of measured.elements) {
    for (const [what, value, shadow] of paints(item)) {
      const colour = parseColour(value);
      if (!colour) {
        add('C1', `${what} ${value} on ${item.element} is not a colour the check can read, so it is no theme role.`);
      } else if (!isRole(colour, roles) && !(shadow && isShadowRole(colour, roles)) && !(item.series && palette.some((one) => same(one, colour)))) {
        add('C1', `${what} ${show(colour)}${colour.a < 1 ? ` (alpha ${colour.a})` : ''} on ${item.element} is no theme role. Nearest: ${nearestRole(colour, roles)}.`);
      }
    }
    const isIcon = iconFamilies.includes(item.family);
    if (item.family && !isIcon && !families.includes(item.family)) {
      add('C3', `Font ${item.family} on ${item.element} is not an AtomicAUI font. Nearest: ${families[0]}.`);
    }
    if (item.text && !isIcon && !types.some((role) => role.size === item.size && role.line === item.line)) {
      const line = item.line === 'normal' ? 0 : item.line;
      const near = types.reduce((close, role) => (Math.abs(role.size - item.size) * 4 + Math.abs(role.line - line) < Math.abs(close.size - item.size) * 4 + Math.abs(close.line - line) ? role : close), types[0]);
      const why = item.line === 'normal' ? ': its line height is normal' : '';
      add('C4', `Text ${item.size} / ${item.line} on ${item.element} is no type role${why}. Nearest: ${near.name} (${near.size} / ${near.line}).`);
    }
    const steps = shapes.map((shape) => shape.radius);
    const pill = Math.max(0, ...steps);
    for (const radius of new Set(item.radius.map(String))) {
      const value = Number.isNaN(Number(radius)) ? radius : Number(radius);
      if (value === 0 || value === '50%' || (typeof value === 'number' && (steps.includes(value) || value >= pill))) continue;
      if (typeof value === 'string') {
        add('C5', `Corner radius ${value} on ${item.element} is no shape step. Nearest: pill (${pill} px).`);
        continue;
      }
      const near = shapes.reduce((close, shape) => (Math.abs(shape.radius - value) < Math.abs(close.radius - value) ? shape : close), shapes[0]);
      add('C5', `Corner radius ${value} px on ${item.element} is no shape step. Nearest: ${near.name} (${near.radius} px).`);
    }
    const cast = shadowLayers(item.shadow).filter((layer) => !layer.inset);
    if (cast.length > 0 && !item.floating) {
      add('C6', `Shadow ${item.shadow} on ${item.element}, which is not a floating layer. Nearest: none.`);
    } else if (cast.length > 0 && !elevations.some((level) => shadowKey(level.layers) === shadowKey(cast))) {
      const blur = (drawn) => drawn[0]?.lengths[2] ?? 0;
      const near = elevations.reduce((close, level) => (Math.abs(blur(level.layers) - blur(cast)) < Math.abs(blur(close.layers) - blur(cast)) ? level : close));
      add('C6', `Shadow ${item.shadow} on ${item.element} is no elevation of the library. Nearest: aui-elevation-${near.name} (${near.shadow}).`);
    }
  }
  return found;
}

/**
 * The layers of a computed box-shadow or text-shadow that are drawn: a colour with alpha above 0 (or one the check cannot read) and a length above 0.
 * Each is { inset, text, colour, lengths }. An inset layer is a marker (the stripe of a picked row, a ring), not an elevation: its colour is compared, its place is not.
 */
export function shadowLayers(shadow) {
  return String(shadow).split(/,(?![^(]*\))/).map((one) => {
    const text = (/[a-z-]+\([^)]*\)/i.exec(one) ?? [''])[0];
    const lengths = (one.replace(text, '').match(/-?[\d.]+px/g) ?? []).map(parseFloat);
    return { inset: /\binset\b/.test(one), text: text || one.trim(), colour: parseColour(text), lengths };
  }).filter((layer) => (!layer.colour || layer.colour.a > 0) && layer.lengths.some((length) => length !== 0));
}

/**
 * C2 over the same view in light and in dark: a colour that is the same in both, while the role it matches in light is another colour in dark.
 * Boxes are paired by their path in the page, and their colours by their place in `paints`. A pair that differs in the two themes is left alone: another rule shows that.
 */
export function checkThemes(view, light, dark, reference) {
  const found = [];
  const themes = reference.themes[light.brand];
  if (light.theme !== 'light' || dark.theme !== 'dark' || !themes) return found;
  const byPath = new Map(dark.elements.map((item) => [item.path, item]));
  const lightRoles = solidRoles(themes.light.roles);
  for (const item of light.elements) {
    const other = byPath.get(item.path);
    if (!other) continue;
    const there = paints(other);
    for (const [at, [what, inLight]] of paints(item).entries()) {
      const colour = parseColour(inLight);
      const dim = there[at]?.[0] === what ? parseColour(there[at][1]) : null;
      if (!colour || !dim || colour.a === 0 || !same(colour, dim)) continue;
      const matching = lightRoles.filter((role) => same(role.colour, colour));
      if (matching.length === 0) continue; // no role in light: C1 already says so
      const inDark = (role) => parseColour(themes.dark.roles[role.name] ?? '');
      if (matching.some((role) => inDark(role) && same(inDark(role), dim))) continue;
      const role = matching[0];
      found.push(find(view, 'C2', `${what} ${show(colour)} on ${item.element} is the same in light and dark, but --theme-${role.name} is ${show(role.colour)} in light and ${inDark(role) ? show(inDark(role)) : 'another colour'} in dark. It does not follow the theme.`));
    }
  }
  return found;
}
