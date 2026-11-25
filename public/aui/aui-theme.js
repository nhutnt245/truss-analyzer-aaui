// AtomicAUI light and dark for a page built without the React parts. Never edit it (AUI-06).
// Load it in <head> with a plain <script src>, so the theme is set before the page paints.
// The theme is one attribute on <html>: data-aui-theme="light" or "dark". Nothing else changes.
//   ?theme=dark in the address wins, then the user's stored choice, then the system setting.
//   Any element with the attribute data-aui-theme-toggle switches the theme when it is clicked.
//   It also marks where focus came from, so a field shows its focus ring for the keyboard and not for the mouse, as the React parts do.
(() => {
  const KEY = 'aui-kit-theme';
  const root = document.documentElement;
  const valid = (value) => (value === 'light' || value === 'dark' ? value : null);
  const stored = () => {
    try {
      return valid(window.localStorage.getItem(KEY));
    } catch {
      return null; // Storage can be blocked inside a frame.
    }
  };
  const system = () => (window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  root.setAttribute('data-aui-theme', valid(new URLSearchParams(window.location.search).get('theme')) ?? stored() ?? system());
  document.addEventListener('click', (event) => {
    if (!(event.target instanceof Element) || !event.target.closest('[data-aui-theme-toggle]')) return;
    const next = root.getAttribute('data-aui-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-aui-theme', next);
    try {
      window.localStorage.setItem(KEY, next);
    } catch {
      // The theme still changes for this visit.
    }
  });
})();
(() => {
  // aui-behaviour.js carries the same few lines, for a page that does not load this file. Whichever comes first does it.
  if (window.__auiFocusOrigin) return;
  window.__auiFocusOrigin = true;
  let origin = 'pointer';
  window.addEventListener('keydown', (event) => { if (event.key === 'Tab') origin = 'keyboard'; }, true);
  for (const type of ['pointerdown', 'mousedown', 'touchstart']) window.addEventListener(type, () => { origin = 'pointer'; }, true);
  const HOSTS = '.aui-field-control, .aui-number-field-group, .aui-datepicker-input';
  document.addEventListener('focusin', (event) => {
    if (!(event.target instanceof Element)) return;
    for (const host of [event.target, event.target.closest(HOSTS)]) host?.setAttribute('data-aui-focus-origin', origin);
  });
  document.addEventListener('focusout', (event) => {
    if (!(event.target instanceof Element)) return;
    for (const host of [event.target, event.target.closest(HOSTS)]) host?.removeAttribute('data-aui-focus-origin');
  });
})();
