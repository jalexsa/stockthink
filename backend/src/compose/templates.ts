/**
 * Stage-4 sentence renderers (Mode A). One renderer per fact kind; slots are
 * filled ONLY from the fact (rule R4). No win%, no centipawns, no eval words
 * tied to numbers (R1); at most the first move or two of any line, always
 * with its purpose stated (R2).
 */
import type { Fact, MissedIdea, PieceOn } from '../concepts/facts';
import type { PositionalFact, RegressionFact } from '../concepts/positional';
import { getLocale } from '@common/i18n';

const FILES = 'abcdefgh';

const NUM_WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven'];
const inWords = (n: number): string => NUM_WORDS[n] ?? String(n);

const ROLE_ES: Record<string, string> = { pawn: 'peón', knight: 'caballo', bishop: 'alfil', rook: 'torre', queen: 'dama', king: 'rey' };
const pieceAt = (p: PieceOn): string => getLocale() === 'es' ? `${ROLE_ES[p.role] ?? p.role} en ${p.square}` : `${p.role} on ${p.square}`;
const subjectPiece = (p: PieceOn): string => `${p.role === 'queen' || p.role === 'rook' ? 'la' : 'el'} ${pieceAt(p)}`;
const objectPiece = (p: PieceOn): string => `${p.role === 'queen' || p.role === 'rook' ? 'a la' : 'al'} ${pieceAt(p)}`;

const listTargets = (targets: PieceOn[]): string => {
  const names = targets.map(t => (getLocale() === 'es' ? objectPiece(t) : (t.role === 'king' ? 'the king' : `the ${pieceAt(t)}`)));
  if (names.length <= 1) return names[0] ?? '';
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
};

function renderPositional(f: PositionalFact): string {
  if (getLocale() === 'es') {
    switch (f.kind) {
      case 'castles': return f.side === 'king' ? 'El enroque protege al rey y conecta las torres.' : 'El enroque largo pone al rey a salvo y activa la torre.';
      case 'passed_pawn': return `Esto crea un peón pasado en ${f.square}: ningún peón rival puede detenerlo en su avance.`;
      case 'simplifies_ahead': return 'Cambiar piezas cuando se tiene ventaja material acerca la victoria.';
      case 'releases_pin': return `Esto libera de la clavada al ${ROLE_ES[f.role] ?? f.role} de ${f.square}.`;
      case 'rook_open_file': return `La torre ocupa la columna abierta ${FILES[f.file]}, una vía directa hacia la posición rival.`;
      case 'rook_seventh': return `La torre llega a la séptima fila, en ${f.square}, y ataca desde atrás.`;
      case 'knight_outpost': return `El caballo se instala en ${f.square}, un puesto avanzado que ningún peón rival puede expulsar.`;
      case 'file_battery': return f.partnerRole === 'rook' ? `Las piezas pesadas se duplican en la columna ${FILES[f.file]} y aumentan la presión.` : `Se forma una batería de dama y torre en la columna ${FILES[f.file]}.`;
      case 'fianchetto': return `El alfil domina la gran diagonal desde ${f.square}.`;
      case 'develops': return `El ${ROLE_ES[f.role] ?? f.role} se desarrolla desde ${f.square}.`;
      case 'improves_shield': return 'Esto refuerza los peones que protegen al rey.';
      case 'center_gain': return 'Esto fortalece el control del centro.';
      case 'mobility_gain': return `El ${ROLE_ES[f.role] ?? f.role} gana actividad desde su nueva casilla.`;
    }
  }
  switch (f.kind) {
    case 'castles':
      return f.side === 'king'
        ? 'Castling tucks the king away and connects the rooks.'
        : 'Castling long brings the king to safety and activates the rook.';
    case 'passed_pawn':
      return `This creates a passed pawn on ${f.square} — no enemy pawn can stop it on its way up the board.`;
    case 'simplifies_ahead':
      return 'Trading pieces while ahead in material — every exchange brings the win closer.';
    case 'releases_pin':
      return `This frees the ${f.role} on ${f.square} from the pin.`;
    case 'rook_open_file':
      return `The rook takes the open ${FILES[f.file]}-file, the natural highway into the position.`;
    case 'rook_seventh':
      return `The rook lands on the seventh rank at ${f.square}, attacking from behind.`;
    case 'knight_outpost':
      return `The knight settles on ${f.square}, an outpost no enemy pawn can ever challenge.`;
    case 'file_battery':
      return f.partnerRole === 'rook'
        ? `Heavy pieces double on the ${FILES[f.file]}-file, stacking pressure.`
        : `A queen-and-rook battery forms on the ${FILES[f.file]}-file.`;
    case 'fianchetto':
      return `The bishop takes the long diagonal from ${f.square}.`;
    case 'develops':
      return `A developing move — the ${f.role} joins the game from ${f.square}.`;
    case 'improves_shield':
      return 'This shores up the pawn cover in front of the king.';
    case 'center_gain':
      return 'This strengthens the grip on the center.';
    case 'mobility_gain':
      return `The ${f.role} gains real scope from its new square.`;
  }
}

