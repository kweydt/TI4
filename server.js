require('dotenv').config();
const express = require('express');
const os = require('os');
const Anthropic = require('@anthropic-ai/sdk');

const app = express();
app.use(express.json());
app.use(express.static('public'));

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ── Faction Data ──────────────────────────────────────────────────────────────

const FACTIONS = {
  'Federation of Sol': {
    description: "Humanity's finest. Straightforward mechanics, massive infantry, reliable fleet mobility. The best faction for learning TI4 fundamentals.",
    homeworlds: 'Jord (4R/2I)',
    startingTech: ['Neural Motivator', 'Antimass Deflectors'],
    commodities: 4,
    keyAbility: 'ORBITAL DROP: Spend 1 strategy pool token to place 2 infantry from reinforcements on a planet you control. VERSATILE: Gain 1 additional command token whenever you gain tokens during the Status Phase.',
    planets: [
      { name: 'Jord', resources: 4, influence: 2, ready: true, trait: 'Cultural' }
    ],
    units: { spaceDocks:1, carriers:2, cruisers:0, destroyers:1, dreadnoughts:0, warSuns:0, fighters:3, infantry:5, pds:0 }
  },
  'Emirates of Hacan': {
    description: 'Masters of trade and negotiation. Economic dominance through commodities, backroom deals, and controlling the flow of resources across the galaxy.',
    homeworlds: 'Arretze (2R/1I), Kamdorn (0R/1I), Hercant (1R/1I)',
    startingTech: ['Antimass Deflectors', 'Sarween Tools'],
    commodities: 6,
    keyAbility: 'MASTERS OF TRADE: No command token cost to resolve the Trade strategy card secondary. GUILD SHIPS: Negotiate transactions even with non-neighbors. ARBITERS: Action cards can be exchanged in a transaction.',
    planets: [
      { name: 'Arretze', resources: 2, influence: 1, ready: true, trait: 'Industrial' },
      { name: 'Kamdorn', resources: 0, influence: 1, ready: true, trait: 'Cultural' },
      { name: 'Hercant', resources: 1, influence: 1, ready: true, trait: 'Hazardous' }
    ],
    units: { spaceDocks:1, carriers:2, cruisers:1, destroyers:0, dreadnoughts:0, warSuns:0, fighters:2, infantry:4, pds:0 }
  },
  'Universities of Jol-Nar': {
    description: 'The premier tech faction. Start with 4 technologies and research faster than anyone. Fragile early but terrifying in the late game when tech advantages compound.',
    homeworlds: 'Jol (1R/2I), Nar (2R/3I)',
    startingTech: ['Neural Motivator', 'Antimass Deflectors', 'Sarween Tools', 'Plasma Scoring'],
    commodities: 4,
    keyAbility: 'FRAGILE: -1 to the result of each of your unit\'s combat rolls. BRILLIANT: When you spend a command token to resolve the Technology strategy card\'s secondary, you may resolve the primary instead. ANALYTICAL: When researching a non-unit-upgrade technology, you may ignore 1 prerequisite.',
    planets: [
      { name: 'Jol', resources: 1, influence: 2, ready: true, trait: 'Industrial' },
      { name: 'Nar', resources: 2, influence: 3, ready: true, trait: 'Industrial' }
    ],
    units: { spaceDocks:1, carriers:2, cruisers:0, destroyers:0, dreadnoughts:1, warSuns:0, fighters:1, infantry:2, pds:2 }
  },
  'L1Z1X Mindnet': {
    description: 'Pure military aggression. Upgraded Dreadnoughts, Assault Cannons, and a Flagship that instills dread. Expand fast, threaten everyone, control the board through fear.',
    homeworlds: '[0.0.0] (5R/0I)',
    startingTech: ['Neural Motivator', 'Plasma Scoring'],
    commodities: 2,
    keyAbility: 'ASSIMILATE: When you gain control of a planet, replace any PDS or space dock there with your own. HARROW: After each round of ground combat, your ships in the system may use Bombardment against the survivors.',
    planets: [
      { name: '[0.0.0]', resources: 5, influence: 0, ready: true, trait: 'Industrial' }
    ],
    units: { spaceDocks:1, carriers:1, cruisers:0, destroyers:0, dreadnoughts:1, warSuns:0, fighters:3, infantry:5, pds:1 }
  },
  'Barony of Letnev': {
    description: 'Wealthy military power. Start with a Dreadnought and strong economy. Compensates for fewer units with Sustain Damage and economic bonuses.',
    homeworlds: 'Arc Prime (4R/0I), Wren Terra (2R/1I)',
    startingTech: ['Antimass Deflectors', 'Plasma Scoring'],
    commodities: 2,
    keyAbility: 'MUNITIONS RESERVES: At the start of each space combat round, spend 2 trade goods to re-roll any number of your dice. ARMADA: Your fleet supply limit is 2 higher than your fleet pool would normally allow.',
    planets: [
      { name: 'Arc Prime', resources: 4, influence: 0, ready: true, trait: 'Industrial' },
      { name: 'Wren Terra', resources: 2, influence: 1, ready: true, trait: 'Hazardous' }
    ],
    units: { spaceDocks:1, carriers:1, cruisers:0, destroyers:1, dreadnoughts:1, warSuns:0, fighters:1, infantry:3, pds:0 }
  },
  'Clan of Saar': {
    description: 'Nomadic raiders. Expansion pays for itself in trade goods, and you can score objectives without defending every home planet. Punishes static players.',
    homeworlds: 'Lisis II (1R/0I), Ragh (2R/1I)',
    startingTech: ['Antimass Deflectors'],
    commodities: 3,
    keyAbility: 'SCAVENGE: Gain 1 trade good whenever you gain control of a planet. NOMADIC: You can score objectives even without controlling every planet in your home system.',
    planets: [
      { name: 'Lisis II', resources: 1, influence: 0, ready: true, trait: 'Cultural' },
      { name: 'Ragh', resources: 2, influence: 1, ready: true, trait: 'Hazardous' }
    ],
    units: { spaceDocks:1, carriers:2, cruisers:1, destroyers:0, dreadnoughts:0, warSuns:0, fighters:2, infantry:4, pds:0 }
  },
  'Naalu Collective': {
    description: 'Fighter swarm and political manipulation. The "0" initiative card lets you always go first in Action Phase. Devastating fighter upgrades make your swarms lethal.',
    homeworlds: 'Maaluuk (0R/2I), Druaa (3R/1I)',
    startingTech: ['Neural Motivator', 'Sarween Tools'],
    commodities: 3,
    keyAbility: 'TELEPATHIC: At the end of the Strategy Phase, place your "0" token on your strategy card — you act first in initiative order. FORESIGHT: When an opponent moves ships into your system, you may retreat to an adjacent empty system using a strategy pool token.',
    planets: [
      { name: 'Maaluuk', resources: 0, influence: 2, ready: true, trait: 'Cultural' },
      { name: 'Druaa', resources: 3, influence: 1, ready: true, trait: 'Industrial' }
    ],
    units: { spaceDocks:1, carriers:1, cruisers:1, destroyers:1, dreadnoughts:0, warSuns:0, fighters:3, infantry:4, pds:1 }
  },
  'Xxcha Kingdom': {
    description: 'Political powerhouse. Reroll unfavorable agendas, grab free planets through diplomacy. Win through accumulation and patience, not combat.',
    homeworlds: 'Archon Ren (2R/3I), Archon Tau (1R/1I)',
    startingTech: ['Graviton Laser System'],
    commodities: 4,
    keyAbility: 'PEACE ACCORDS: After resolving the Diplomacy strategy card\'s primary or secondary, gain control of an adjacent unoccupied planet (not Mecatol Rex). QUASH: When an agenda is revealed, spend a strategy pool token to discard it and reveal a new one instead.',
    planets: [
      { name: 'Archon Ren', resources: 2, influence: 3, ready: true, trait: 'Cultural' },
      { name: 'Archon Tau', resources: 1, influence: 1, ready: true, trait: 'Industrial' }
    ],
    units: { spaceDocks:1, carriers:1, cruisers:2, destroyers:0, dreadnoughts:0, warSuns:0, fighters:3, infantry:4, pds:1 }
  },
  'Yin Brotherhood': {
    description: 'Religious zealots with powerful conversion abilities. Sacrifice ships to devastating effect. Difficult to fight because they turn your own units against you.',
    homeworlds: 'Darien (4R/4I)',
    startingTech: ['Sarween Tools'],
    commodities: 2,
    keyAbility: 'INDOCTRINATION: At the start of a ground combat, spend 2 influence to replace 1 of your opponent\'s participating infantry with your own. DEVOTION: After each space combat round, destroy 1 of your own cruisers/destroyers to deal 1 automatic hit to an enemy ship.',
    planets: [
      { name: 'Darien', resources: 4, influence: 4, ready: true, trait: 'Cultural' }
    ],
    units: { spaceDocks:1, carriers:2, cruisers:0, destroyers:1, dreadnoughts:0, warSuns:0, fighters:4, infantry:4, pds:0 }
  },
  'Winnu': {
    description: 'The Mecatol Rex specialists. Your entire game revolves around a single path to the center of the galaxy. Brutal efficiency when on track — helpless when off it.',
    homeworlds: 'Winnu (3R/4I)',
    startingTech: ['(choose any 1 technology with no prerequisites)'],
    commodities: 3,
    keyAbility: 'BLOOD TIES: You don\'t need to spend influence to remove the Custodians Token from Mecatol Rex. RECLAMATION: After a tactical action where you take Mecatol Rex, place a free PDS and space dock there from reinforcements.',
    planets: [
      { name: 'Winnu', resources: 3, influence: 4, ready: true, trait: 'Cultural' }
    ],
    units: { spaceDocks:1, carriers:1, cruisers:1, destroyers:0, dreadnoughts:0, warSuns:0, fighters:2, infantry:2, pds:1 }
  },
  'Mentak Coalition': {
    description: 'Pirates and ambushers. Fire before anyone else, steal trade goods, and leverage Action Cards better than anyone. Punishes passive players hard.',
    homeworlds: 'Moll Primus (4R/1I)',
    startingTech: ['Sarween Tools', 'Plasma Scoring'],
    commodities: 2,
    keyAbility: 'AMBUSH: At the start of space combat, roll 1 die for up to 2 of your cruisers/destroyers in the system — hits are assigned before normal combat. PILLAGE: After a neighbor gains trade goods or resolves a transaction, if they hold 3+, you may take one.',
    planets: [
      { name: 'Moll Primus', resources: 4, influence: 1, ready: true, trait: 'Industrial' }
    ],
    units: { spaceDocks:1, carriers:1, cruisers:2, destroyers:0, dreadnoughts:0, warSuns:0, fighters:3, infantry:4, pds:1 }
  },
  'Nekro Virus': {
    description: 'Completely unique mechanics. Steal technology through combat and political prediction instead of researching it normally. Fundamentally different from every other faction.',
    homeworlds: 'Mordai II (4R/0I)',
    startingTech: ['Dacxive Animators', 'Valefar Assimilator X', 'Valefar Assimilator Y'],
    commodities: 3,
    keyAbility: 'GALACTIC THREAT: You cannot vote on agendas, but may predict an outcome — if correct, steal a technology from a player who voted that way. TECHNOLOGICAL SINGULARITY: Steal a technology when you destroy an opponent unit in combat. PROPAGATION: You cannot research technology normally — gain 3 command tokens instead whenever you would.',
    planets: [
      { name: 'Mordai II', resources: 4, influence: 0, ready: true, trait: 'Hazardous' }
    ],
    units: { spaceDocks:1, carriers:1, cruisers:1, destroyers:0, dreadnoughts:1, warSuns:0, fighters:2, infantry:2, pds:0 }
  },
  'Embers of Muaat': {
    description: 'One trick, and that trick is a War Sun. Build the most powerful unit in the game and use it to obliterate everything. Extremely high variance.',
    homeworlds: 'Muaat (4R/1I)',
    startingTech: ['Plasma Scoring'],
    commodities: 4,
    keyAbility: 'STAR FORGE: Spend 1 strategy pool token to place 2 fighters or 1 destroyer in a system containing your War Sun. GASHLAI PHYSIOLOGY: Your ships can move through supernovas as if they were empty space.',
    planets: [
      { name: 'Muaat', resources: 4, influence: 1, ready: true, trait: 'Hazardous' }
    ],
    units: { spaceDocks:1, carriers:0, cruisers:0, destroyers:0, dreadnoughts:0, warSuns:1, fighters:2, infantry:4, pds:0 }
  },
  'Ghosts of Creuss': {
    description: 'Wormhole manipulators. Move through wormholes others can\'t use and reshape the galaxy\'s geography to your advantage. Complex but uniquely powerful.',
    homeworlds: 'Creuss (4R/2I)',
    startingTech: ['Gravity Drive'],
    commodities: 4,
    keyAbility: 'QUANTUM ENTANGLEMENT: You treat all systems containing an alpha or beta wormhole as adjacent to each other. SLIPSTREAM: +1 move value for ships starting movement in your home system or a wormhole system.',
    planets: [
      { name: 'Creuss', resources: 4, influence: 2, ready: true, trait: 'Cultural' }
    ],
    units: { spaceDocks:1, carriers:1, cruisers:0, destroyers:2, dreadnoughts:0, warSuns:0, fighters:2, infantry:4, pds:0 }
  },
  'Arborec': {
    description: 'Biological production. Grow infantry anywhere you have units — but at a price. Every infantry is also a space dock. Slow to start, overwhelming in the late game.',
    homeworlds: 'Nestphar (3R/2I)',
    startingTech: ['Magen Defense Grid'],
    commodities: 3,
    keyAbility: 'MITOSIS: Your space docks cannot produce infantry. Instead, at the start of each Status Phase, place 1 infantry from reinforcements on any planet you control.',
    planets: [
      { name: 'Nestphar', resources: 3, influence: 2, ready: true, trait: 'Hazardous' }
    ],
    units: { spaceDocks:1, carriers:1, cruisers:1, destroyers:0, dreadnoughts:0, warSuns:0, fighters:2, infantry:4, pds:1 }
  },
  'Sardakk N\'orr': {
    description: 'Hard mode. No racial technologies, no special abilities — just raw combat stats and sheer numbers. Every other faction has tools you don\'t. Pure fundamentals.',
    homeworlds: 'Quinarra (3R/1I), Tren\'lak (1R/0I)',
    startingTech: [],
    commodities: 3,
    keyAbility: '+1 to all combat rolls (your units fight better than anyone). Your Exotrireme dreadnoughts can deal damage before combat. That\'s it — no gimmicks.',
    planets: [
      { name: 'Quinarra', resources: 3, influence: 1, ready: true, trait: 'Industrial' },
      { name: "Tren'lak", resources: 1, influence: 0, ready: true, trait: 'Hazardous' }
    ],
    units: { spaceDocks:1, carriers:2, cruisers:1, destroyers:0, dreadnoughts:0, warSuns:0, fighters:0, infantry:5, pds:1 }
  },
  'Yssaril Tribes': {
    description: 'Action card manipulators. No hand limit, draw more cards than anyone, and always have an answer. Win through information and timing, not combat.',
    homeworlds: 'Iol (2R/3I), Xxehan (1R/2I)',
    startingTech: ['Neural Motivator'],
    commodities: 3,
    keyAbility: 'SCHEMING: When you draw 1+ action cards, draw 1 additional, then discard 1 from your hand. CRAFTY: You can have any number of action cards — no hand limit, ever. STALL TACTICS: Action: Discard 1 action card from your hand.',
    planets: [
      { name: 'Iol', resources: 2, influence: 3, ready: true, trait: 'Cultural' },
      { name: 'Xxehan', resources: 1, influence: 2, ready: true, trait: 'Hazardous' }
    ],
    units: { spaceDocks:1, carriers:2, cruisers:1, destroyers:0, dreadnoughts:0, warSuns:0, fighters:2, infantry:5, pds:1 }
  },
  'Nomad': {
    description: '(Prophecy of Kings) Triple agent value and steady Agenda Phase income. A flexible, opportunistic faction with no fixed homeworld to defend.',
    homeworlds: 'Arcturus (4R/4I)',
    startingTech: ['Sling Relay'],
    commodities: 4,
    keyAbility: 'THE COMPANY: You start with 3 faction agents instead of the usual 1. FUTURE SIGHT: During the Agenda Phase, after an outcome you voted for or predicted resolves, gain 1 trade good.',
    planets: [
      { name: 'Arcturus', resources: 4, influence: 4, ready: true, trait: 'Cultural' }
    ],
    units: { carriers: 2, destroyers: 2, fighters: 3, infantry: 4, pds: 1, spaceDocks: 1, cruisers: 0, dreadnoughts: 0, flagships: 1, warsuns: 0 }
  },
  'Mahact Gene-Sorcerers': {
    description: '(Prophecy of Kings) Steal command tokens from defeated enemies to build a massive fleet. The most powerful faction in the game — and the most complex.',
    homeworlds: 'Ixth (3R/5I)',
    startingTech: ['Bio-Stims', 'Predictive Intelligence'],
    commodities: 3,
    keyAbility: 'EDICT: When you win a combat, place 1 of your opponent\'s command tokens into your fleet pool — it raises your fleet limit but can\'t be redistributed. IMPERIA: While an opponent\'s token sits in your fleet pool, you may use their unlocked commander ability. HUBRIS: You purge your Alliance promissory note during setup.',
    planets: [
      { name: 'Ixth', resources: 3, influence: 5, ready: true, trait: 'Cultural' }
    ],
    units: { carriers: 1, cruisers: 1, destroyers: 1, fighters: 2, infantry: 3, pds: 1, spaceDocks: 0, dreadnoughts: 0, flagships: 1, warsuns: 0 }
  },
};

