// Runs inside the page (the form of scripts/measure-page.mjs): this file is one expression that the browser evaluates.
// It reads what the page renders and nothing else: the brand and theme the page carries, and what every element that draws computes
// (one that is display: none or inside one, or is visibility: hidden, draws nothing and is not read; one at opacity: 0 is read;
// html and body are read whatever their visibility, because their background is drawn over the whole window even then;
// one that is fully clipped away, by a clip-path with no area or by clip: rect() with no area, draws nothing either: it is counted and not read, with what it holds)
// (html and body, what an open shadow root holds, HTML inside an SVG foreignObject, ::before and ::after, and the shapes of an SVG). A frame and a closed shadow root are not read.
// What a theme value is comes from kit/standard/theme.json, never from the page.
(() => {
  const px = (text) => Math.round(parseFloat(text) * 10) / 10 || 0;
  const themed = document.querySelector('[data-aui-theme]');
  // React marks the elements it draws: the fixes of the spacing rules are worded for React, or for classes on a page without it.
  const react = [...document.querySelectorAll('body, body *')].some((element) => Object.keys(element).some((key) => /^__react(Container|Fiber)\$/.test(key)));
  const first = (family) => family.split(',')[0].trim().replace(/^["']|["']$/g, '');

  // The element as a person finds it: tag, id, the AtomicAUI class that names the part, the page's own classes, role, aria-label and own text.
  const label = (element) => {
    const marker = [...element.classList].find((name) => /^aui-(?!frame|scale|typography|shape|color|elevation|stateful|focus|display|flex|gap|width|height|align|justify|padding|min|max|overflow|border|radius|text|grid|position|row|column|font|line|letter|white|icon|dot|margin)/.test(name)) ?? '';
    const own = [...element.classList].filter((name) => !name.startsWith('aui-'));
    const role = element.getAttribute('role');
    const name = element.getAttribute('aria-label');
    const text = [...element.childNodes].filter((node) => node.nodeType === 3).map((node) => node.textContent.trim()).filter(Boolean).join(' ').slice(0, 24);
    return `${element.localName}${element.id ? `#${element.id}` : ''}${marker ? `.${marker}` : ''}${own.map((one) => `.${one}`).join('')}${role ? `[${role}]` : ''}${name ? `{${name.slice(0, 24)}}` : ''}${text ? ` "${text}"` : ''}`;
  };
  // Where the element sits in the page, as a selector: one element has one path, and the same path in the other theme.
  // "::shadow" is the step from a host into its open shadow root (no selector crosses it: search inside the host's shadowRoot).
  const pathOf = (element) => {
    if (element === document.documentElement || element === document.body) return element.localName;
    const parent = element.parentNode;
    const step = `${element.localName}:nth-child(${[...parent.children].indexOf(element) + 1})`;
    return parent instanceof ShadowRoot ? `${pathOf(parent.host)}::shadow > ${step}` : `${pathOf(parent)} > ${step}`;
  };
  // Every element under a root, with what the open shadow roots among them hold.
  const within = (root) => [...root.querySelectorAll('*')].flatMap((element) => (element.shadowRoot ? [element, ...within(element.shadowRoot)] : [element]));
  // Does a pseudo-element take room on this axis: its content, padding and border together. A size left at auto is laid out by its content.
  const room = (style, size, sides) => style[size] === 'auto' || px(style[size]) + sides.reduce((sum, side) => sum + px(style[`padding${side}`]) + px(style[`border${side}Width`]), 0) > 0;
  // Is the element fully clipped away: a clip-path that leaves no area (inset(50%), inset(100%), a circle or ellipse with a radius of 0, a polygon whose points lie on one line),
  // or the legacy clip: rect() with no area on a box that is absolute or fixed. A value this cannot read as plain px and % (a calc(), a path(), a url()) is taken as leaving area.
  const clipped = (element, style) => {
    const width = element.offsetWidth;
    const height = element.offsetHeight;
    const size = (text, whole) => (/^-?[\d.]+%$/.test(text) ? (parseFloat(text) / 100) * whole : /^-?[\d.]+px$/.test(text) ? parseFloat(text) : NaN);
    const rect = /^rect\((.*)\)$/.exec(style.clip);
    if (rect && ['absolute', 'fixed'].includes(style.position)) {
      const [top, right, bottom, left] = rect[1].split(/[\s,]+/).map((one) => size(one, 0));
      if (right <= left || bottom <= top) return true;
    }
    const shape = /^(inset|circle|ellipse|polygon)\((.*)\)$/.exec(style.clipPath);
    if (!shape) return false;
    if (shape[1] === 'inset') {
      const [top, right = top, bottom = top, left = right] = shape[2].split(' round ')[0].split(' ');
      return size(top, height) + size(bottom, height) >= height || size(left, width) + size(right, width) >= width;
    }
    if (shape[1] === 'polygon') {
      const points = shape[2].replace(/^(nonzero|evenodd),\s*/, '').split(',').map((point) => point.trim().split(' ')).map(([x, y]) => [size(x, width), size(y, height)]);
      const other = points.find(([x, y]) => x !== points[0][0] || y !== points[0][1]);
      return !other || points.every(([x, y]) => (other[0] - points[0][0]) * (y - points[0][1]) - (other[1] - points[0][1]) * (x - points[0][0]) === 0);
    }
    return shape[2].split(' at ')[0].split(' ').some((radius) => size(radius, 1) === 0);
  };
  const gone = new WeakSet();
  let skipped = 0;
  // The values of one corner: one radius, or two for an elliptical corner. A calc() value stays whole.
  const radii = (corner) => {
    const parts = [''];
    let depth = 0;
    for (const char of corner) {
      if (char === '(') depth += 1;
      if (char === ')') depth -= 1;
      if (char === ' ' && depth === 0) parts.push('');
      else parts[parts.length - 1] += char;
    }
    return parts.map((value) => (value.endsWith('px') && !value.includes('(') ? px(value) : value));
  };
  const clear = (colour) => /^rgba\(.*,\s*0\)$|^transparent$|\/\s*0\)$/.test(colour);
  const COLOUR = /\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\([^()]*\)/gi;
  // What one box paints, from its computed style: an element, or its ::before or ::after.
  const paint = (style, hasText) => ({
    text: hasText ? style.color : '',
    fill: clear(style.backgroundColor) ? '' : style.backgroundColor,
    stroke: '',
    borders: [...new Set(['Top', 'Right', 'Bottom', 'Left']
      .filter((side) => px(style[`border${side}Width`]) > 0 && !['none', 'hidden'].includes(style[`border${side}Style`]))
      .map((side) => style[`border${side}Color`]))],
    outline: style.outlineStyle !== 'none' && px(style.outlineWidth) > 0 ? style.outlineColor : '',
    gradients: style.backgroundImage.includes('gradient(') ? [...new Set(style.backgroundImage.replace(/currentcolor/gi, style.color).match(COLOUR) ?? [])] : [],
    family: hasText ? first(style.fontFamily) : '',
    size: hasText ? px(style.fontSize) : 0,
    line: hasText ? (style.lineHeight === 'normal' ? 'normal' : px(style.lineHeight)) : 0,
    radius: ['TopLeft', 'TopRight', 'BottomRight', 'BottomLeft'].flatMap((corner) => radii(style[`border${corner}Radius`])),
    shadow: style.boxShadow === 'none' ? '' : style.boxShadow,
    textShadow: hasText && style.textShadow !== 'none' ? style.textShadow : '',
  });
  const elements = [];
  // Keep only what has something to check: a box with no text, fill, stroke, border, outline, gradient, radius or shadow says nothing.
  const keep = (found) => {
    if (found.text || found.fill || found.stroke || found.borders.length > 0 || found.outline || found.gradients.length > 0 || found.shadow || found.radius.some((value) => value !== 0)) elements.push(found);
  };
  for (const element of [document.documentElement, document.body, ...within(document.body)]) {
    if (/^(SCRIPT|STYLE|NOSCRIPT|LINK|META|TEMPLATE)$/.test(element.tagName)) continue;
    if (gone.has(element.parentNode instanceof ShadowRoot ? element.parentNode.host : element.parentNode)) {
      gone.add(element);
      continue;
    }
    const path = pathOf(element);
    const place = { path, element: `${label(element)} (${path})` };
    if (element instanceof SVGElement && element.ownerSVGElement) {
      // Of the SVG elements inside an SVG only the shapes and the text paint, with a fill and a stroke. A shape may be flat (a line), and a line has no area to fill.
      const box = element.getBoundingClientRect();
      if (!(element instanceof SVGGeometryElement || element instanceof SVGTextContentElement) || (box.width === 0 && box.height === 0)) continue;
      const style = getComputedStyle(element);
      if (style.visibility !== 'visible') continue;
      keep({
        ...paint(style, false),
        ...place,
        fill: style.fill === 'none' || clear(style.fill) || element instanceof SVGLineElement ? '' : style.fill,
        stroke: style.stroke === 'none' || clear(style.stroke) || px(style.strokeWidth) === 0 ? '' : style.stroke,
        borders: [],
        outline: '',
        gradients: [],
        radius: [0, 0, 0, 0],
        shadow: '',
        floating: false,
        series: Boolean(element.closest('.aui-chart .ts-chart__marks')),
      });
      continue;
    }
    if (!element.checkVisibility()) continue;
    const style = getComputedStyle(element);
    const box = element.getBoundingClientRect();
    const hasArea = box.width > 0 && box.height > 0;
    // A box with no width or height still draws what lies outside it: its outline, its shadow, and its text when nothing clips it.
    // The background of html and of body is drawn over the whole window, whatever the size of their box.
    const wholeWindow = element === document.documentElement || element === document.body;
    if (!wholeWindow && clipped(element, style)) {
      gone.add(element);
      skipped += 1;
      continue;
    }
    const hasText = (hasArea || style.overflowX === 'visible') && ([...element.childNodes].some((node) => node.nodeType === 3 && node.textContent.trim() !== '') || (/^(INPUT|TEXTAREA|SELECT)$/.test(element.tagName) && !['checkbox', 'radio', 'hidden', 'range', 'color', 'image'].includes(element.type)));
    // A floating layer is drawn by the library's portal, or (a page without React has no portal) is a popup, dialog, menu or tooltip that carries an elevation class.
    const floating = Boolean(element.closest('[data-base-ui-portal]')) || (/(^|\s)aui-elevation-[1-9]/.test(element.getAttribute('class') ?? '') && element.matches('[class*="-popup"],[role="dialog"],[role="alertdialog"],[role="menu"],[role="listbox"],[role="tooltip"],[popover]'));
    if (wholeWindow || style.visibility === 'visible') keep({ ...paint(style, hasText), ...(hasArea ? {} : { borders: [], radius: [0, 0, 0, 0], ...(wholeWindow ? {} : { fill: '', gradients: [] }) }), ...place, floating, series: element.matches('.aui-chart .aui-chart-legend-swatch') });
    for (const which of ['::before', '::after']) {
      const pseudo = getComputedStyle(element, which);
      // A pseudo-element is drawn when it has content and takes room, whatever the size of its element; it writes text when its content is more than an empty string or an image.
      if (pseudo.content === 'none' || pseudo.content === 'normal' || pseudo.display === 'none' || pseudo.visibility !== 'visible' || !room(pseudo, 'width', ['Left', 'Right']) || !room(pseudo, 'height', ['Top', 'Bottom'])) continue;
      keep({ ...paint(pseudo, !/^("\s*"|url\(.*\))$/.test(pseudo.content)), path: `${place.path}${which}`, element: `${label(element)}${which} (${place.path}${which})`, floating });
    }
  }
  // A page that still marks a region aria-busy="true" at this read (the wait for it is over) says itself that it has not drawn everything.
  return { themed: Boolean(themed), theme: themed?.getAttribute('data-aui-theme') ?? '', brand: themed?.getAttribute('data-aui-brand') ?? '', react, busy: document.querySelector('[aria-busy="true"]') !== null, skipped, elements };
})()
