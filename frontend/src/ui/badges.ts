/**
 * Classification visual vocabulary — original GPL badge artwork, generated
 * by self-improvement/scripts/build-free-assets.mjs.
 */
import type { Classification } from '@backend/analysis/classify';
import { t } from '@common/i18n';

/** URL of the original StockThink badge for a classification. */
export const badgeUrl = (cls: Classification): string =>
  `${import.meta.env.BASE_URL}badges/${cls}.svg`;

export const CLASS_COLORS: Record<Classification, string> = {
  brilliant: '#26c2a3',
  great: '#5c8bb0',
  best: '#95b776',
  excellent: '#95b776',
  good: '#95af7a',
  book: '#a88865',
  forced: '#7c9c7b',
  inaccuracy: '#f7c045',
  mistake: '#e58f2a',
  miss: '#ff7769',
  blunder: '#ca3431',
};

export const CLASS_LABELS: Record<Classification, string> = Object.defineProperties({}, Object.fromEntries(
  (['brilliant','great','best','excellent','good','book','forced','inaccuracy','mistake','miss','blunder'] as Classification[])
    .map(c => [c, {get: () => t(c), enumerable: true}]),
)) as Record<Classification, string>;

/** Order classifications appear in the summary table. */
export const CLASS_ORDER: Classification[] = [
  'brilliant',
  'great',
  'best',
  'excellent',
  'good',
  'book',
  'forced',
  'inaccuracy',
  'mistake',
  'miss',
  'blunder',
];

/**
 * SVG fragment for a classification badge at the top-right of a square —
 * the original StockThink badge image (chessground customSvg space:
 * 100×100 viewBox per square).
 */
export const badgeSvg = (cls: Classification): string =>
  `<g class="st-badge"><image href="${badgeUrl(cls)}" x="68" y="-4" width="34" height="34"/></g>`;

/** Small inline HTML badge (move list, coach header, summary). */
export const badgeHtml = (cls: Classification): string =>
  `<img class="badge" src="${badgeUrl(cls)}" alt="${t(cls)}" draggable="false">`;