// Opponents pool — picks 3 that don't include the player's faction
const OPPONENT_POOL = [
  { faction: 'Emirates of Hacan',      name: 'Merchant-Lord Azan', vp: 0, strategyCards: [], commandTokens: {tactics:3,fleet:3,strategy:2}, planets: [{name:'Arretze',res:2,inf:1},{name:'Kamdorn',res:0,inf:1},{name:'Hercant',res:1,inf:1}], fleets: {}, technologies: ['Antimass Deflectors', 'Sarween Tools'], tradeGoods: 3, attitude: 'neutral', intent: 'Accumulating trade goods and building diplomatic leverage; eyeing mid-ring planets for economic expansion.' },
  { faction: 'Universities of Jol-Nar', name: 'Archon Veth',       vp: 0, strategyCards: [], commandTokens: {tactics:3,fleet:3,strategy:2}, planets: [{name:'Jol',res:1,inf:2},{name:'Nar',res:2,inf:3}],                   fleets: {}, technologies: ['Neural Motivator', 'Sarween Tools', 'Plasma Scoring'], tradeGoods: 0, attitude: 'neutral', intent: 'Racing for tech superiority; will turtle early and snowball into an unstoppable research engine.' },
  { faction: 'L1Z1X Mindnet',           name: 'Collective Ω',       vp: 0, strategyCards: [], commandTokens: {tactics:3,fleet:3,strategy:2}, planets: [{name:'[0.0.0]',res:5,inf:0}],                     fleets: {}, technologies: ['Neural Motivator', 'Plasma Scoring'], tradeGoods: 0, attitude: 'neutral', intent: 'Aggressive expansion toward Mecatol Rex; will threaten neighbors early to establish board dominance.' },
  { faction: 'Barony of Letnev',        name: 'Baron Vael',         vp: 0, strategyCards: [], commandTokens: {tactics:3,fleet:3,strategy:2}, planets: [{name:'Arc Prime',res:4,inf:0},{name:'Wren Terra',res:2,inf:1}],      fleets: {}, technologies: ['Antimass Deflectors', 'Plasma Scoring'], tradeGoods: 2, attitude: 'neutral', intent: 'Leveraging Dreadnought strength to control key systems; spending trade goods strategically in combat.' },
  { faction: 'Xxcha Kingdom',           name: 'Speaker Xxeilo',     vp: 0, strategyCards: [], commandTokens: {tactics:3,fleet:3,strategy:2}, planets: [{name:'Archon Ren',res:2,inf:3},{name:'Archon Tau',res:1,inf:1}],     fleets: {}, technologies: ['Graviton Laser System'], tradeGoods: 0, attitude: 'neutral', intent: 'Accumulating political influence and VP through Agenda Phase manipulation; avoiding early combat.' },
];

