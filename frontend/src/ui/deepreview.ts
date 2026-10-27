/**
 * Deep Review panel (Mode B): three transports for the same verified contract.
 *  1. Copy prompt → paste into a Claude chat → import the JSON reply (free).
 *  2. One click with your own Anthropic API key (stored locally only).
 *  3. Fully local WebLLM model (~700 MB one-time download, WebGPU).
 * Every sentence is verified against the fact whitelist before it's shown
 * (R4); rejected moves keep their Mode A explanation — silent fallback.
 */
import type { AnnotatedReport } from '@backend/analyze';
import { importCommentary } from '@backend/llm/exchange';
import { buildFactsheet, buildPrompt, type GameFactsheet } from '@backend/llm/factsheet';
import {
  generateViaApi,
  generateViaWebLLM,
  getStoredKey,
  storeKey,
  webgpuAvailable,
} from '@backend/llm/providers';
import { t } from '@common/i18n';

export function renderDeepReview(
  el: HTMLElement,
  report: AnnotatedReport,
  onImported: (comments: Map<number, string>) => void,
): void {
  let sheet: GameFactsheet | null = null;
  const getSheet = (): GameFactsheet => (sheet ??= buildFactsheet(report));

  el.innerHTML = `
    <details class="ai-panel">
      <summary>${t('deepReview')}</summary>
      <p class="ai-hint">${t('deepReviewHint')}</p>

      <div class="ai-row">
        <button id="dr-api" class="primary">${t('generateApi')}</button>
        <input id="dr-key" type="password" spellcheck="false" placeholder="${t('apiKeyPlaceholder')}" />
      </div>

      <div class="ai-row">
        <button id="dr-local">${t('generateLocal')}</button>
      </div>

      <div class="ai-row">
        <button id="dr-copy">${t('copyPrompt')}</button>
        <span id="dr-status" class="ai-status"></span>
      </div>
      <textarea id="dr-paste" rows="4" spellcheck="false" placeholder='${t('pasteJson')}'></textarea>
      <div class="ai-row"><button id="dr-import">${t('importCommentary')}</button></div>
    </details>`;

  const status = el.querySelector('#dr-status') as HTMLElement;
  const say = (msg: string): void => {
    status.textContent = msg;
  };

  /** Parse + verify a raw model reply; silently keep baselines on failure. */
  const acceptReply = (raw: string | null): void => {
    if (!raw) return;
    try {
      const result = importCommentary(raw, getSheet());
      say(
        t('commentsImported', { count: result.accepted.size }) +
          (result.rejected.size ? t('commentsRejected', { count: result.rejected.size }) : '.'),
      );
      if (result.accepted.size) onImported(result.accepted);
    } catch {
      say(t('replyUnreadable'));
    }
  };

  // option 1: user's own API key
  const keyInput = el.querySelector('#dr-key') as HTMLInputElement;
  keyInput.value = getStoredKey();
  const apiBtn = el.querySelector('#dr-api') as HTMLButtonElement;
  apiBtn.addEventListener('click', () => {
    const key = keyInput.value.trim();
    if (!key) {
      say(t('pasteApiKey'));
      return;
    }
    storeKey(key);
    apiBtn.disabled = true;
    void generateViaApi(buildPrompt(getSheet()), key, say)
      .then(acceptReply)
      .finally(() => (apiBtn.disabled = false));
  });

  // option 2: local WebLLM (hidden when the browser has no WebGPU)
  const localBtn = el.querySelector('#dr-local') as HTMLButtonElement;
  if (!webgpuAvailable()) localBtn.parentElement!.remove();
  else
    localBtn.addEventListener('click', () => {
      localBtn.disabled = true;
      void generateViaWebLLM(buildPrompt(getSheet()), say)
        .then(acceptReply)
        .finally(() => (localBtn.disabled = false));
    });

  // option 3: manual copy/paste exchange (always available, always free)
  el.querySelector('#dr-copy')!.addEventListener('click', () => {
    void navigator.clipboard.writeText(buildPrompt(getSheet())).then(
      () => say(t('promptCopied')),
      () => say(t('clipboardError')),
    );
  });
  el.querySelector('#dr-import')!.addEventListener('click', () => {
    const pasted = (el.querySelector('#dr-paste') as HTMLTextAreaElement).value.trim();
    if (!pasted) {
      say(t('pasteReply'));
      return;
    }
    acceptReply(pasted);
  });
}
