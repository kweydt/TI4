# TI4 Learning Game — Project Brief

A mobile-first web app that lets a first-time Twilight Imperium player learn the game by actually playing it. Claude acts as Game Master, Coach, and all opponent factions simultaneously. The player uses their phone; the server runs locally on a Mac (or deployed to cloud).

## What This Is

Not a rules quiz. Not a tutorial slideshow. A real game of TI4 — narrative-driven, mechanically accurate, played turn by turn — where Claude coaches every decision inline. The player learns by doing, with an expert looking over their shoulder.

## Project Files

```
ti4-project/
├── README.md           ← you are here
├── ARCHITECTURE.md     ← system design, API structure, state shape
├── GAME_RULES.md       ← TI4 rules reference Claude Code needs to implement
├── PROMPT.md           ← the Claude system prompt (GM + Coach role)
└── UI.md               ← frontend spec, mobile layout, component details
```

## Quick Start for Claude Code

Read the files in this order:
1. `README.md` (this file) — understand the goal
2. `ARCHITECTURE.md` — build the server and state layer
3. `PROMPT.md` — wire up the Claude system prompt
4. `GAME_RULES.md` — reference while implementing phase logic
5. `UI.md` — build the frontend

Then: `npm start`, open `http://localhost:3000` on phone (same wifi), play.

## Tech Stack

- **Backend:** Node.js + Express — serves static frontend, proxies Anthropic API, maintains game state
- **Frontend:** Single `public/index.html` — vanilla JS, no framework, no build step
- **AI:** Anthropic API, `claude-sonnet-4-6`, streaming responses
- **State:** In-memory JSON object on server (optionally persisted to `state.json`)
- **Auth:** API key in `.env`, never exposed to client

## Player Context

- First-time TI4 player, experienced board gamer
- Playing Federation of Sol (beginner-friendly faction)
- Wants to understand the *why* behind decisions, not just be told what to do
- Playing on iPhone over wifi to localhost

## Opponents (Claude plays all three)

| Faction | Name | Playstyle |
|---|---|---|
| Emirates of Hacan | Merchant-Lord Azan | Trade, negotiation, economic manipulation |
| Universities of Jol-Nar | Archon Veth | Technology rush, cautious expansion |
| L1Z1X Mindnet | Collective Ω | Military aggression, early pressure |

## Victory Condition

First to 10 Victory Points wins. Standard 6-round game.
