# TI4 Rules Reference

This is the mechanical reference Claude Code needs to implement phase logic and validate game state. Not exhaustive — covers what matters for a 4-player base game learning experience.

---

## Round Structure

Each round has exactly 4 phases in order:
1. **Strategy Phase**
2. **Action Phase**
3. **Status Phase**
4. **Agenda Phase**

Game ends immediately when a player reaches 10 VP (check after each scoring opportunity), or after round 6 (highest VP wins).

---

## Strategy Phase

### The 8 Strategy Cards

| # | Card | Primary Ability | Secondary Ability |
|---|------|----------------|-------------------|
| 1 | Leadership | Gain 3 Command Tokens | Spend 3 influence → gain 1 CC |
| 2 | Diplomacy | Ready 2 planets in any system; other players can't activate your systems next round | Spend 1 TG → ready 1 planet |
| 3 | Politics | Draw 2 action cards; choose next Speaker | Draw 1 action card |
| 4 | Construction | Place 1 Space Dock OR 1 PDS on a planet you control | Spend 1 TG → place 1 PDS |
| 5 | Trade | Gain 3 TG; replenish commodities; break all trade agreements | Replenish commodities |
| 6 | Warfare | Remove 1 CC from board → return to reinforcements; ready all your ships | Remove 1 CC from your tactics pool |
| 7 | Technology | Research 1 technology | Spend 6 resources → research 1 tech |
| 8 | Imperial | Score 1 VP if you control Mecatol Rex; draw 1 secret objective | Spend 5 influence → draw 1 secret objective |

### Draft Order
Starting with Speaker, going clockwise, each player picks one strategy card. In a 4-player game each player gets exactly one card. Unpicked cards get 1 trade good placed on them; next player to pick that card gains those TGs.

### Initiative
During Action Phase, players act in order of their strategy card number (lowest first). This is critical — Leadership (1) acts before Imperial (8).

---

## Action Phase

Players take turns in initiative order. On your turn, take exactly one action, then pass to next player. Continue until all players have passed.

### Action Types