/** Verb phrase for what the missed best move WOULD have done. */
function ideaClause(i: MissedIdea): string {
  switch (i.what) {
    case 'defends':
      return `defended the ${pieceAt(i.piece)}`;
    case 'trades':
      return `traded off the ${pieceAt(i.victim)}`;
    case 'wins_material':
      return i.role ? `won the ${i.role} by force` : `won material by force`;
    case 'captures':
      return `taken the ${pieceAt(i.victim)}`;
    case 'removes_checks':
      return 'quietly taken away every check, leaving all the hard decisions to your opponent';
    case 'counterattack':
      return `answered the threat to the ${pieceAt(i.threatened)} with a bigger one`;
    case 'open_lines':
      return 'struck at once, tearing open lines toward the king before the defender could untangle';
    case 'prepares':
      switch (i.idea.what) {
        case 'mate_threat':
          return `set up ${i.move.san} next, threatening checkmate`;
        case 'wins_piece':
          return `prepared ${i.move.san}, winning the ${pieceAt(i.idea.piece)}`;
        case 'fork':
          return `prepared ${i.move.san}, forking ${listTargets(i.idea.targets)}`;
        case 'pin':
          return `prepared ${i.move.san}, pinning the ${pieceAt(i.idea.piece)}`;
      }
    case 'escapes':
      return `stepped the ${i.role} out of danger`;
    case 'wins_tempo':
      return `gained time by attacking the ${pieceAt(i.target)}`;
    case 'positional':
      return positionalIdea(i.fact);
  }
}

function positionalIdea(f: PositionalFact): string {
  switch (f.kind) {
    case 'castles':
      return 'brought the king to safety';
    case 'passed_pawn':
      return `created a passed pawn on ${f.square}`;
    case 'simplifies_ahead':
      return 'traded down while ahead in material';
    case 'releases_pin':
      return `freed the ${f.role} from the pin`;
    case 'rook_open_file':
      return `taken the open ${FILES[f.file]}-file`;
    case 'rook_seventh':
      return 'planted the rook on the seventh rank';
    case 'knight_outpost':
      return `settled the knight on the ${f.square} outpost`;
    case 'file_battery':
      return `doubled the heavy pieces on the ${FILES[f.file]}-file`;
    case 'fianchetto':
      return 'put the bishop on the long diagonal';
    case 'develops':
      return `developed the ${f.role}`;
    case 'improves_shield':
      return "shored up the king's pawn cover";
    case 'center_gain':
      return 'strengthened the grip on the center';
    case 'mobility_gain':
      return `given the ${f.role} more scope`;
  }
}

function renderRegression(f: RegressionFact): string {
  if (getLocale() === 'es') {
    switch (f.kind) {
      case 'weakens_shield': return 'Esto debilita los peones que protegen al rey.';
      case 'opens_king_file': return `Se abre la columna ${FILES[f.file]} hacia el rey, una invitación para las piezas pesadas.`;
      case 'doubled_pawns': return `Quedan peones doblados en la columna ${FILES[f.file]}.`;
      case 'isolated_pawn': return `El peón de la columna ${FILES[f.file]} queda aislado, sin peones vecinos que lo defiendan.`;
      case 'rim_knight': return `El caballo se aleja hacia ${f.square}, donde controla pocas casillas.`;
      case 'lags_development': return 'El desarrollo queda rezagado mientras el rival incorpora sus piezas.';
      case 'cedes_center': return 'Se cede el control del centro.';
      case 'early_queen': return 'La dama sale demasiado pronto y puede ser perseguida mientras las piezas menores siguen en casa.';
    }
  }
  switch (f.kind) {
    case 'weakens_shield':
      return 'It loosens the pawn cover in front of the king.';
    case 'opens_king_file':
      return `It opens the ${FILES[f.file]}-file toward the king — an invitation for the heavy pieces.`;
    case 'doubled_pawns':
      return `It leaves doubled pawns on the ${FILES[f.file]}-file.`;
    case 'isolated_pawn':
      return `The ${FILES[f.file]}-pawn is left isolated, with no neighbor to defend it.`;
    case 'rim_knight':
      return `The knight heads to the rim on ${f.square}, where it controls little.`;
    case 'lags_development':
      return 'It falls further behind in development while the opponent brings pieces out.';
    case 'cedes_center':
      return 'It gives up control of the center.';
    case 'early_queen':
      return 'The queen comes out early — it can be chased around while the minor pieces are still at home.';
  }
}

