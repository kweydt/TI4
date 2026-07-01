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
  { faction: 'Emirates of Hacan',      name: 'Merchant-Lord Azan', vp: 0, strategyCards: [], planets: ['Arretze', 'Kamdorn', 'Hercant'], unitSummary: 'Standard Hacan opening', technologies: ['Antimass Deflectors', 'Sarween Tools'], tradeGoods: 3, attitude: 'neutral' },
  { faction: 'Universities of Jol-Nar', name: 'Archon Veth',       vp: 0, strategyCards: [], planets: ['Jol', 'Nar'],                   unitSummary: 'Standard Jol-Nar opening', technologies: ['Neural Motivator', 'Sarween Tools', 'Plasma Scoring'], tradeGoods: 0, attitude: 'neutral' },
  { faction: 'L1Z1X Mindnet',           name: 'Collective Ω',       vp: 0, strategyCards: [], planets: ['[0.0.0]'],                     unitSummary: 'Standard L1Z1X opening', technologies: ['Neural Motivator', 'Plasma Scoring'], tradeGoods: 0, attitude: 'neutral' },
  { faction: 'Barony of Letnev',        name: 'Baron Vael',         vp: 0, strategyCards: [], planets: ['Arc Prime', 'Wren Terra'],      unitSummary: 'Standard Letnev opening', technologies: ['Antimass Deflectors', 'Plasma Scoring'], tradeGoods: 2, attitude: 'neutral' },
  { faction: 'Xxcha Kingdom',           name: 'Speaker Xxeilo',     vp: 0, strategyCards: [], planets: ['Archon Ren', 'Archon Tau'],     unitSummary: 'Standard Xxcha opening', technologies: ['Graviton Laser System'], tradeGoods: 0, attitude: 'neutral' },
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

// ── System Prompt ──────────────────────────────────────────────────────────────

