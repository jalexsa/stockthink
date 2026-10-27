import { applyStaticTranslations, getLocale, initLocale, setLocale, t } from '@common/i18n';
import english from '../../common/locales/en.json';

// The legacy cinematic keeps its original English captions as presentation
// data. Resolve complete captions before typing them; SAN/UCI/code stays raw.
const messageKeys = new Map(Object.entries(english).map(([key, value]) => [value.replace(/\s+/g, ' ').trim(), key]));
// Accessible image labels in the original demos used lowercase verdicts.
for (const key of ['book','brilliant','great','best','excellent','good','inaccuracy','mistake','blunder','miss','forced']) messageKeys.set(key, key);
export function translateLabel(original) {
  const key = messageKeys.get(original.replace(/\s+/g, ' ').trim());
  if (!key) return original;
  return (original.match(/^\s*/)?.[0] ?? '') + t(key) + (original.match(/\s*$/)?.[0] ?? '');
}

/** Give generated demo markup stable resource keys, including accessible text. */
export function translateMarkup(root) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const textNodes = [];
  while (walker.nextNode()) textNodes.push(walker.currentNode);
  for (const node of textNodes) {
    if (node.parentElement?.closest('[data-i18n],script,style')) continue;
    const key = messageKeys.get(node.data.replace(/\s+/g, ' ').trim());
    if (!key) continue;
    const span = document.createElement('span');
    span.dataset.i18n = key;
    span.textContent = node.data;
    // Keep separators outside the translated span; applyStaticTranslations
    // replaces its text, and inline emphasis must not join adjacent words.
    node.replaceWith(node.data.match(/^\s*/)?.[0] ?? '', span, node.data.match(/\s*$/)?.[0] ?? '');
  }
  for (const el of root.querySelectorAll('*')) {
    for (const attr of ['alt', 'title', 'aria-label', 'placeholder']) {
      const key = messageKeys.get((el.getAttribute(attr) ?? '').trim());
      if (key) el.dataset.i18nAttr = [el.dataset.i18nAttr, `${attr}:${key}`].filter(Boolean).join(';');
    }
  }
  applyStaticTranslations(root);
}

initLocale();
const selector = document.getElementById('landing-language');
function refresh() {
  applyStaticTranslations();
  if (selector) selector.value = getLocale();
  const theme = document.getElementById('navToggleLabel');
  if (theme) theme.textContent = t(document.body.classList.contains('light') ? 'landing.theme.dark' : 'landing.theme.light');
}
selector?.addEventListener('change', () => setLocale(selector.value === 'en' ? 'en' : 'es'));
window.addEventListener('stockthink:languagechange', refresh);
refresh();

export { t, getLocale, applyStaticTranslations };