/** One sentence per fact. Returns null for context kinds rendered elsewhere. */
function renderFactEnglish(f: Fact): string | null {
  switch (f.kind) {
    case 'delivers_mate':
      return 'Checkmate — the game ends here.';
    case 'gives_stalemate':
      return 'Stalemate — the game is drawn on the spot.';
    case 'forced':
      return 'The only legal move.';
    case 'only_move':
      // GM-3 (book §4.1): a towering single candidate marks a critical moment
      return 'The position demanded exactly this — the only move that holds everything together.';
    case 'quiet_strength':
      return 'A quiet move with teeth — the kind most players never even consider.';
    case 'second_candidate':
      return `One of the main candidate moves here — only ${f.best.san} promised a bit more.`;
    case 'hard_to_find':
      return f.reason === 'retreat'
        ? `To be fair, ${f.move.san} is a backwards move — the kind even strong players overlook.`
        : f.reason === 'pawn_break'
          ? `To be fair, ${f.move.san} is a quiet pawn move — few players suspect a pawn push can hit this hard.`
          : `To be fair, ${f.move.san} is a quiet move — the hardest kind to spot.`;
    case 'wins_free_piece':
      return `This wins the ${pieceAt(f.victim)} for nothing — no recapture works.`;
    case 'captures_higher':
      return `A favorable exchange: the ${f.attacker} takes the ${pieceAt(f.victim)}.`;
    case 'creates_fork':
      return `The ${pieceAt(f.forker)} forks ${listTargets(f.targets)} — they cannot all be saved.`;
    case 'creates_pin': {
      const base =
        f.against.role === 'king'
          ? `This pins the ${pieceAt(f.pinned)} against the king — it cannot move without losing everything behind it.`
          : `This pins the ${pieceAt(f.pinned)} against the ${pieceAt(f.against)} — moving it would cost even more material.`;
      return f.exploit ? `${base} ${f.exploit.san} comes next to cash in on it.` : base;
    }
    case 'discovered_check':
      return 'A discovered check — the moved piece steps aside and unmasks an attack on the king.';
    case 'traps_piece':
      return `The enemy ${pieceAt(f.piece)} is now trapped — it has no safe square left.`;
    case 'mate_threat':
      return `This threatens checkmate with ${f.mateMove.san} next.`;
    case 'wins_tempo':
      return `This gains time by attacking the ${pieceAt(f.target)}, forcing an immediate answer.`;
    case 'blocks_check':
      return 'The check is blocked while keeping the position intact.';
    case 'trade':
      return `A fair trade of ${f.piece}s.`;
    case 'sacrifice':
      return `A genuine ${f.piece} sacrifice — material is given up for the attack.`;
    case 'defends_piece':
      return `This protects the ${pieceAt(f.piece)}, which was under attack.`;
    case 'prepares':
      switch (f.idea.what) {
        case 'mate_threat':
          return `A preparing move — it sets up ${f.move.san} next, threatening checkmate.`;
        case 'wins_piece':
          return `This prepares ${f.move.san}, winning the ${pieceAt(f.idea.piece)}.`;
        case 'fork':
          return `This prepares ${f.move.san}, forking ${listTargets(f.idea.targets)}.`;
        case 'pin':
          return `This prepares ${f.move.san}, pinning the ${pieceAt(f.idea.piece)}.`;
      }
    case 'positional':
      return renderPositional(f.fact);
    case 'regression':
      return renderRegression(f.fact);
    case 'hangs_piece':
      return `This leaves the ${pieceAt(f.piece)} hanging — ${f.capture.san} simply takes it.`;
    case 'ignores_threat':
      return `The ${pieceAt(f.piece)} was already under attack, and this move does nothing about it — ${f.capture.san} now wins it.`;
    case 'invites_capture':
      return `This runs into ${f.reply.san}, taking the ${pieceAt(f.piece)}.`;
    case 'allows_mate':
      return f.firstMove
        ? `This allows a forced mate: after ${f.firstMove.san} there is no defense (mate in ${inWords(f.mateIn)}).`
        : `This allows a forced mate in ${inWords(f.mateIn)}.`;
    case 'allows_fork':
      return `Now ${f.forkMove.san} forks ${listTargets(f.targets)} — material is lost by force.`;
    case 'refutation':
      return f.lossRole
        ? `The problem is ${f.moves[0].san}${f.moves[1] ? ` (and after ${f.moves[1].san})` : ''} — the ${f.lossRole} is lost by force.`
        : `The problem is ${f.moves[0].san}, which wins material by force.`;
    case 'missed_mate':
      return `${f.move.san} would have forced checkmate in ${inWords(f.mateIn)}.`;
    case 'missed_free_piece':
      return `${f.move.san} was available, winning the ${pieceAt(f.victim)} outright.`;
    case 'missed_fork':
      return `${f.move.san} would have forked ${listTargets(f.targets)}.`;
    case 'missed_pin':
      return `${f.move.san} would have pinned the ${pieceAt(f.pinned)} against the king.`;
    case 'missed_trap':
      return `${f.move.san} would have trapped the ${pieceAt(f.piece)}.`;
    case 'missed_idea':
      return `${f.move.san} was the better way — it would have ${f.ideas.map(ideaClause).join(' and ')}.`;
    case 'abandons_square':
      return `The ${f.role} had a job on ${f.from} — covering ${f.square} — and this move walks away from it; ${f.reply.san} steps straight into the gap.`;
    case 'missed_mate_threat':
      return `${f.move.san} would have set up a direct mating threat.`;
  }
}

