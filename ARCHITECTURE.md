# Architecture

## File Structure

```
ti4-game/
├── server.js           ← Express server, API proxy, state management
├── public/
│   └── index.html      ← entire frontend (HTML + CSS + JS in one file)
├── package.json
├── .env                ← ANTHROPIC_API_KEY=sk-...
├── .env.example
└── state.json          ← auto-saved game state (gitignored)
```

## Server (`server.js`)

### Endpoints

```
POST /api/turn          ← main game loop endpoint
GET  /api/state         ← fetch current game state
POST /api/state/reset   ← start a new game
GET  /                  ← serves public/index.html
```

### `/api/turn` Request Body

```json
{
  "message": "I want to take the Leadership strategy card",
  "history": [
    { "role": "user", "content": "..." },
    { "role": "assistant", "content": "..." }
  ]
}
```

### `/api/turn` Response (streaming)

Stream the Anthropic response back to the client using `text/event-stream`. Each chunk is a raw text delta. Client appends chunks to the current message in the log.

```js
// Streaming pattern
const stream = await anthropic.messages.stream({
  model: 'claude-sonnet-4-6',
  max_tokens: 1500,
  system: buildSystemPrompt(gameState),
  messages: req.body.history
});

res.setHeader('Content-Type', 'text/event-stream');
for await (const chunk of stream) {
  if (chunk.type === 'content_block_delta') {
    res.write(chunk.delta.text);
  }
}
res.end();
```

### State Management

Maintain a single `gameState` object in memory. After each turn, parse Claude's `<!--STATE:...-->` block from the response and merge updates into `gameState`. Also write to `state.json` so state survives server restarts.

```js
// After receiving full response from Claude:
const stateMatch = fullResponse.match(/<!--STATE:([\s\S]*?)-->/);
if (stateMatch) {
  const updates = JSON.parse(stateMatch[1]);
  Object.assign(gameState, updates);
  fs.writeFileSync('state.json', JSON.stringify(gameState, null, 2));
}
```

## Game State Shape

```js
const gameState = {
  // Meta
  round: 1,               // 1–6
  phase: 'strategy',      // 'strategy' | 'action' | 'status' | 'agenda'
  turn: 0,                // action count within phase
  speakerIndex: 0,        // which player has speaker token (0 = player)

  // Player (Federation of Sol)
  player: {
    vp: 0,
    tradGoods: 0,
    commodities: 3,       // Sol starts with 3 commodity capacity
    commandTokens: {
      tactics: 3,
      fleet: 3,
      strategy: 2
    },
    strategyCard: null,   // e.g. 'Leadership'
    planets: [
      { name: 'Jord', resources: 4, influence: 2, ready: true, trait: 'Cultural' },
      { name: 'Moll Primus', resources: 2, influence: 3, ready: true, trait: 'Industrial' }
    ],
    units: {
      carriers: 3,
      destroyers: 1,
      fighters: 3,
      infantry: 6,
      pds: 1,
      spaceDocks: 1,
      cruisers: 0,
      dreadnoughts: 0,
      flagships: 0,
      warsuns: 0
    },
    technologies: ['Neural Motivator', 'Antimass Deflectors'], // Sol starting techs
    actionCards: [],      // titles only, not full text
    secretObjective: null,
    promissoryNotes: []
  },

  // Opponents (Claude tracks and plays these)
  opponents: [
    {
      faction: 'Emirates of Hacan',
      name: 'Merchant-Lord Azan',
      vp: 0,
      strategyCard: null,
      planets: ['Arretze', 'Kamdorn', 'Hercant'],
      unitSummary: 'Standard Hacan opening',
      technologies: ['Sarween Tools', 'Quantum Datahub Node'],
      tradeGoods: 3,
      attitude: 'neutral' // 'friendly' | 'neutral' | 'hostile'
    },
    {
      faction: 'Universities of Jol-Nar',
      name: 'Archon Veth',
      vp: 0,
      strategyCard: null,
      planets: ['Jol', 'Nar'],
      unitSummary: 'Standard Jol-Nar opening',
      technologies: ['Neural Motivator', 'Sarween Tools', 'Spec Ops II'],
      tradeGoods: 0,
      attitude: 'neutral'
    },
    {
      faction: 'L1Z1X Mindnet',
      name: 'Collective Ω',
      vp: 0,
      strategyCard: null,
      planets: ['[0.0.0]', 'Wellon'],
      unitSummary: 'Standard L1Z1X opening',
      technologies: ['Neural Motivator', 'Antimass Deflectors'],
      tradeGoods: 0,
      attitude: 'neutral'
    }
  ],

  // Board
  mecatolControlled: false,
  mecatolController: null,

  // Objectives
  publicObjectives: [],     // revealed so far
  scoredObjectives: [],

  // Agenda law effects (accumulate over game)
  activeLaws: []
};
```

## System Prompt Construction

Build the system prompt dynamically each turn, injecting current state:

```js
function buildSystemPrompt(state) {
  return `${BASE_PROMPT}

## Current Game State
Round: ${state.round} | Phase: ${state.phase}
Your VP: ${state.player.vp} | Opponents: ${state.opponents.map(o => `${o.name} ${o.vp}VP`).join(', ')}
Your Command Tokens — Tactics: ${state.player.commandTokens.tactics}, Fleet: ${state.player.commandTokens.fleet}, Strategy: ${state.player.commandTokens.strategy}
Your Trade Goods: ${state.player.tradeGoods}
Your Planets: ${state.player.planets.map(p => `${p.name}(${p.resources}/${p.influence},${p.ready?'ready':'exhausted'})`).join(', ')}
Your Technologies: ${state.player.technologies.join(', ')}
Your Units (home system): ${JSON.stringify(state.player.units)}
`;
}
```

The `BASE_PROMPT` content lives in `PROMPT.md`.

## Environment Setup

```bash
# .env
ANTHROPIC_API_KEY=sk-ant-...

# package.json scripts
"start": "node server.js",
"dev": "nodemon server.js"
```

## Mobile Access

For phone access on same wifi:
```js
// server.js — bind to 0.0.0.0 not localhost
app.listen(3000, '0.0.0.0', () => {
  const ip = require('os').networkInterfaces()['en0']?.[1]?.address;
  console.log(`Open on phone: http://${ip}:3000`);
});
```
Server logs the LAN IP on startup so there's no need to look it up manually.