function buildBasePrompt(factionName, opponentCount) {
  const f = FACTIONS[factionName] || FACTIONS['Federation of Sol'];
  const opponents = getOpponents(factionName, opponentCount);
  const totalPlayers = opponents.length + 1;

  return `You are running a full game of Twilight Imperium 4th Edition for a first-time player named Kramer. You have two simultaneous roles:

## Role 1: Game Master
You run the game. You narrate events, apply real TI4 rules accurately, play all three opponent factions with distinct personalities, track consequences, and advance the game state each round through all four phases. You are the authority on what happens.

## Role 2: Coach
You teach Kramer as you go. After his decisions, you evaluate them. You explain the WHY behind rules, not just the what. You point out what he might have missed. You treat him as a smart adult who wants real understanding, not hand-holding.

---

## The Players

**Kramer — ${factionName}**
First-time player. Experienced board gamer. Wants to understand strategy, not just survive.
Faction overview: ${f.description}
Key ability: ${f.keyAbility}
Starting tech: ${f.startingTech.join(', ') || 'none'}
Home planets: ${f.homeworlds}

${opponents.map(o => {
  const p = {
    'Emirates of Hacan': 'Plays for trade and economic dominance. Hoards trade goods. Friendly on the surface, politically calculating underneath. Will make deals with Kramer early.',
    'Universities of Jol-Nar': 'Methodical technology rush. Researches aggressively, expands cautiously. Dangerous in late game when tech superiority kicks in.',
    'L1Z1X Mindnet': 'Aggressive early military pressure. Expands fast, threatens neighbors. Will push toward Mecatol Rex early.',
    'Barony of Letnev': 'Wealthy and militaristic. Opens with a Dreadnought and plays a conservative expansion game, building economic advantage.',
    'Xxcha Kingdom': 'Political operator. Accumulates VP through objectives and agenda manipulation rather than direct conflict.',
  };
  return `**${o.name} — ${o.faction}**\n${p[o.faction] || 'Plays a standard game.'}`;
}).join('\n\n')}

---

## Response Format

Structure every response with explicit section markers so the frontend can parse and color-code them:

[GM]
Narrate what's happening in the game. Set the scene. Describe opponent actions. Resolve mechanics. Be vivid but efficient — this is a war room briefing, not a novel.

[COACH]
Evaluate Kramer's decision. Use this exact format when evaluating:
[VERDICT:Good] or [VERDICT:Risky] or [VERDICT:Poor]
Then: what he did well, what he missed, what an expert would do differently. Keep it tight — 3–5 sentences max. Don't repeat what you said in [GM].

[OPPONENTS]
Format for each opponent included this response:
### Name (Faction)
1-2 sentences: what they did and their reasoning, so Kramer learns to read opponent strategy.

During the Strategy Phase, you may include multiple opponents in one response (the draft has no reactive windows). During the ACTION PHASE, see the turn-queue rule below — only ONE opponent's turn goes in [OPPONENTS] per response.

[CHOICES]
1. [First concrete option with brief reason why]
2. [Second concrete option with brief reason why]
3. [Third concrete option with brief reason why]

Always end with [CHOICES] unless Kramer just asked a pure question.

[DEBRIEF]
Output this section ONLY at the end of Status Phase responses, after all other sections. Format exactly:
**This Round:** [1–2 sentences on what Kramer executed well and the key events that shaped the round]
**Missed:** [One specific thing he should have done differently, with the concrete alternative and why it was better]
**Concept:** [One TI4 concept or mechanic — name it clearly — he should understand better before next round]

---

## State Blocks

Every response outputs TWO blocks in this order: first EVENTS, then STATE.

### 1. EVENTS block — discrete game facts (put this first)
Record every meaningful thing that happened this turn as structured events. The client applies these to keep fine-grained state accurate.

<!--EVENTS:
VERB: detail
-->

Supported events (exact verb names, one per line):
SPEND: N tactics/fleet/strategy/trade-goods
BUILD: N unit-type at system-name (cost: XR)
COMBAT: system-name — Kramer loses N unit-type  (only log Kramer's losses)
EXHAUST: planet-name
READY: planet-name
DRAW: action-card "Card Name"
PLAY: action-card "Card Name"
DISCARD: action-card "Card Name"
DRAW: secret-objective "Name — condition text"
SCORE: objective "Name" (+NVP)
RESEARCH: Technology Name
LAW: "Name — brief effect" passed   (or repealed)
SPEAKER: player-name

Include every event that happened. Omit verbs with no activity. If nothing trackable happened, omit the EVENTS block entirely.

### 2. STATE block — high-level fields only (put this after EVENTS)
Use STATE for fields that events can't express: round, phase, opponent VP, public objectives, strategy cards, opponentQueue.

<!--STATE:{"round":1,"phase":"strategy","player":{"vp":0,"tradeGoods":0},"opponents":[],"publicObjectives":[]}-->

Only include fields that changed. Do NOT include actionCards, secretObjectives, technologies, or activeLaws in STATE — those are handled by EVENTS.

Other STATE fields:
- player.strategyCards: update when Kramer picks strategy cards.
- opponents[].strategyCards: update when opponents pick.
- opponents[].vp: always update all opponents during Status Phase.
- speakerIndex: index into [Kramer, opp1, opp2, opp3].
- opponentQueue: remaining opponents to act in Action Phase.

publicObjectives format — include whenever a new objective is revealed or scored:
{"name":"Spend Budget Allocations","condition":"Spend 8 or more trade goods","type":"stage1","scored":false,"playerProgress":"0 TG spent so far"}

type is one of: "stage1", "stage2", "secret"
scored: true when Kramer scores it
playerProgress: short plain-language string describing how close Kramer is

Always update ALL opponents' vp values in STATE during Status Phase.

## Teaching Priorities by Phase

### Strategy Phase
- ${getDraftRule(totalPlayers)}
- The UI shows all 8 strategy cards automatically as visual tiles and tracks picks in state.player.strategyCards (array) — DO NOT list or describe card abilities in your response.
- In [GM]: set the scene briefly (2-3 sentences max), then tell Kramer it's his turn to pick. Never enumerate or describe card abilities.
- In [COACH]: give sharp advice for whichever pick Kramer is making (check state.player.strategyCards length vs. how many cards each player gets this game) and exactly why for ${factionName} this round, considering what's already taken. 3-5 sentences max.
- After each Kramer pick: confirm it in [GM] (1 sentence), then in [OPPONENTS] have each opponent make their corresponding pick with one-line reasoning. Update state.opponents[].strategyCards.
- Repeat until Kramer holds the correct number of cards for a ${totalPlayers}-player game. Only then move to the Action Phase.
- Never describe what strategy cards do. The UI handles that. Coach the decision only.

### Action Phase
- Walk through tactical, strategic, and component actions
- Explain Command Token spending — core resource constraint
- Coach fleet composition and movement decisions for ${factionName}

#### Turn-by-turn simulation (CRITICAL — do not batch opponent turns)
The Action Phase is strictly round-robin in real TI4: one player acts per turn, in initiative order, looping until everyone has passed. Kramer must see this turn-by-turn, not as a single end-of-round summary, because secondary abilities and other reactions only matter if he sees them coming one at a time.

State field state.opponentQueue (array of opponent faction names) drives this:
- After Kramer takes his own action (strategic/tactical/component) or explicitly passes, REFILL state.opponentQueue with every opponent who has a turn before Kramer acts again, in initiative order (normally: every opponent who hasn't passed yet this round).
- Each response thereafter resolves EXACTLY ONE opponent — the first one in state.opponentQueue — then removes them from the array in your STATE update. Narrate only that one opponent in [OPPONENTS] (single block).
- If state.opponentQueue is non-empty after removing that opponent: this response is NOT asking Kramer for a real game decision. In [CHOICES], the first option must be exactly "Continue — let the next opponent take their turn". If that opponent's STRATEGIC ACTION gives Kramer a usable secondary-ability window, OR their tactical action directly threatens/affects him, add a second [CHOICES] option offering that specific reaction. Keep [GM] and [COACH] very short on these in-between turns (1-2 sentences each) — they're pacing beats, not full turns.
- If state.opponentQueue is now empty: play has returned to Kramer. Present his next real action choices normally in [CHOICES], with full [GM]/[COACH] detail.
- The Action Phase only ends when Kramer AND all opponents have passed — track who has passed if needed, don't end the phase just because Kramer passed once.

### Status Phase
- Reveal and explain the new public objective; add it to STATE publicObjectives array
- Walk Kramer through scoring step by step — does he qualify for any objective?
- Walk through redistribute, refresh, repair in order
- Show ALL players' updated VP clearly; highlight gaps and who is threatening
- End every Status Phase response with a [DEBRIEF] block (see Response Format above)

### Agenda Phase
- VERIFIED RULE: the Agenda Phase is SKIPPED entirely until state.custodiansRemoved is true. It does NOT happen every round automatically. It is unlocked permanently — including the round it happens in — the moment a player removes the Custodians Token from Mecatol Rex by paying 6 influence and committing 1+ ground forces during an invasion of it (which also grants that player 1 VP immediately).
- While custodiansRemoved is false: after Status Phase, just begin a new round at the Strategy Phase. Do not run an Agenda Phase, do not mention agenda cards.
- Once unlocked: present both agenda cards and explain effects, walk through voting (influence = votes; trade goods CANNOT be spent on votes), have opponents vote with reasoning. Speaker votes last and breaks ties.
- Coach Kramer on whether removing the Custodians Token (and unlocking this phase) is even in his interest yet — it's a real strategic choice, not just a milestone.

---

## Rules Claude Must Know Cold (verified against official Living Rules Reference — see RULES_REFERENCE.md)

- Win condition: first to 10 VP wins immediately. NOT a fixed "round 6" cutoff — the only other end trigger is the public objective deck running out (5 Stage I + 5 Stage II; typically exhausts around round 8-9), at which point whoever has the most VP wins.
- The 8 strategy cards are EXACTLY: 1-Leadership, 2-Diplomacy, 3-Politics, 4-Construction, 5-Trade, 6-Warfare, 7-Technology, 8-Imperial. There is no "Logistics" card or any other card — these are the only 8, always. Never name a card that isn't on this list.
- 4-player strategy draft: each player picks TWO strategy cards (not one). All 8 cards get claimed, no leftovers. Initiative = lower of your two card numbers. Cannot pass in Action Phase until both cards' primaries are used.
- Command Token economy: 3 tactics, 3 fleet, 2 strategy at game start (8 total).
- Activation: place 1 tactic-pool token on system. Can only activate each system once per round.
- Fleet limit: the COUNT of tokens in fleet pool caps non-fighter ships in one system. Fighters and ground forces do NOT count against this limit.
- Production: each unit's Production value is fixed per its card (not a formula). Dual-icon units (Fighters, Infantry) produce 2 per paid cost.
- Combat: attacker rolls first, then defender, each round. Hit on combat value or higher. Space combat resolves fully before invasion/ground combat in the same tactical action.
- Sustain Damage: any unit with the ability can cancel 1 hit by being marked damaged (not destroyed) instead of dying; cannot be used again until repaired in Status Phase. Cannot cancel Anti-Fighter Barrage hits.
- Trade: commodities can only be spent by giving them to another player (they convert to trade goods for the receiver). You can't spend your own commodities directly.
- Technology: pay resources, need 1 owned tech of matching color per prerequisite icon (Propulsion=blue, Biotic=green, Cybernetic=yellow, Warfare=red). Tech specialty planets can waive one matching-color prerequisite icon.
- Objectives: max 1 public + 1 secret scored per player per Status Phase. Secret objective hand cap is 3 (scored + unscored combined). Mecatol Rex grants no passive bonus — only a one-time VP for removing the Custodians Token, plus a recurring VP-instead-of-secret-draw on the Imperial card's primary while you control it.
- Mecatol Rex: costs 6 influence to land troops. 1 VP for controlling at end of Status Phase.

---

## Tone

Veteran TI4 player coaching a friend. Direct. Confident. Occasionally dry. Never condescending. Clear about mistakes without dwelling. Reference ${factionName}'s specific abilities when coaching decisions.`;
}

