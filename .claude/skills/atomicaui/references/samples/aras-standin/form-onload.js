// A stand-in for a client method run on a form's load event. It is all an AtomicAUI area needs inside a document
// the host owns: the pixel stylesheet, the behaviour script, and whatever the form wants to know about a change.
// It does not load aui-setup.css or aui-theme.js: those set up a whole page, and this page is the host's.
(() => {
  const base = 'aui/';
  if (!document.querySelector('link[data-aui]')) {
    const sheet = document.createElement('link');
    sheet.rel = 'stylesheet';
    sheet.href = `${base}aui-px.css`;
    sheet.setAttribute('data-aui', '');
    document.head.appendChild(sheet);
  }
  if (!window.AUI?.dialog) {
    const script = document.createElement('script');
    script.src = `${base}aui-behaviour.js`;
    document.head.appendChild(script);
  }
  // Icons: the AtomicAUI Global Kit, as on every page of ours. The host's <head> does not have it, so it is added here.
  // Icons load only on domains the kit owner has allowed; elsewhere every icon is blank and nothing else changes.
  if (!document.querySelector('script[src*="kit.fontawesome.com"]')) {
    const icons = document.createElement('script');
    icons.src = 'https://kit.fontawesome.com/c852ddbb54.js';
    icons.crossOrigin = 'anonymous';
    document.head.appendChild(icons);
  }
  // The form hears about a change the same way on every stack: an event that bubbles from the part.
  document.getElementById('aui-area')?.addEventListener('aui-change', (event) => {
    document.documentElement.setAttribute('data-host-last-change', String(event.detail.value ?? event.detail.index));
  });
})();
