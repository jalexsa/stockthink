import { afterEach, describe, expect, it } from 'vitest';
import { composeComment } from '@backend/compose/compose';
import type { MoveReport } from '@backend/analysis/report';
import type { Fact } from '@backend/concepts/facts';
import { getLocale, setLocale, t } from '@common/i18n';
import { buildPrompt } from '@backend/llm/factsheet';

const startingLocale = getLocale();
afterEach(() => setLocale(startingLocale));

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
      { kind: 'hangs_piece', piece: { role: 'bishop', square: 'c4' }, capture: { san: 'Nxb4', uci: 'd5b4' } },
      { kind: 'missed_fork', move: { san: 'Nd4', uci: 'f3d4' }, targets: [
        { role: 'king', square: 'g8' }, { role: 'queen', square: 'd7' },
      ] },
    ];
    setLocale('en');
    const english = composeComment(move(facts));
    setLocale('es');
    const spanish = composeComment(move(facts));
    expect(spanish.text).toContain('alfil en c4');
    expect(spanish.text).toContain('Nxb4');
    expect(spanish.text).toContain('Nd4');
    expect(spanish.text).toContain('tenedor');
    expect(spanish.text).not.toMatch(/\b(?:the|would have|hanging|winning)\b/i);
    expect(english.text).toContain('bishop on c4');
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
});