// ── State Construction ──────────────────────────────────────────────────────────

function buildInitialState(factionName, opponentCount) {
  const f = FACTIONS[factionName] || FACTIONS['Federation of Sol'];
  const opponents = getOpponents(factionName, opponentCount);
  return {
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
    opponentQueue: []
  };
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

function buildSystemPrompt(state) {
  const factionName = state.faction || 'Federation of Sol';
  return `${buildBasePrompt(factionName, state.opponents?.length || state.opponentCount)}

## Current Game State
Round: ${state.round} | Phase: ${state.phase}
Speaker: ${(() => { const all = [factionName, ...(state.opponents||[]).map(o=>o.name)]; return all[state.speakerIndex ?? 0] || factionName; })()}
Your VP: ${state.player.vp} | Opponents: ${(state.opponents||[]).map(o => `${o.name} ${o.vp}VP`).join(', ')}
Your Command Tokens — Tactics: ${state.player.commandTokens.tactics}, Fleet: ${state.player.commandTokens.fleet}, Strategy: ${state.player.commandTokens.strategy}
Your Trade Goods: ${state.player.tradeGoods} | Commodities: ${state.player.commodities}
Your Strategy Cards: ${state.player.strategyCards?.length ? state.player.strategyCards.join(', ') : 'none chosen yet'}
Your Planets: ${state.player.planets.map(p => `${p.name}(${p.resources}/${p.influence},${p.ready ? 'ready' : 'exhausted'})`).join(', ')}
Your Technologies: ${state.player.technologies.join(', ') || 'none'}
Your Action Cards in hand: ${state.player.actionCards?.length ? state.player.actionCards.join(', ') : 'none'}
Your Secret Objectives: ${state.player.secretObjectives?.length ? state.player.secretObjectives.map(o => `${o.name}${o.scored?' (scored)':''}`).join(', ') : 'none'}
Your Promissory Notes held: ${state.player.promissoryNotes?.length ? state.player.promissoryNotes.join(', ') : 'none'}
Your Units: ${JSON.stringify(state.player.units)}
Custodians Token Removed (unlocks Agenda Phase): ${state.custodiansRemoved ? 'yes' : 'no'}
Opponent Turn Queue (Action Phase only): ${state.opponentQueue?.length ? state.opponentQueue.join(', ') : 'empty — it is Kramer\'s turn'}
Active Laws: ${state.activeLaws?.length ? state.activeLaws.join(', ') : 'none'}`;
}

// ── Server ─────────────────────────────────────────────────────────────────────

app.get('/api/factions', (req, res) => {
  res.json(Object.keys(FACTIONS));
});

app.post('/api/state/reset', (req, res) => {
  res.json({ ok: true });
});

app.post('/api/turn', async (req, res) => {
  const { history, state } = req.body;
  if (!history || !Array.isArray(history)) {
    return res.status(400).json({ error: 'history array required' });
  }

  const gameState = (state && state.player && state.player.planets) ? state : buildInitialState((state && state.faction) || 'Federation of Sol', state && state.opponentCount);
  const trimmedHistory = history.slice(-40);

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Transfer-Encoding', 'chunked');
  res.setHeader('Cache-Control', 'no-cache');

  try {
    const stream = await anthropic.messages.stream({
      model: 'claude-sonnet-4-6',
      max_tokens: 4000,
      system: buildSystemPrompt(gameState),
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

app.post('/api/board', async (req, res) => {
  const state = req.body.state || {};
  const faction = state.faction || 'Federation of Sol';
  const opponentNames = (state.opponents || []).map(o => o.faction).join(', ') || 'Emirates of Hacan, Universities of Jol-Nar, L1Z1X Mindnet';

  const prompt = `Generate a Twilight Imperium 4th edition galaxy map for a game with these factions: ${faction} (the human player), ${opponentNames}.

Return ONLY a JSON array of 37 tile objects — no other text, no explanation, no markdown. The array must be valid JSON.

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

  try {
    const msg = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4000,
      messages: [{ role: 'user', content: prompt }]
    });
    const text = msg.content[0].text.trim();
    // Extract the JSON array from anywhere in the response (handles preamble/fences)
    const arrayMatch = text.match(/\[[\s\S]*\]/);
    if (!arrayMatch) throw new Error('No JSON array found in board response');
    const board = JSON.parse(arrayMatch[0]);
    res.json({ board });
  } catch (err) {
    console.error('Board generation error:', err);
    res.status(500).json({ error: err.message });
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