function getOpponents(playerFaction, count) {
  const n = Math.max(1, Math.min(OPPONENT_POOL.length, count || 3));
  return OPPONENT_POOL.filter(o => o.faction !== playerFaction).slice(0, n);
}

function getDraftRule(totalPlayers) {
  if (totalPlayers <= 4) {
    return `VERIFIED RULE: in a ${totalPlayers}-player game, each player drafts TWO strategy cards (not one). All 8 cards get claimed — no leftovers, no trade-goods-on-unpicked-cards. Initiative for the Action Phase is the LOWER-numbered of a player's two cards. A player cannot pass in the Action Phase until both of their cards' primaries have been used.`;
  }
  return `VERIFIED RULE: in a ${totalPlayers}-player game, each player drafts only ONE strategy card. With 8 cards and ${totalPlayers} players, ${8 - totalPlayers} card(s) go unpicked — place 1 trade good on each unpicked card; whoever picks it in a later round's draft gains those accumulated trade goods. Initiative for the Action Phase is simply each player's one card number.`;
}

const STATE_VERSION = 2;

// ── System Prompt ──────────────────────────────────────────────────────────────

function buildBasePrompt(factionName, opponentCount) {
  const f = FACTIONS[factionName] || FACTIONS['Federation of Sol'];
  const opponents = getOpponents(factionName, opponentCount);
  const totalPlayers = opponents.length + 1;

  return `You are a TI4 Game Master and Coach running a full game for first-time player Kramer (experienced board gamer, wants real strategy not hand-holding). Run all four phases accurately, play opponents with distinct faction personalities, and teach Kramer the WHY behind every decision.

Kramer plays ${factionName}. Key ability: ${f.keyAbility}. Starting tech: ${f.startingTech.join(', ')||'none'}.
Opponents: ${opponents.map(o=>`${o.name} (${o.faction})`).join(', ')}.

## Response Format
Use these section markers every response:

[GM] Narrate the game — vivid, efficient. War room briefing, not a novel.
[COACH] [VERDICT:Good/Risky/Poor] then 3–5 sentences: what he did well, what he missed, expert alternative. Don't repeat [GM].
[OPPONENTS] ### Name (Faction) — 1-2 sentences on their action and reasoning. Action Phase: ONE opponent per response only.
[CHOICES] Always end here with 3 options, unless Kramer asked a pure rules question.
[DEBRIEF] Status Phase only: **This Round:** / **Missed:** / **Concept:**

## State Protocol
Every response outputs EVENTS then STATE.

EVENTS block (omit entirely if nothing happened):
<!--EVENTS:
SPEND: N tactics/fleet/strategy/trade-goods
BUILD: N unit-type at system-name
COMBAT: system-name — Kramer loses N unit-type
EXHAUST: planet-name
READY: planet-name
DRAW: action-card "Name"
PLAY: action-card "Name"
DISCARD: action-card "Name"
DRAW: secret-objective "Name — condition"
SCORE: objective "Name" (+NVP)
OPP_SCORE: opponent-name scored "Name" (+NVP)
OPP_SPEND: opponent-name N tactics/fleet/strategy/trade-goods
USE_PRIMARY: card-name
PASS: player-name
RESEARCH: Technology Name
LAW: "Name — effect" passed/repealed
SPEAKER: player-name
INTENT: opponent-name "one-sentence description of their current plan"
CAPTURE: opponent-name planet-name (opponent gains a planet)
LOSE_PLANET: opponent-name planet-name (opponent loses a planet)
OPP_FLEET: opponent-name system-name carriers:N fighters:N cruisers:N destroyers:N dreadnoughts:N
-->
Emit USE_PRIMARY when any player executes a strategy card primary.
Emit INTENT whenever an opponent's plan meaningfully shifts (after a major combat, scoring an objective, or a strategic pivot). Keep intent under 15 words.
Emit CAPTURE/LOSE_PLANET whenever any opponent gains or loses control of a planet.
Emit OPP_FLEET after any opponent fleet moves or is built — show ship counts in the destination system (omit 0-count types).
New round start: also reset roundLog to [] in STATE. Emit PASS when any player passes. Emit OPP_SPEND for every opponent token or trade-good expenditure (activating a system = 1 tactics; using a secondary = 1 strategy).
New round start: STATE must reset player.usedPrimaries=[], player.hasPassed=false, and all opponents' usedPrimary=null, hasPassed=false.

STATE block (changed fields only, after EVENTS):
<!--STATE:{...}-->
Use STATE for: round, phase, opponentQueue, player.strategyCards, player.vp, player.tradeGoods, opponents[].strategyCards, opponents[].vp, publicObjectives.
Never put actionCards, secretObjectives, technologies, or activeLaws in STATE — those are EVENTS.
Status Phase: STATE opponents array must include ALL opponents with current vp — omitting one erases their data.
publicObjectives entry: {"name":"...","condition":"...","type":"stage1|stage2|secret","scored":false,"playerProgress":"..."}

## Phase Rules

### Round 1 Setup
Before the first Strategy Phase: deal Kramer 1 secret objective (DRAW: secret-objective). Choose one appropriate for ${factionName}. Show him what it is and how achievable it is (2 sentences in [GM]). Narrate opponents receiving theirs without revealing them.

### Strategy Phase
${getDraftRule(totalPlayers)}
UI shows all 8 cards — do NOT list or describe them. Coach the pick decision only (3-5 sentences in [COACH]).
After Kramer picks: 1-sentence [GM] confirm, then opponents pick in [OPPONENTS] with one-line reasoning. Update state.opponents[].strategyCards. Repeat until draft complete, then move to Action Phase.

### Action Phase
State is authoritative — read it, never infer from conversation history:
- Cards marked [PRIMARY USED]: never offer that primary again this round. [available] = can still be used.
- Opponents with passed=YES: exclude from opponentQueue entirely.
- [PRIMARY USED] doesn't block tactical/component actions, only another Strategic Action.

Before narrating each opponent's action, consult their `intent` in the state to decide what they do — their action should serve that plan. If a major event (big combat loss, objective scored, pivot forced) changes their strategy, emit INTENT with a revised plan.

Turn structure — one opponent per response, strict initiative order:
- After Kramer acts or passes: set opponentQueue to all non-passed opponents due before his next turn (initiative order).
- Each response: resolve first opponent in queue, remove them from STATE opponentQueue.
  - Queue still has entries → [CHOICES] option 1 must be "Continue — let [Name] take their turn". Short [GM]/[COACH] (1-2 sentences). Add option 2 only if opponent's action directly affects Kramer.
  - Queue empty → Kramer's turn, full [GM]/[COACH]/[CHOICES] detail.
- Phase ends only when ALL players have passed.

Secondaries — resolve every time any player uses a strategy card primary:
- Kramer plays primary: resolve ALL opponents' secondary decisions in [OPPONENTS]. Each spends 1 strategy token or declines — narrate every decision explicitly.
- Opponent plays primary: offer Kramer the secondary in [CHOICES] ("Use X secondary — spend 1 strategy token to [benefit]") with [COACH] on whether it's worth it. Resolve all other opponents' secondary decisions in [OPPONENTS].
- Leadership exception: secondary costs influence (3 per token gained), not a strategy token.

### Status Phase
Reveal and explain new public objective (add to STATE publicObjectives). Walk Kramer through scoring. Redistribute/refresh/repair in order. Show all VP totals. End with [DEBRIEF].

### Agenda Phase
Skipped until state.custodiansRemoved=true. Removing Custodians Token requires 6 influence + ground forces on Mecatol Rex (grants 1 VP immediately, unlocks phase permanently). While locked: skip straight to next round. Once unlocked: present both agendas, walk through voting (influence = votes; trade goods cannot vote), opponents vote with reasoning, Speaker breaks ties.

## Rules Reference
- Win: 10 VP immediately. Alt end: public objective deck exhausted (~round 8-9); most VP wins.
- Strategy cards: 1-Leadership 2-Diplomacy 3-Politics 4-Construction 5-Trade 6-Warfare 7-Technology 8-Imperial. No others exist.
- Activation: 1 tactic token on system. Each system once per round.
- Fleet pool count = max non-fighter ships in one system. Fighters/infantry don't count.
- Production: fixed per unit card. Fighters and infantry produce 2 per cost spent.
- Combat: attacker rolls first each round. Hit = roll ≥ combat value. Space combat before ground combat.
- Sustain Damage: cancel 1 hit by marking unit damaged; can't sustain again until Status Phase repair. Doesn't block Anti-Fighter Barrage.
- Trade: commodities only spent by giving to another player (becomes their trade goods). Can't spend your own.
- Tech prereqs: 1 owned tech of matching color per icon (Blue=Propulsion, Green=Biotic, Yellow=Cybernetic, Red=Warfare). Tech-specialty planets waive one prereq icon.
- Objectives: max 1 public + 1 secret scored per player per Status Phase. Secret hand cap: 3.
- Mecatol Rex: 6 influence to land troops. 1 VP for control at Status Phase end.

Tone: veteran player coaching a friend. Direct, confident, occasionally dry. Reference ${factionName}'s specific abilities when coaching.`;
}

