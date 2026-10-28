// SPDX-License-Identifier: GPL-3.0-or-later
// Original procedural wood taps: no downloaded or third-party audio assets.
const STORAGE_KEY = 'stockthink-piece-sounds';
let enabled = true;
try { enabled = localStorage.getItem(STORAGE_KEY) !== 'off'; } catch { /* optional storage */ }
let context: AudioContext | null = null;
let output: GainNode | null = null;
let noise: AudioBuffer | null = null;
let generation = 0;

export const pieceSoundsEnabled = (): boolean => enabled;
export function setPieceSoundsEnabled(value: boolean): void {
  enabled = value;
  generation++;
  try { localStorage.setItem(STORAGE_KEY, value ? 'on' : 'off'); } catch { /* optional storage */ }
  if (context && output) output.gain.setValueAtTime(value ? 0.4 : 0, context.currentTime);
}

function tap(ctx: AudioContext, at: number, capture: boolean, strength = 1): void {
  const body = ctx.createOscillator(), envelope = ctx.createGain();
  body.type = 'triangle';
  body.frequency.setValueAtTime(capture ? 240 : 390, at);
  body.frequency.exponentialRampToValueAtTime(capture ? 85 : 140, at + 0.065);
  envelope.gain.setValueAtTime(0, at);
  envelope.gain.linearRampToValueAtTime(0.5 * strength, at + 0.002);
  envelope.gain.exponentialRampToValueAtTime(0.001, at + 0.085);
  body.connect(envelope).connect(output!);
  body.start(at); body.stop(at + 0.09);
  body.onended = () => { body.disconnect(); envelope.disconnect(); };

  const click = ctx.createBufferSource(), filter = ctx.createBiquadFilter(), gain = ctx.createGain();
  click.buffer = noise;
  filter.type = 'bandpass'; filter.frequency.value = capture ? 1300 : 2100; filter.Q.value = 0.7;
  gain.gain.setValueAtTime(0, at);
  gain.gain.linearRampToValueAtTime(0.6 * strength, at + 0.001);
  gain.gain.exponentialRampToValueAtTime(0.001, at + 0.027);
  click.connect(filter).connect(gain).connect(output!);
  click.start(at); click.stop(at + 0.035);
  click.onended = () => { click.disconnect(); filter.disconnect(); gain.disconnect(); };
}

/** Call only for an explicit move action, never from a render or engine callback. */
export function playMoveSound(san: string): void {
  if (!enabled) return;
  try {
    if (!context || context.state === 'closed') {
      if (typeof AudioContext === 'undefined') return;
      context = new AudioContext();
      output = context.createGain(); output.gain.value = 0.4;
      output.connect(context.destination);
      noise = context.createBuffer(1, Math.ceil(context.sampleRate * 0.04), context.sampleRate);
      const samples = noise.getChannelData(0);
      let seed = 764512;
      for (let i = 0; i < samples.length; i++) {
        seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
        samples[i] = seed / 2147483648 - 1;
      }
    }
    const ctx = context, version = generation;
    const play = (): void => {
      if (!enabled || version !== generation || ctx.state !== 'running') return;
      const at = ctx.currentTime, capture = san.includes('x');
      tap(ctx, at, capture);
      if (san.startsWith('O-O')) tap(ctx, at + 0.075, false, 0.7);
      else if (capture) tap(ctx, at + 0.025, true, 0.45);
    };
    if (ctx.state === 'running') play();
    else void ctx.resume().then(play).catch(() => {});
  } catch { /* Audio support/policy must never interrupt a chess action. */ }
}