**A. Tactical Action** (most common)
1. Activate a system (place tactics CC on it — system can't be activated again this round)
2. Move ships from adjacent systems into activated system (must have enough fleet supply)
3. Resolve space combat if enemy ships present
4. Invade planets (land ground troops)
5. Resolve ground combat if enemy troops present
6. Gain control of empty planets (place control token)
7. Produce units at space dock in activated system (optional, costs resources)

**B. Strategic Action**
Play your strategy card's primary ability. All other players may then use the secondary ability (costs strategy CCs unless their faction has an exception).

**C. Component Action**
Use an "Action:" ability on a technology card, action card, faction ability, etc.

**D. Pass**
You can no longer act or choose not to. Once passed, you're done for the Action Phase.

### Command Token Economy
- **Tactics pool:** Spent to activate systems (tactical actions)
- **Fleet pool:** Determines max non-fighter ships in any one system
- **Strategy pool:** Spent to use secondary abilities of other players' strategy cards

Running out of tactics tokens = can't do tactical actions. This is the core constraint that shapes the whole game.

### Space Combat Sequence
1. Anti-Fighter Barrage (destroyers, some units)
2. Announce Retreat (optional, must retreat after round if announced)
3. Roll dice simultaneously — each unit rolls once, hits on combat value or higher
4. Assign hits — attacker assigns to defender's ships, defender to attacker's. Owner chooses which ships die.
5. Repeat until one side destroyed or retreats

**Key combat values (base game):**
| Unit | Combat | Capacity | Cost | Notes |
|------|--------|----------|------|-------|
| Fighter | 9 | — | 0.5 | Carried in fleet capacity |
| Destroyer | 9 | — | 1 | Anti-fighter barrage 2 (rolls 2 dice at 9) |
| Cruiser | 7 | — | 2 | |
| Carrier | 9 | 4 | 3 | Carries fighters/infantry |
| Dreadnought | 5 | 1 | 4 | Sustain damage, bombardment |
| Flagship | varies | varies | 8 | Faction-specific |
| War Sun | 3 | 6 | 12 | Sustain, bombardment 3, ignores Planetary Shield |

**Sustain Damage:** Unit takes a hit instead of being destroyed — place damage token. Sustained unit can still fight but dies on next hit.

### Ground Combat
After space combat (if attacker wins or no space combat):
- Land infantry from carriers onto contested planets
- Roll combat — infantry hit on 8, PDS can't participate in ground combat
- Last side standing controls the planet

### Production
In activated system with your space dock:
- Produce up to (2 + total resources of planets you control in that system) units
- Pay resources from exhausted planets
- Units go into system (ships to space, ground units to planets or carriers)
- Cannot exceed fleet supply with new ships

---

## Status Phase (end of each round)

Resolve in this exact order:

1. **Score Objectives** — each player may score up to 1 public and 1 secret objective this phase if conditions met
2. **Reveal Public Objective** — flip next public objective card face up (players now know what to work toward)
3. **Draw Action Cards** — each player draws 1 action card
4. **Remove Command Tokens** — remove all tactics CCs from the board (activations reset)
5. **Gain and Redistribute CCs** — each player gains 2 command tokens, then redistributes ALL their tokens between the three pools however they want
6. **Ready Cards** — ready all exhausted planets and technology cards
7. **Repair Units** — remove all damage tokens
8. **Return Strategy Cards** — all strategy cards return to the pool

### Public Objectives (Stage I — 1 VP each)
Revealed one per Status Phase. Common examples:
- Control 6 planets in non-home systems
- Own 3 technologies of the same color
- Control Mecatol Rex
- Spend 8 resources during the Status Phase (exhaust planets to "spend" resources)
- Have 3 ships with Sustain in 1 system

### Mecatol Rex VP
Separately: if you control Mecatol Rex at the start of the Status Phase, score 1 VP (from Imperial strategy card secondary, not an objective — but commonly conflated).

---

## Agenda Phase

1. Reveal top 2 cards from Agenda deck
2. Resolve first agenda:
   - Players vote using influence from EXHAUSTED planets (planets must be exhausted to vote)
   - Spend influence = that many votes
   - Vote for or against (or abstain)
   - Resolve outcome (For wins if For votes > Against, ties go against)
3. Resolve second agenda same way

### Agenda Types
- **Laws:** Permanent effects that stay in play for the rest of the game
- **Directives:** One-time effects, discarded after resolution

### Political Strategy
Voting costs influence — the same resource used to claim Mecatol Rex and unlock certain strategy card secondaries. Timing matters: don't exhaust planets for agenda votes if you need influence for something in the next action phase.

---

## Federation of Sol — Key Faction Rules

**Starting Units (home system — Jord):**
- 2 Carriers, 1 Destroyer, 3 Fighters, 3 Infantry, 1 PDS, 1 Space Dock
- Note: Jord has 2 planets (Jord 4/2 and Moll Primus 2/3) — both start controlled

**Starting Technologies:**
- Neural Motivator (draw extra action card each Status Phase)
- Antimass Deflectors (ships move through asteroid fields; movement +1 for carriers)

**Faction Abilities:**
- *Orbital Drop:* Once per tactical action, spend 1 TG to place 2 infantry from reserve onto any planet in activated system (powerful for rapid planet capture)
- *Zeal:* Always go first in initiative order ties (rarely relevant but good to know)

**Commodities:** 3 (can be traded for trade goods or other things)

**Sol Strategy Notes for Coaching:**
- Infantry factory — produce infantry constantly, use Orbital Drop aggressively
- Carriers are your workhorses, protect them
- Neural Motivator makes action cards a real resource — use them
- Weakness: technology is slow without focus; don't try to tech-rush
- Strength: flexible political position, not threatening enough to be targeted early

---

## Trade Basics

- Players must be neighbors (adjacent systems or connected via wormhole) to transact
- Can exchange: commodities → trade goods (1:1), trade goods, promissory notes
- Commodities are faction-specific, trade goods are universal currency
- Hacan (Merchant-Lord Azan) breaks this rule — can trade with anyone, any time
- Deals are NOT binding — betrayal is legal and sometimes correct

---

## Technology Tree (Sol-relevant paths)

**Blue (Propulsion):**
Antimass Deflectors → Sling Relay → Light/Wave Deflector → Gravity Drive

**Green (Biotic):**
Neural Motivator → Sarween Tools → Spec Ops II → Hyper Metabolism

**Red (Warfare):**
Duranium Armor → Assault Cannon → Magen Defense Grid → Vortex

**Yellow (Cybernetic):**
Scanlink Drone Network → Predictive Intelligence → AI Development Algorithm → Quantum Datahub Node

**Sol Faction Techs:**
- Spec Ops II (green): Infantry II — infantry combat value 7, roll 2 dice
- Chaos Mapping (blue): Adjacent players can't activate your home system

**Priority for Sol beginners:** Green tech tree (Spec Ops II makes your infantry devastating), then Blue for mobility.