// ── State Construction ──────────────────────────────────────────────────────────

function buildInitialState(factionName, opponentCount) {
  const f = FACTIONS[factionName] || FACTIONS['Federation of Sol'];
  const opponents = getOpponents(factionName, opponentCount);
  return {
    stateVersion: STATE_VERSION,
    round: 1,
    phase: 'strategy',
    turn: 0,
    speakerIndex: Math.floor(Math.random() * (opponents.length + 1)),
    faction: factionName,
    opponentCount: opponents.length,
    player: {
      vp: 0,
      tradeGoods: 0,
      commodities: f.commodities,
      commandTokens: { tactics: 3, fleet: 3, strategy: 2 },
      strategyCards: [],
      planets: JSON.parse(JSON.stringify(f.planets)),
      units: { ...f.units },
      fleets: {},
      technologies: [...f.startingTech],
      actionCards: [],
      secretObjectives: [],
      promissoryNotes: []
    },
    opponents: JSON.parse(JSON.stringify(opponents)),
    mecatolControlled: false,
    mecatolController: null,
    custodiansRemoved: false,
    publicObjectives: [],
    scoredObjectives: [],
    activeLaws: [],
    opponentQueue: [],
    roundLog: []
  };
}

function migrateState(state) {
  const v = state.stateVersion || 0;
  if (v >= STATE_VERSION) return state;

  // v0→v1: no-op (pre-versioning)
  // v1→v2: expand opponent planet strings to objects; add fleets/roundLog
  if (v < 2) {
    (state.opponents || []).forEach(o => {
      if (Array.isArray(o.planets) && o.planets.length && typeof o.planets[0] === 'string') {
        o.planets = o.planets.map(name => ({ name, res: 2, inf: 2 }));
      }
      if (!o.fleets) o.fleets = {};
    });
    if (!state.player) state.player = {};
    if (!state.player.fleets) state.player.fleets = {};
    if (!state.roundLog) state.roundLog = [];
  }

  state.stateVersion = STATE_VERSION;
  return state;
}