const ideaEs = (i: MissedIdea): string => {
  switch (i.what) {
    case 'defends': return `defendía al ${pieceAt(i.piece)}`;
    case 'trades': return `cambiaba el ${pieceAt(i.victim)}`;
    case 'wins_material': return i.role ? `ganaba una ${ROLE_ES[i.role] ?? i.role} por fuerza` : 'ganaba material por fuerza';
    case 'captures': return `capturaba el ${pieceAt(i.victim)}`;
    case 'removes_checks': return 'quitaba todas las opciones de jaque y dejaba las decisiones difíciles al rival';
    case 'counterattack': return `respondía a la amenaza contra el ${pieceAt(i.threatened)} con una amenaza mayor`;
    case 'open_lines': return 'abría de inmediato líneas de ataque hacia el rey antes de que el defensor pudiera reorganizarse';
    case 'escapes': return `ponía al ${ROLE_ES[i.role] ?? i.role} a salvo`;
    case 'wins_tempo': return `ganaba un tiempo atacando al ${pieceAt(i.target)}`;
    case 'positional': return 'mejoraba la posición';
    case 'prepares': return `preparaba ${i.idea.what === 'mate_threat' ? `${i.move.san}, con amenaza de mate` : i.idea.what === 'wins_piece' ? `${i.move.san}, ganando el ${pieceAt(i.idea.piece)}` : i.idea.what === 'fork' ? `${i.move.san}, con un tenedor contra ${listTargets(i.idea.targets)}` : `${i.move.san}, clavando al ${pieceAt(i.idea.piece)}`}`;
  }
};

