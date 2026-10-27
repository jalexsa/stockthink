import { getLocale } from './i18n';
import en from './locales/openings.en.json';
import es from './locales/openings.es.json';

/** Display labels only: preserve the opening-book data and custom PGN names. */
export function openingDisplay(name: string): string {
  const labels: Record<string,string> = getLocale() === 'es' ? es : en;
  if(labels[name])return labels[name];
  return name.split(/(: |, )/).map(part=>labels[part] ?? part).join('');
}