// ── Persistence ────────────────────────────────────────────────────────────────


function deepMerge(target, source) {
  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      if (!target[key]) target[key] = {};
      deepMerge(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

function buildSystemPrompt(state, mapSummary) {
  const factionName = state.faction || 'Federation of Sol';
  migrateState(state);
  return `${buildBasePrompt(factionName, state.opponents?.length || state.opponentCount)}

## Current Game State
Round: ${state.round} | Phase: ${state.phase}
Speaker: ${(() => { const all = [factionName, ...(state.opponents||[]).map(o=>o.name)]; return all[state.speakerIndex ?? 0] || factionName; })()}
Your VP: ${state.player.vp} | Opponents: ${(state.opponents||[]).map(o => `${o.name} ${o.vp}VP`).join(', ')}
Your Command Tokens — Tactics: ${state.player.commandTokens.tactics}, Fleet: ${state.player.commandTokens.fleet}, Strategy: ${state.player.commandTokens.strategy}
Your Trade Goods: ${state.player.tradeGoods} | Commodities: ${state.player.commodities}
Your Strategy Cards: ${(() => {
  const cards = state.player?.strategyCards || [];
  const used = state.player?.usedPrimaries || [];
  if (!cards.length) return 'none chosen yet';
  return cards.map(c => used.includes(c) ? `${c} [PRIMARY USED]` : `${c} [available]`).join(', ');
})()}
Your Pass Status: ${state.player?.hasPassed ? 'PASSED this round' : 'active'}
Opponents this round:
${(state.opponents||[]).map(o => {
  const cards = (o.strategyCards||[]).map(c => o.usedPrimary === c ? `${c}[USED]` : c).join(', ') || 'no cards';
  const ct = o.commandTokens || {tactics:3,fleet:3,strategy:2};
  const planetList = (o.planets||[]).map(p => typeof p === 'string' ? p : `${p.name}(${p.res}R/${p.inf}I)`).join(', ') || 'none';
  const fleetLines = Object.entries(o.fleets||{}).map(([sys,ships]) => {
    const parts = Object.entries(ships).filter(([,n])=>n>0).map(([t,n])=>`${n}${t}`).join('+');
    return `${sys}:[${parts}]`;
  }).join(' ') || 'home only';
  return `  ${o.name} (${o.faction||'?'}): cards=${cards} | passed=${o.hasPassed?'YES':'no'} | vp=${o.vp||0} | tokens: tac=${ct.tactics} fleet=${ct.fleet} strat=${ct.strategy} | tg=${o.tradeGoods||0}\n    planets: ${planetList}\n    fleets: ${fleetLines}\n    intent: ${o.intent||'(unknown)'}`;
}).join('\n') || '  (none)'}
Your Planets: ${state.player.planets.map(p => `${p.name}(${p.resources}/${p.influence},${p.ready ? 'ready' : 'exhausted'})`).join(', ')}
Your Technologies: ${state.player.technologies.join(', ') || 'none'}
Your Action Cards in hand: ${state.player.actionCards?.length ? state.player.actionCards.join(', ') : 'none'}
Your Secret Objectives: ${state.player.secretObjectives?.length ? state.player.secretObjectives.map(o => `${o.name}${o.scored?' (scored)':''}`).join(', ') : 'none'}
Your Promissory Notes held: ${state.player.promissoryNotes?.length ? state.player.promissoryNotes.join(', ') : 'none'}
Your Units: ${JSON.stringify(state.player.units)}
Custodians Token Removed (unlocks Agenda Phase): ${state.custodiansRemoved ? 'yes' : 'no'}
Opponent Turn Queue (Action Phase only): ${state.opponentQueue?.length ? state.opponentQueue.join(', ') : 'empty — it is Kramer\'s turn'}
Active Laws: ${state.activeLaws?.length ? state.activeLaws.join(', ') : 'none'}
${state.roundLog?.length ? `\n## Round ${state.round} Action Log (authoritative sequence)\n${state.roundLog.map((e,i)=>`${i+1}. [${e.player}] ${e.action}`).join('\n')}` : ''}
${mapSummary ? `\n## Galaxy Map\nEach tile listed as pos (position index), type, and planet stats (R=resources, I=influence).\n${mapSummary}` : ''}`.trim();
}

// ── Server ─────────────────────────────────────────────────────────────────────

app.get('/api/factions', (req, res) => {
  res.json(Object.keys(FACTIONS));
});

app.post('/api/state/reset', (req, res) => {
  res.json({ ok: true });
});

function buildMapSummary(board) {
  if (!board || !board.length) return null;
  const lines = [];
  for (const tile of board) {
    if (tile.type === 'empty' || !tile.type) continue;
    if (tile.type === 'mecatol') {
      lines.push(`pos${tile.pos}: Mecatol Rex (resources:1/influence:6) [GALACTIC CENTER]`);
      continue;
    }
    if (tile.type === 'home') {
      const planets = (tile.planets||[]).map(p=>`${p.name}(${p.resources}R/${p.influence}I)`).join(', ');
      lines.push(`pos${tile.pos}: HOME — ${tile.faction||'?'} — ${planets||'no planets'}`);
      continue;
    }
    if (tile.type === 'system') {
      const planets = (tile.planets||[]).map(p=>`${p.name}(${p.resources}R/${p.influence}I${p.trait?'/'+p.trait:''})`).join(', ');
      const extras = [tile.anomaly && `anomaly:${tile.anomaly}`, tile.wh && `wormhole:${tile.wh}`].filter(Boolean).join(' ');
      lines.push(`pos${tile.pos}: ${tile.name||'System'} — ${planets||'no planets'}${extras?' ['+extras+']':''}`);
    }
  }
  return lines.join('\n');
}

app.post('/api/turn', async (req, res) => {
  const { history, state, board } = req.body;
  if (!history || !Array.isArray(history)) {
    return res.status(400).json({ error: 'history array required' });
  }

  const gameState = (state && state.player && state.player.planets) ? state : buildInitialState((state && state.faction) || 'Federation of Sol', state && state.opponentCount);
  const mapSummary = buildMapSummary(board);
  const trimmedHistory = history.slice(-40);

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Transfer-Encoding', 'chunked');
  res.setHeader('Cache-Control', 'no-cache');

  try {
    const stream = await anthropic.messages.stream({
      model: 'claude-sonnet-4-6',
      max_tokens: 4000,
      system: buildSystemPrompt(gameState, mapSummary),
      messages: trimmedHistory
    });

    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
        res.write(chunk.delta.text);
      }
    }
    res.end();
  } catch (err) {
    console.error('Anthropic API error:', err);
    if (!res.headersSent) res.status(500).json({ error: err.message });
    else res.end();
  }
});

// ── Rules Reference Endpoint ──────────────────────────────────────────────────

app.post('/api/rules', async (req, res) => {
  const { question } = req.body;
  if (!question) return res.status(400).json({ error: 'question required' });

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Transfer-Encoding', 'chunked');

  try {
    const stream = anthropic.messages.stream({
      model: 'claude-sonnet-4-6',
      max_tokens: 600,
      system: `You are a Twilight Imperium 4th Edition rules expert. Answer rules questions clearly and concisely.

Verified facts that override any conflicting prior assumption (confirmed against the official Living Rules Reference — do not contradict these):
- In a 3- or 4-player game, each player drafts TWO strategy cards, not one. Initiative is the lower-numbered of the two.
- The Agenda Phase does not happen every round — it's permanently unlocked only after a player removes the Custodians Token from Mecatol Rex (pay 6 influence + commit 1+ ground forces during an invasion of it; grants 1 VP immediately).
- There is no official "round 6" end condition. The game ends at 10 VP, or when the public objective deck is exhausted during a Status Phase reveal (whoever has the most VP then wins).
- Leadership's secondary ability costs influence only (3 per command token) — it does NOT cost a strategy-pool command token like the other 7 cards' secondaries.
- Fleet pool token count caps non-fighter ships only; fighters and ground forces are uncapped by it.
- Secret objective hand cap is 3 (scored + unscored combined).

Guidelines:
- Be accurate to the rules as written (base game + PoK where relevant)
- Use bold for key terms and rule names
- Keep answers under 250 words unless complexity demands more
- When relevant, note timing (e.g. "during Space Cannon step", "before combat begins")
- Format numbered steps for sequences (e.g. combat round order)
- If a rule has a common exception or edge case, mention it briefly
- Do not discuss strategy — only rules`,
      messages: [{ role: 'user', content: question }]
    });

    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta' && chunk.delta?.type === 'text_delta') {
        res.write(chunk.delta.text);
      }
    }
    res.end();
  } catch (err) {
    if (!res.headersSent) res.status(500).json({ error: err.message });
    else res.end();
  }
});

// ── Sub-agent: Opponent Turn ───────────────────────────────────────────────────
// Focused Haiku call — decides one opponent's action and returns structured JSON.
// Client calls this for every entry in opponentQueue instead of burning a full
// Sonnet turn on a "Continue — let X go" round-trip.
app.post('/api/opponent-turn', async (req, res) => {
  const { opponent, gameState } = req.body;
  if (!opponent) return res.status(400).json({ error: 'opponent required' });

  const { round, phase, opponents, publicObjectives, playerVp, playerPassed, playerCards } = gameState || {};
  const ct = opponent.commandTokens || { tactics: 3, fleet: 3, strategy: 2 };
  const cards = (opponent.strategyCards || [])
    .map(c => opponent.usedPrimary === c ? `${c}[USED]` : `${c}[available]`).join(', ') || 'no cards';
  const planets = (opponent.planets || [])
    .map(p => typeof p === 'string' ? p : `${p.name}(${p.res}R/${p.inf}I)`).join(', ') || 'none';
  const others = (opponents || []).filter(o => o.name !== opponent.name)
    .map(o => `  ${o.name}: ${o.vp}VP passed=${o.hasPassed ? 'YES' : 'no'}`).join('\n') || '  (none)';
  const objs = (publicObjectives || []).map(o => o.name).join(', ') || 'none revealed';

  const systemPrompt = `You are simulating ${opponent.name} (${opponent.faction}) in Twilight Imperium 4, Round ${round||'?'}, Action Phase.
Choose ONE action that serves their intent. Be decisive and consistent with their faction's playstyle.

${opponent.name}'s state:
  Cards: ${cards}
  VP: ${opponent.vp||0} | Trade goods: ${opponent.tradeGoods||0}
  Tokens — tactics:${ct.tactics} fleet:${ct.fleet} strat:${ct.strategy}
  Planets: ${planets}
  Intent: ${opponent.intent || '(no intent set)'}

Other players:
  Kramer (player): ${playerVp||0}VP passed=${playerPassed?'YES':'no'} cards=${(playerCards||[]).join('/')||'none'}
${others}

Public objectives: ${objs}

Action options:
  - Tactical (spend 1 tactics token to activate a system)
  - Strategic (play an [available] strategy card primary — costs 0 tokens)
  - Pass (only if they have used all available card primaries or choose to)

Respond ONLY with this exact JSON — no markdown fences, no extra keys:
{"action":"one-line summary","narrative":"1-3 sentences of vivid in-world narration","events":["VERB: detail"],"intentUpdate":null}

Event verb rules (emit only what actually happened):
  OPP_SPEND: Name N tactics/fleet/strategy/trade-goods
  USE_PRIMARY: Card Name
  PASS: Name
  CAPTURE: Name planet-name
  INTENT: Name "new plan under 14 words"
Set intentUpdate to a new plan string if their strategy meaningfully shifted, else null.`;

  try {
    const msg = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 400,
      system: systemPrompt,
      messages: [{ role: 'user', content: `Decide ${opponent.name}'s next action.` }]
    });
    const raw = msg.content[0]?.text || '{}';
    const decision = JSON.parse(raw);
    res.json(decision);
  } catch (err) {
    console.error('Opponent turn error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ── Sub-agent: State Extractor ─────────────────────────────────────────────────
// Fallback Haiku call — extracts EVENTS+STATE from GM narrative when the blocks
// are missing or malformed. Client calls this only when parsing fails.
app.post('/api/extract-state', async (req, res) => {
  const { narrative, currentState } = req.body;
  if (!narrative) return res.json({ events: [], state: null });

  try {
    const msg = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 500,
      system: `Extract structured game state changes from this TI4 GM narrative.
Return ONLY this JSON (no markdown):
{"events":["VERB: detail",...],"state":{/*only changed fields*/}}

Event verbs: SPEND BUILD COMBAT EXHAUST READY DRAW PLAY DISCARD SCORE OPP_SCORE OPP_SPEND USE_PRIMARY PASS RESEARCH CAPTURE LOSE_PLANET OPP_FLEET INTENT LAW SPEAKER
Only include events you're confident about. Prefer fewer correct events over many guessed ones.
For state: only include fields that changed — common: round, phase, opponentQueue, player.vp, player.tradeGoods, opponents[].vp`,
      messages: [{ role: 'user', content: `Current state: round=${currentState?.round} phase=${currentState?.phase} playerVp=${currentState?.player?.vp}\n\nNarrative:\n${narrative.slice(0, 3000)}` }]
    });
    const result = JSON.parse(msg.content[0]?.text || '{"events":[],"state":null}');
    res.json(result);
  } catch (err) {
    res.json({ events: [], state: null });
  }
});

