import { t } from '@common/i18n';

/**
 * Progress-screen entertainment: a knight rides the 8-square ring of a 3×3
 * board — the classic closed knight's tour, every hop a legal move — while
 * coach quips rotate below. Pure DOM/CSS; costs the engines nothing.
 */

const NEO = 'https://images.chesscomfiles.com/chess-themes/pieces/neo/150';

/** The 3×3 ring as [col,row]: each step is a knight move, and it loops. */
const RING: Array<[number, number]> = [
  [0, 0], [2, 1], [0, 2], [1, 0], [2, 2], [0, 1], [2, 0], [1, 2],
];

const QUIP_COUNT = 8;

const STEP_MS = 640;
/** Rotate the quip every N knight hops (~2.5 s). */
const QUIP_EVERY = 4;

let timer: ReturnType<typeof setInterval> | null = null;

/** One loader at a time (home hero or progress screen) — restart to move it. */
export function startLoader(boardEl: HTMLElement, quipEl?: HTMLElement): void {
  stopLoader();
  let html = '';
  for (let row = 0; row < 3; row++)
    for (let col = 0; col < 3; col++)
      html += `<div class="loader-sq ${(row + col) % 2 ? 'dark' : 'light'}" data-sq="${col},${row}" style="left:${col * 33.34}%;top:${row * 33.34}%"></div>`;
  html += `<img class="loader-knight" src="${NEO}/wn.png" alt="" draggable="false">`;
  boardEl.innerHTML = html;

  const knight = boardEl.querySelector<HTMLElement>('.loader-knight')!;
  let i = 0;
  let hops = 0;
  let quip = Math.floor(Math.random() * QUIP_COUNT);

  const place = (animate: boolean): void => {
    const [col, row] = RING[i];
    knight.style.left = `${col * 33.34}%`;
    knight.style.top = `${row * 33.34}%`;
    if (animate) {
      knight.classList.remove('hop');
      void knight.offsetWidth; // restart the hop animation
      knight.classList.add('hop');
    }
    for (const sq of boardEl.querySelectorAll('.loader-sq'))
      sq.classList.toggle('lit', sq.getAttribute('data-sq') === `${col},${row}`);
  };

  const setQuip = (): void => {
    if (!quipEl) return;
    quipEl.classList.add('quip-out');
    setTimeout(() => {
      quipEl.textContent = t(`quip${quip + 1}` as Parameters<typeof t>[0]);
      quip = (quip + 1) % QUIP_COUNT;
      quipEl.classList.remove('quip-out');
    }, 180);
  };

  place(false);
  setQuip();
  timer = setInterval(() => {
    i = (i + 1) % RING.length;
    place(true);
    if (++hops % QUIP_EVERY === 0) setQuip();
  }, STEP_MS);
}

export function stopLoader(): void {
  if (timer !== null) clearInterval(timer);
  timer = null;
}
