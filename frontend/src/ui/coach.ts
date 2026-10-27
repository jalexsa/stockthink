/**
 * Coach panel: chess.com-style speech bubble — verdict row (badge ·
 * "<san> is <classification>" · eval chip) + composed commentary +
 * clickable variation chips (engine lines live HERE, never in prose — R2).
 */
import type { AnnotatedMove, AnnotatedReport } from '@backend/analyze';
import { composeComment, type VariationChip } from '@backend/compose/compose';
import type { EvalScore } from '@backend/analysis/winprob';
import { badgeHtml, CLASS_COLORS } from './badges';
import { renderRich } from './santag';
import { t } from '@common/i18n';
import { openingDisplay } from '@common/opening-name';

/** "+1.3" / "−0.5" / "M5" — numbers belong to chips/bars, not prose. */
export function formatEval(ev: EvalScore): string {
  if (ev.mate !== undefined) return `M${Math.abs(ev.mate)}`;
  const pawns = (ev.cp ?? 0) / 100;
  return `${pawns > 0 ? '+' : pawns < 0 ? '−' : ''}${Math.abs(pawns).toFixed(1)}`;
}

const esc = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export const headline = (c: AnnotatedMove['classification']): string => {
  switch (c) {
    case 'best': return t('headlineBest');
    case 'book': return t('headlineBook');
    case 'forced': return t('headlineForced');
    case 'brilliant': return t('headlineBrilliant');
    case 'great': return t('headlineGreat');
    case 'excellent': return t('headlineExcellent');
    case 'good': return t('headlineGood');
    case 'inaccuracy': return t('headlineInaccuracy');
    case 'mistake': return t('headlineMistake');
    case 'miss': return t('headlineMiss');
    case 'blunder': return t('headlineBlunder');
  }
};

/** "Thinking…" bubble while the live engine checks the user's own move. */
export function renderCoachThinking(el: HTMLElement, san: string): void {
  el.innerHTML = `
    <div id="commentary-card">
      <div class="bubble">
        <div class="verdict-row">
          <span class="verdict-label">${t('youPlayed')} <span class="san">${esc(san)}</span></span>
        </div>
        <div class="commentary-text live-thinking">${t('checkMove')}</div>
      </div>
    </div>`;
}

export function renderCoach(
  el: HTMLElement,
  report: AnnotatedReport,
  move: AnnotatedMove | null,
  onChip: (chip: VariationChip) => void,
  aiComment: string | null = null,
  live = false,
): void {
  if (!move) {
    const opening = report.opening ? `${esc(openingDisplay(report.opening))}. ` : '';
    el.innerHTML = `
      <div id="commentary-card">
        <div class="bubble">
          <div class="verdict-row"><span class="verdict-label">${t('gameReview')}</span></div>
          <div class="commentary-text">${opening}${t('reviewDirections')}</div>
        </div>
      </div>`;
    return;
  }
  const c = move.classification;
  const comment = composeComment(move);
  const isBadMove = c === 'inaccuracy' || c === 'mistake' || c === 'blunder' || c === 'miss';
  // Friendly Spotlight CTAs — no raw engine lines on buttons; the walkthrough
  // explains the moves one step at a time instead.
  const ctaLabel = (chip: (typeof comment.chips)[number]): string =>
    chip.kind === 'refutation'
      ? t('seeWhyFails')
      : isBadMove
        ? t('showBestMove')
        : t('enginePreference');
  const chipsHtml = comment.chips
    .map(
      (chip, i) => `
      <button class="var-chip cta-${chip.kind}" data-chip="${i}">
        ${ctaLabel(chip)}
      </button>`,
    )
    .join('');
  el.innerHTML = `
    <div id="commentary-card">
      <div class="bubble">
        ${live ? `<div class="live-row"><span class="live-tag">${t('yourMove')}</span><button id="live-back" title="${t('returnToGame')}">${t('backToReview')}</button></div>` : ''}
        <div class="verdict-row">
          ${badgeHtml(c)}
          <span class="verdict-label"><span class="san">${renderRich(move.san, [move.fenBefore])}</span> ${t('moveIs')} <span class="verdict-class" style="color:${CLASS_COLORS[c]}">${headline(c)}</span></span>
          <span class="score-chip">${formatEval(move.evalAfter)}</span>
        </div>
        <div class="commentary-text">${renderRich(aiComment ?? comment.text, [move.fenBefore, move.fenAfter])}</div>
        ${chipsHtml ? `<div class="chips-row">${chipsHtml}</div>` : ''}
        ${
          // "Explain more" (comment.more expansion) intentionally not rendered —
          // removed per user request; a better follow-up feature is planned.
          // The underlying comment.more is still composed + tested, so it's a
          // one-line re-add when that feature lands. "Quick take" (AI mode only)
          // is a separate thing and stays.
          aiComment
            ? `<details class="coach-more"><summary>${t('quickTake')}</summary>
               <div class="commentary-text">${renderRich(comment.text, [move.fenBefore, move.fenAfter])}</div></details>`
            : ''
        }
      </div>
    </div>`;
  el.querySelectorAll<HTMLButtonElement>('.var-chip').forEach(btn => {
    btn.addEventListener('click', () => onChip(comment.chips[Number(btn.dataset.chip)]));
  });
}
