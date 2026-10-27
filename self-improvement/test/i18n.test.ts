import { afterEach, describe, expect, it, vi } from 'vitest';
import { composeComment } from '@backend/compose/compose';
import type { MoveReport } from '@backend/analysis/report';
import type { Fact } from '@backend/concepts/facts';
import { getLocale, initLocale, setLocale, t } from '@common/i18n';
import { buildPrompt } from '@backend/llm/factsheet';
import { renderFact } from '@backend/compose/templates';
import { openingDisplay } from '@common/opening-name';
import en from '../../common/locales/en.json';
import es from '../../common/locales/es.json';

const startingLocale = getLocale();
afterEach(() => { setLocale(startingLocale); vi.unstubAllGlobals(); });

const move = (facts: Fact[], classification: MoveReport['classification'] = 'inaccuracy'): MoveReport => ({
  ply: 3, moveNumber: 2, color: 'white', san: 'd4', uci: 'd2d4', fenBefore: '', fenAfter: '', epdAfter: '',
  evalBefore: { cp: 0 }, evalAfter: { cp: -30 }, winPercentAfter: 48, winDrop: 2, accuracy: 95,
  bestUci: 'g1f3', bestSan: 'Nf3', wasBest: false, lines: [], facts, classification, openingName: null,
} as MoveReport);

describe('bilingual presentation', () => {
  it('translates classification labels without changing their internal identifiers', () => {
    const kinds = ['book', 'brilliant', 'great', 'inaccuracy', 'mistake', 'blunder'] as const;
    setLocale('en');
    const english = kinds.map(kind => t(kind));
    setLocale('es');
    expect(kinds.map(kind => t(kind))).toEqual([
      'Jugada de libro', 'Jugada brillante', 'Gran jugada', 'Imprecisión', 'Error', 'Grave error',
    ]);
    expect(english).toEqual(['Book move', 'Brilliant', 'Great move', 'Inaccuracy', 'Mistake', 'Blunder']);
  });

  it('renders the same verified facts in English and Spanish while preserving SAN', () => {
    const facts: Fact[] = [
      { kind: 'hangs_piece', piece: { role: 'bishop', square: 'b4' }, capture: { san: 'Nxb4', uci: 'd5b4' } },
      { kind: 'missed_fork', move: { san: 'Nd4', uci: 'f3d4' }, targets: [
        { role: 'king', square: 'g8' }, { role: 'queen', square: 'd7' },
      ] },
    ];
    setLocale('en');
    const english = composeComment(move(facts));
    setLocale('es');
    const spanish = composeComment(move(facts));
    expect(spanish.text).toContain('alfil en b4');
    expect(spanish.text).toContain('Nxb4');
    expect(spanish.text).toContain('Nd4');
    expect(spanish.text).toContain('tenedor');
    expect(spanish.text).not.toMatch(/\b(?:the|would have|hanging|winning)\b/i);
    expect(english.text).toContain('bishop on b4');
    expect(english.text).toContain('Nd4 would have forked');
    expect(english.text).not.toContain('alfil');
  });

  it('translates a generated positional explanation and keeps its square fact', () => {
    const facts: Fact[] = [{ kind: 'positional', fact: { kind: 'develops', role: 'knight', square: 'f3' } }];
    setLocale('es');
    const es = composeComment(move(facts, 'good')).text;
    setLocale('en');
    const en = composeComment(move(facts, 'good')).text;
    expect(es).toContain('caballo');
    expect(es).toContain('f3');
    expect(en).toContain('knight');
    expect(en).toContain('f3');
  });

  it('asks deep review for commentary in the selected language without translating fact data', () => {
    const factsheet = { headers: {}, opening: null, moves: [] };
    setLocale('es');
    expect(buildPrompt(factsheet)).toContain('natural Latin American Spanish');
    setLocale('en');
    expect(buildPrompt(factsheet)).toContain('every commentary in English');
  });

  it('keeps resource coverage and interpolation slots aligned', () => {
    expect(Object.keys(es).sort()).toEqual(Object.keys(en).sort());
    for(const key of Object.keys(en) as (keyof typeof en)[]) {
      expect(es[key].match(/\{\w+\}/g)?.sort() ?? []).toEqual(en[key].match(/\{\w+\}/g)?.sort() ?? []);
    }
  });

  it('defaults to Spanish even when local storage is unavailable', () => {
    setLocale('en');
    vi.stubGlobal('localStorage',{getItem:()=>{throw new Error('storage disabled');}});
    expect(initLocale()).toBe('es');
  });

  it.each(['pawn','knight','bishop','rook','queen'] as const)('uses natural articles and preserves the %s fact', role => {
    const fact: Fact={kind:'hangs_piece',piece:{role,square:'d4'},capture:{san:'Nxd4',uci:'f5d4'}};
    const before=JSON.stringify(fact);
    setLocale('es');
    const text=renderFact(fact)!;
    expect(text).toContain('Nxd4');
    expect(text).toContain('d4');
    expect(text).not.toMatch(/\b(?:el dama|el torre|al dama|al torre|and)\b|la\/el/);
    expect(JSON.stringify(fact)).toBe(before);
  });

  it('localizes known opening titles without editing book data or custom names', () => {
    const m=move([],'book');m.openingName='Philidor Defense';
    setLocale('es');
    expect(composeComment(m).text).toContain('Defensa Philidor');
    expect(m.openingName).toBe('Philidor Defense');
    expect(openingDisplay('Custom PGN title')).toBe('Custom PGN title');
    setLocale('en');
    expect(composeComment(m).text).toContain('Philidor Defense');
  });
});
