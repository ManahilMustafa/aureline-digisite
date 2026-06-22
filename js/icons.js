/**
 * Lucide icons helper — vanilla HTML/JS
 * Requires: lucide UMD script loaded before app.js
 */

export function icon(name, extraClass = '') {
  const cls = ['icon', extraClass].filter(Boolean).join(' ');
  return `<i data-lucide="${name}" class="${cls}" aria-hidden="true"></i>`;
}

export function refreshIcons(root = document) {
  try {
    if (typeof globalThis.lucide !== 'undefined' && globalThis.lucide.createIcons) {
      globalThis.lucide.createIcons({
        root,
        attrs: {
          'stroke-width': 1.75
        }
      });
    }
  } catch (err) {
    console.warn('Lucide icons could not render:', err);
  }
}