// ── Sub-agent: Scoring Verifier ────────────────────────────────────────────────
// Focused Haiku call — checks claimed VP scoring against actual player state
// before the Status Phase STATE block is merged. Blocks invalid claims.
app.post('/api/verify-scoring', async (req, res) => {
  const { claimed, playerState, round } = req.body;
  if (!claimed?.length) return res.json({ verified: [] });

  const techs = (playerState?.technologies || []).join(', ') || 'none';
  const planets = (playerState?.planets || []).map(p => `${p.name}(${p.ready?'ready':'exhausted'})`).join(', ') || 'none';
  const units = JSON.stringify(playerState?.units || {});

  try {
    const msg = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 400,
      system: `You are verifying TI4 scoring claims at end of Round ${round||'?'}.
Player state:
  Technologies: ${techs}
  Planets controlled: ${planets}
  Units: ${units}
  VP before scoring: ${playerState?.vp||0}

For each claimed objective, determine if the scoring condition is plausibly met given the state.
Err toward valid unless the state clearly contradicts the condition.
Return ONLY this JSON:
{"verified":[{"name":"Objective Name","valid":true,"reason":"brief"}]}`,
      messages: [{ role: 'user', content: `Verify these scoring claims:\n${claimed.map(c => `- ${c.name}: ${c.condition}`).join('\n')}` }]
    });
    const result = JSON.parse(msg.content[0]?.text || '{"verified":[]}');
    res.json(result);
  } catch (err) {
    res.json({ verified: claimed.map(c => ({ name: c.name, valid: true, reason: 'verification unavailable' })) });
  }
});

