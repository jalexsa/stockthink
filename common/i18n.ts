import en from './locales/en.json';
import es from './locales/es.json';

export type Locale = 'en' | 'es';
export type MessageKey = keyof typeof en;
const resources: Record<Locale, Record<MessageKey, string>> = { en, es };
const STORAGE_KEY = 'stockthink-language';
// Keep English as the library/test fallback; the browser app explicitly calls
// initLocale(), which selects Spanish on first use and restores saved choice.
let locale: Locale = 'en';

export function getLocale(): Locale { return locale; }
export function setLocale(next: Locale): void {
  locale = next;
  try { localStorage.setItem(STORAGE_KEY, next); } catch { /* storage can be disabled */ }
}
export function t(key: MessageKey, vars: Record<string, string | number> = {}): string {
  return Object.entries(vars).reduce((s, [name, value]) => s.replaceAll(`{${name}}`, String(value)), resources[locale][key] ?? resources.en[key]);
}
export function initLocale(): Locale {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'en' || stored === 'es') locale = stored;
    else locale = 'es';
  } catch { /* keep Spanish default */ }
  return locale;
}
export function applyStaticTranslations(root: ParentNode = document): void {
  root.querySelectorAll<HTMLElement>('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n as MessageKey;
    if (key in resources.en) el.textContent = t(key);
  });
  root.querySelectorAll<HTMLElement>('[data-i18n-attr]').forEach(el => {
    for (const item of (el.dataset.i18nAttr ?? '').split(';')) {
      const [attr, key] = item.split(':');
      if (attr && key && key in resources.en) el.setAttribute(attr, t(key as MessageKey));
    }
  });
}