function renderFactSpanish(f: Fact): string | null {
  const role = (r: string) => ROLE_ES[r] ?? r;
  switch (f.kind) {
    case 'delivers_mate': return 'Jaque mate: la partida termina aquí.';
    case 'gives_stalemate': return 'Ahogado: la partida termina en tablas.';
    case 'forced': case 'only_move': return 'Era la única jugada que mantenía la posición.';
    case 'quiet_strength': return 'Una jugada tranquila y profunda, difícil de encontrar.';
    case 'second_candidate': return `Era una de las principales candidatas, aunque solo ${f.best.san} ofrecía un poco más.`;
    case 'hard_to_find': return f.reason === 'retreat' ? `Hay que reconocerlo: ${f.move.san} es una retirada que incluso jugadores fuertes pueden pasar por alto.` : f.reason === 'pawn_break' ? `Hay que reconocerlo: ${f.move.san} es un avance de peón tranquilo cuyo potencial no es evidente.` : `Hay que reconocerlo: ${f.move.san} es una jugada tranquila y difícil de detectar.`;
    case 'wins_free_piece': return `Se gana gratis ${subjectPiece(f.victim)}; no hay una recaptura efectiva.`;
    case 'captures_higher': return `El cambio es favorable: el ${role(f.attacker)} captura ${subjectPiece(f.victim)}.`;
    case 'creates_fork': return `${subjectPiece(f.forker)} hace un tenedor contra ${listTargets(f.targets)}: no se pueden salvar todas las piezas.`;
    case 'creates_pin': return f.against.role === 'king' ? `${subjectPiece(f.pinned)} queda clavado contra el rey y no puede moverse sin perder lo que hay detrás.${f.exploit ? ` Sigue ${f.exploit.san} para aprovechar la clavada.` : ''}` : `${subjectPiece(f.pinned)} queda clavado contra ${subjectPiece(f.against)}; moverlo costaría aún más material.${f.exploit ? ` Sigue ${f.exploit.san} para aprovechar la clavada.` : ''}`;
    case 'discovered_check': return 'Jaque descubierto: la pieza se aparta y revela un ataque contra el rey.';
    case 'traps_piece': return `${subjectPiece(f.piece)} rival queda atrapado: ya no tiene casillas seguras.`;
    case 'mate_threat': return `Se amenaza mate con ${f.mateMove.san} en la siguiente jugada.`;
    case 'wins_tempo': return `Se gana un tiempo al atacar ${objectPiece(f.target)} y obligar al rival a responder.`;
    case 'blocks_check': return 'Se bloquea el jaque sin debilitar la posición.';
    case 'trade': return `Se cambian piezas en igualdad: ${role(f.piece)} por ${role(f.piece)}.`;
    case 'sacrifice': return `Es un sacrificio real de ${role(f.piece)}: se entrega material a cambio del ataque.`;
    case 'defends_piece': return `Esto protege ${objectPiece(f.piece)}, que estaba bajo ataque.`;
    case 'prepares': return f.idea.what === 'mate_threat' ? `Una jugada preparatoria: alista ${f.move.san}, con amenaza de mate.` : f.idea.what === 'wins_piece' ? `Esto prepara ${f.move.san} para ganar el ${pieceAt(f.idea.piece)}.` : f.idea.what === 'fork' ? `Esto prepara ${f.move.san}, con un tenedor contra ${listTargets(f.idea.targets)}.` : `Esto prepara ${f.move.san} para clavar al ${pieceAt(f.idea.piece)}.`;
    case 'positional': return renderPositional(f.fact);
    case 'regression': return renderRegression(f.fact);
    case 'hangs_piece': return `${subjectPiece(f.piece)} queda indefenso y ${f.capture.san} lo captura.`;
    case 'ignores_threat': return `${subjectPiece(f.piece)} ya estaba bajo ataque y la jugada no lo defiende: ahora ${f.capture.san} lo gana.`;
    case 'invites_capture': return `La respuesta ${f.reply.san} captura ${subjectPiece(f.piece)}.`;
    case 'allows_mate': return f.firstMove ? `Esto permite mate forzado: tras ${f.firstMove.san} no hay defensa (mate en ${f.mateIn}).` : `Esto permite mate forzado en ${f.mateIn}.`;
    case 'allows_fork': return `Ahora ${f.forkMove.san} hace un tenedor contra ${listTargets(f.targets)} y gana material por fuerza.`;
    case 'refutation': return f.lossRole ? `El problema es ${f.moves[0].san}${f.moves[1] ? ` y, después, ${f.moves[1].san}` : ''}: se pierde la/el ${role(f.lossRole)} por fuerza.` : `El problema es ${f.moves[0].san}, que gana material por fuerza.`;
    case 'missed_mate': return `${f.move.san} habría forzado mate en ${f.mateIn}.`;
    case 'missed_free_piece': return `${f.move.san} estaba disponible y ganaba directamente ${subjectPiece(f.victim)}.`;
    case 'missed_fork': return `${f.move.san} habría hecho un tenedor contra ${listTargets(f.targets)}.`;
    case 'missed_pin': return `${f.move.san} habría clavado al ${pieceAt(f.pinned)} contra el rey.`;
    case 'missed_trap': return `${f.move.san} habría atrapado al ${pieceAt(f.piece)}.`;
    case 'missed_idea': return `${f.move.san} era mejor: ${f.ideas.map(ideaEs).join(' y ')}.`;
    case 'abandons_square': return `${subjectPiece({ role: f.role, square: f.from })} defendía ${f.square}, pero se aleja y ${f.reply.san} ocupa esa casilla.`;
    case 'missed_mate_threat': return `${f.move.san} habría preparado una amenaza directa de mate.`;
  }
}

export function renderFact(f: Fact): string | null {
  return getLocale() === 'es' ? renderFactSpanish(f) : renderFactEnglish(f);
}