// ── Sub-agent: History Summarizer ─────────────────────────────────────────────
// Focused Haiku call — condenses old history into a compact paragraph.
// Client calls this when history exceeds 30 entries, replaces old entries
// with a single summary message to keep the GM's context coherent.
app.post('/api/summarize', async (req, res) => {
  const { history, faction, round } = req.body;
  if (!history?.length) return res.json({ summary: '' });

  const text = history.map(m => `[${m.role}]: ${typeof m.content === 'string' ? m.content : JSON.stringify(m.content)}`).join('\n\n');

  try {
    const msg = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 400,
      system: `You are summarizing a Twilight Imperium 4 game log for ${faction||'the player'} (called Kramer).
Produce a single dense paragraph (under 120 words) covering: what rounds occurred, who scored VP and how, major combats, which strategy cards were played, and any laws passed.
Preserve specific VP totals and planet names. Omit rules explanations. Write in past tense. No bullet points.`,
      messages: [{ role: 'user', content: `Summarize this game history through Round ${round||'?'}:\n\n${text}` }]
    });
    res.json({ summary: msg.content[0]?.text || '' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Sub-agent: STATE Validator ─────────────────────────────────────────────────
// Focused Haiku call — validates a raw STATE block, returns repaired JSON.
// Client calls this when a STATE block fails basic schema checks before merge.
app.post('/api/validate-state', async (req, res) => {
  const { rawState, currentState } = req.body;
  if (!rawState) return res.json({ valid: false, repaired: null, issues: ['empty input'] });

  try {
    const msg = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 600,
      system: `You are a JSON repair assistant for a Twilight Imperium 4 game state.
You receive a raw STATE object that may have type errors or missing fields.
Return ONLY a JSON object with two keys:
- "repaired": the corrected state object (fix types, coerce strings to numbers for vp/round/tradeGoods, remove unknown top-level keys)
- "issues": array of strings describing what you fixed (empty array if nothing needed fixing)
Known schema: round(number), phase(string), player.vp(number), player.tradeGoods(number), opponents(array with vp numbers).
Do not invent values — only fix type errors or obviously corrupt fields. If a field is ambiguous, keep it.`,
      messages: [{ role: 'user', content: `Current state snapshot (for reference): ${JSON.stringify({round: currentState?.round, phase: currentState?.phase, playerVp: currentState?.player?.vp})}\n\nRaw STATE to validate:\n${rawState}` }]
    });
    const result = JSON.parse(msg.content[0]?.text || '{}');
    res.json({ valid: true, repaired: result.repaired || null, issues: result.issues || [] });
  } catch (err) {
    res.status(500).json({ valid: false, repaired: null, issues: [err.message] });
  }
});

app.post('/api/board', async (req, res) => {
  const state = req.body.state || {};
  const faction = state.faction || 'Federation of Sol';
  const opponentNames = (state.opponents || []).map(o => o.faction).join(', ') || 'Emirates of Hacan, Universities of Jol-Nar, L1Z1X Mindnet';

  const prompt = `Generate a Twilight Imperium 4th edition galaxy map for a game with these factions: ${faction} (the human player), ${opponentNames}.

Return ONLY a JSON array of 37 tile objects — no other text, no explanation, no markdown, no code fences, no pretty-printing. Output compact JSON with no extra whitespace or newlines inside the array. The entire response must be a single valid JSON array on as few lines as possible.

Layout positions (0-indexed):
- pos 0: Mecatol Rex (center, fixed)
- pos 1-6: Ring 1 around Mecatol
- pos 7-18: Ring 2 (mid-ring, 12 systems)
- pos 19-36: Ring 3 (outer, 18 systems)
- Home system positions: 19(E), 22(NE), 25(NW), 28(W), 31(SW), 34(SE) — assign one per faction

Each tile object:
{"pos":N,"type":"mecatol"|"home"|"system"|"empty"|"anomaly","name":"System Name or omit if empty","planets":[{"name":"Planet","res":N,"inf":N,"trait":"Industrial"|"Cultural"|"Hazardous"|null,"tech":"R"|"B"|"G"|"Y"|null}],"res":N,"inf":N,"faction":"faction name (home only)","wh":false|"alpha"|"beta","anomaly":null|"asteroid"|"supernova"|"gravity-rift"|"nebula","ctrl":null,"ships":null}

Planet trait: Industrial/Cultural/Hazardous (real TI4 planet trait). Tech: R=Red(unit upgrades), B=Blue(propulsion), G=Green(biotic), Y=Yellow(warfare) specialty — only a few planets have these, most are null.

Rules:
- pos 0 must be: {"pos":0,"type":"mecatol","name":"Mecatol Rex","planets":[{"name":"Mecatol Rex","res":1,"inf":6}],"res":1,"inf":6,"wh":false,"anomaly":null,"ctrl":null,"ships":null}
- Home systems: type "home", include faction name, 2 planets typical, ctrl = faction name
- Ring 1 (pos 1-6): good systems, 1-2 planets each, res 2-4 range
- Ring 2 (pos 7-18): mix of systems, anomalies (2-3 total), 1-2 wormholes (one alpha, one beta), some empty
- Ring 3 (non-home, pos 20-21, 23-24, 26-27, 29-30, 32-33, 35-36): mix of systems and empty tiles
- Use real TI4 system names where possible (Mecatol Rex, Arinam/Meer, Abyz/Fria, Bereg/Lirta IV, etc.)
- Total resource production should be roughly balanced across home positions`;

  // Stream raw text to client so Railway sees activity and doesn't time out
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Transfer-Encoding', 'chunked');
  res.setHeader('Cache-Control', 'no-cache');

  try {
    const stream = await anthropic.messages.stream({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 6000,
      messages: [{ role: 'user', content: prompt }]
    });

    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
        res.write(chunk.delta.text);
      }
    }
    res.end();
  } catch (err) {
    console.error('Board generation error:', err);
    if (!res.headersSent) res.status(500).json({ error: err.message });
    else res.end();
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  const interfaces = os.networkInterfaces();
  let lanIP = 'localhost';
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) { lanIP = iface.address; break; }
    }
  }
  console.log(`\nTI4 Learning Game`);
  console.log(`Local:  http://localhost:${PORT}`);
  console.log(`Phone:  http://${lanIP}:${PORT}\n`);
});
