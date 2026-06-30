# Twilight Imperium 4th Edition — Verified Rules Reference (Base Game, 4-Player)

This is the canonical rules source for this app. It supersedes `GAME_RULES.md` and any rules knowledge baked into the LLM's training. Scope: **base game only**, 4-player games.

Sourced primarily from `ti4rules.github.io`'s full Living Rules Reference text (a community-maintained, FFG-tracking reproduction of the official rules), with direct rule-number citations. Where a fact could not be independently cross-verified, it is flagged **⚠ UNCERTAIN**. Two independent research passes were run; where they disagreed, the pass with verbatim rule-text citations was treated as authoritative.

---

## 1. Round Structure

Four phases per round, in order: **Strategy → Action → Status → Agenda**.

> Rule 40.1: "Players skip the agenda phase during the early portion of each game. After the custodians token is removed from Mecatol Rex, the agenda phase is added to each game round."

**The Agenda Phase does not happen automatically every round.** It is unlocked permanently, starting the round it's unlocked, once a player removes the Custodians Token from Mecatol Rex (see §6). Until then, every round is just Strategy → Action → Status.

### Win Condition — corrects a common misconception
There is **no official "round 6" or any fixed-round cutoff** in base TI4. The two real end conditions:

1. **First to 10 VP wins, immediately**, the instant the threshold is crossed (rule 98). Ties broken by initiative order (or proximity to speaker, clockwise, if no strategy cards are held).
2. **Public objective deck exhaustion**: if the Status Phase requires revealing a new public objective but none remain, the game ends immediately and **whoever has the most VP wins** (rule 61.15 / 98.8). With 5 Stage I + 5 Stage II objectives (10 total), 2 revealed at setup and 1 more per Status Phase, the deck typically runs out around **round 8–9**, not round 6. Treat any "round 6" rule as a house-rule simplification, not official.

---

## 2. Strategy Phase

### Draft procedure — 4-player specific
Starting with the **Speaker**, proceeding clockwise, each player picks one strategy card from the 8 available. **In a 3- or 4-player game, this repeats for a second round of picks — each player ends up holding exactly 2 strategy cards.**

> Rule 84: "When playing with three or four players, each player will choose a second strategy card... After the last player has received their first strategy card, each player chooses a second strategy card, starting with the speaker and proceeding clockwise."

**Since 4 players × 2 cards = 8, all 8 cards are always claimed in a 4-player game — there are no leftover cards and no trade-goods-on-unpicked-cards mechanic** (that only applies in 5–7 player games).

### Initiative with multiple cards
> Rule 48.3: "When playing with three or four players, a player's initiative is determined only by their lowest-numbered strategy card."

### Strategic Action (using a card during the Action Phase)
- Active player resolves their card's **primary** ability.
- Each other player, starting to the active player's left going clockwise, may resolve that card's **secondary** ability — generically by spending **1 command token from their strategy pool** (Leadership is the sole exception: its secondary costs only influence, no token).
- **In 3-/4-player games, a player cannot pass during the Action Phase until they have used the strategic action on BOTH of their strategy cards.**

### The 8 Strategy Cards — verified text

| # | Card | Primary | Secondary |
|---|------|---------|-----------|
| 1 | **Leadership** | Gain 3 command tokens. Then may spend any amount of influence to gain 1 more command token per 3 influence spent. | Each other player may spend any amount of influence to gain 1 command token per 3 influence spent. **No command token cost — influence only.** |
| 2 | **Diplomacy** | Choose a system (not Mecatol Rex) containing a planet you control. Each other player places 1 command token from reinforcements into that system. Then ready up to 2 of your exhausted planets. | Each other player may spend 1 strategy token to ready up to 2 of their exhausted planets. |
| 3 | **Politics** | Choose any player (may be yourself, if you don't already have it) to become the new Speaker. Draw 2 action cards. Secretly look at the top 2 cards of the agenda deck, then place each back on top or bottom of the deck in any order. | Each other player may spend 1 strategy token to draw 2 action cards. |
| 4 | **Construction** | Place 1 PDS or 1 space dock on a planet you control. Then may place 1 additional PDS on a planet you control (same or different planet). No system activation required. | Each other player may spend 1 strategy token, place it in any system, and place either 1 PDS or 1 space dock on a planet they control there. |
| 5 | **Trade** | Gain 3 trade goods. Replenish your commodities to max. Then choose any number of other players to also replenish commodities for free (without spending a token). | Each other player not chosen may spend 1 strategy token to replenish their commodities. |
| 6 | **Warfare** | Remove 1 of your command tokens from the game board, returning it to a pool of your choice. Then may freely redistribute command tokens among your 3 pools. | Each other player may spend 1 strategy token to use the Production ability of a space dock in their home system (without activating it). |
| 7 | **Technology** | Research 1 technology. Then may research 1 additional technology by paying 6 resources. | Each other player may spend 1 strategy token **plus 4 resources** to research 1 technology. |
| 8 | **Imperial** | Score 1 public objective you qualify for (if not already scored by you). Then: if you control Mecatol Rex, gain 1 VP; if not, draw 1 secret objective. | Each other player may spend 1 strategy token to draw 1 secret objective. |

**Secondary cost pattern:** 1 strategy-pool command token, EXCEPT Leadership (influence only, no token) and Technology (token + 4 resources).

---

## 3. Action Phase

Players act in **initiative order** (ascending, by lowest strategy card held), looping until everyone has passed. A player cannot pass until they've used the strategic action on all their strategy cards (2, in a 4-player game).

### Action types (pick exactly one per turn)

**A. Strategic Action** — use a strategy card (see §2).

**B. Tactical Action** — in order:
1. **Activate** a system without one of your command tokens already in it (place 1 tactic-pool token there).
2. **Move** ships in with sufficient move value from non-token-marked systems. After movement, Space Cannon abilities may fire.
3. **Space Combat** — mandatory if two players both have ships present.
4. **Invasion** — bombard, commit ground forces, resolve ground combat (see §4).
5. **Production** — resolve Production abilities of eligible units in the system, even if you didn't move or invade this turn.

**C. Component Action** — use an explicit "Action:" ability on a card/faction sheet/tech. No system activation needed unless the ability says so.

**D. Pass** — only after exhausting all your strategy cards' primaries this round.

### Command Token Economy
8 tokens at game start: **3 tactic / 3 fleet / 2 strategy**. Player chooses which pool any newly-gained token enters.

- **Tactic pool**: spent 1-per-activation for tactical actions.
- **Fleet pool**: NOT spent — token *count* is a passive cap on non-fighter ships in one system. Fighters and ground forces do NOT count against this; only conventional ships (cruisers, destroyers, carriers, dreadnoughts, war suns, flagships) do.
- **Strategy pool**: spent to use other players' strategy card secondaries.

### Production
- Pay resources (exhaust controlled planets) equal to a unit's cost.
- Dual-icon units (Fighters, Infantry) — paying the listed cost produces 2 units, unless you choose to produce just 1 (still paying full cost).
- A unit's "Production N" ability value (fixed per unit, not a formula) caps units produced via that ability in one use; multiple producing units in the same system combine their values.
- Max 1 space dock and 2 PDS per planet.

---

## 4. Combat

### Space Combat (when 2 players both have ships in the active system)
1. **Anti-Fighter Barrage** — round 1 only. Targets enemy fighters specifically; cannot be canceled by Sustain Damage.
2. **Announce Retreats** — defender announces first; if they retreat, attacker cannot announce a retreat that round.
3. **Roll Dice** — attacker rolls first, then defender. 1 die per ship; roll ≥ unit's combat value = hit.
4. **Assign Hits** — Sustain Damage may cancel 1 hit per unit (marks it damaged, not destroyed) before hits are finalized; remaining hits force the owning player to choose and destroy that many of their own ships.
5. **Retreat** — units that announced retreat in step 2 leave now, if an eligible adjacent system exists.
6. Repeat from step 3 if both sides still have ships (Anti-Fighter Barrage does not repeat).

### Sustain Damage
Cancels 1 hit, marks the unit damaged (not destroyed). A damaged unit cannot use Sustain Damage again until repaired (Status Phase, step 7).

### Ground Combat
1. Roll 1 die per ground force on the planet; ≥ combat value = hit.
2. Each side destroys one of their own ground forces per hit taken.
3. Repeat until one side (or both) has none left. No retreat option, no Sustain Damage in ground combat.

### Invasion (within the Invasion step of a Tactical Action)
1. **Bombardment** — eligible units (e.g. Dreadnoughts, War Suns) roll vs. a target planet; hits force the defender to destroy that many ground forces. (Blocked by Planetary Shield ability on the planet.)
2. **Commit Ground Forces** — land any number from the system's space area onto planets there.
3. **Space Cannon Defense** — if the targeted planet has Space Cannon-capable units, they may fire on the committing forces.
4. **Ground Combat** — resolve per above, if both sides have forces on the planet.
5. **Establish Control** — gain control of any planet where you have ≥1 surviving ground force.

---

## 5. Status Phase — exact step order

1. **Score Objectives** — each player, in initiative order, may score up to 1 public AND 1 secret objective whose conditions they currently meet.
2. **Reveal Public Objective** — Speaker flips the next unrevealed public objective (all Stage I before any Stage II). If none remain, the game ends (see §1).
3. **Draw Action Cards** — each player draws 1.
4. **Remove Command Tokens** — each player returns ALL their on-board command tokens to reinforcements.
5. **Gain & Redistribute** — each player gains 2 new command tokens, then may freely redistribute their entire token pool across tactic/fleet/strategy.
6. **Ready Cards** — exhausted cards (including strategy cards) are readied.
7. **Repair Units** — all damaged units are repaired.
8. **Return Strategy Cards** — cards go back to the common area. If the Custodians Token has been removed, proceed to Agenda Phase; otherwise, start a new round at Strategy Phase.

---

## 6. Agenda Phase

### Trigger — verified exact mechanism
**Not** a VP or tech threshold. A single one-time action: during the "Commit Ground Forces" step of an invasion of Mecatol Rex, a player may pay **6 influence** and commit **at least 1 ground force** to remove the Custodians Token. This:
- Grants that player **1 VP immediately**.
- Permanently adds the Agenda Phase to every round from then on (including the current one).

### Voting
Each Agenda Phase resolves exactly 2 agenda cards in sequence:
1. Speaker reveals and reads the card, including all outcomes.
2. Voting starts with the player to the Speaker's left, clockwise; Speaker votes last. Each player exhausts any number of planets, casting votes equal to the combined influence of those planets, all for one outcome (or abstains). **Trade goods cannot be spent on votes.**
3. Outcome with the most votes resolves. Ties: Speaker chooses.
4. "For"/"Elect" outcomes that are **Laws** stay in play permanently; **Directives** and "Against" outcomes resolve once and are discarded.
5. After both agendas resolve, each player readies all exhausted planets, then a new round begins.

---

## 7. Objectives

- **Public**: 5 Stage I (1 VP) + 5 Stage II (2 VP) = 10 total. 2 Stage I revealed at setup; 1 more per Status Phase, Stage I exhausted before any Stage II. Each player can score a given public objective once (independently — other players scoring it doesn't block you).
- **Secret**: owned privately; only the owner can score their own secret objectives. Drawn via the Imperial strategy card (primary or secondary). **Max 3 held at once** (scored + unscored combined) — drawing a 4th forces returning an unscored one to the deck (reshuffled).
- **Scoring limits**: max 1 public + 1 secret per player per Status Phase. During Action/Agenda Phase, no fixed cap, except max 1 objective scored per combat instance (space and ground combat in the same tactical action each separately allow scoring).
- **Mecatol Rex**: no inherent passive bonus. The only fixed benefits are (a) +1 VP one-time for removing the Custodians Token, and (b) the Imperial strategy card's primary granting a VP-instead-of-secret-objective-draw whenever the active player controls Mecatol Rex (repeatable every time Imperial is used while in control).

---

## 8. Key Definitions

| Concept | Definition |
|---|---|
| **Resources** | From exhausting planets; pay unit production costs and similar. Trade goods spend 1-for-1 as resources. |
| **Influence** | From exhausting planets; pay Leadership conversions and agenda votes. Trade goods spend 1-for-1 as influence, but NOT for agenda votes. |
| **Trade Goods / Commodities** | Same physical token, two sides. Commodities sit on your own sheet and can only be spent by giving them to another player in a trade — at that moment they flip to trade goods for the receiver. You cannot spend your own commodities directly. |
| **Technology Colors** | Propulsion (blue), Biotic (green), Cybernetic (yellow), Warfare (red). Each non-unit-upgrade tech has colored prerequisite icons; you need 1 owned tech of that color per icon to research it. Unit upgrades have no color/prerequisites of their own. |
| **Technology Specialty Planets** | Exhausting a specialty planet matching a tech's prerequisite color waives one prerequisite icon when researching. |
| **Planet Traits** | Cultural / Hazardous / Industrial / none. No inherent mechanical effect on their own in the base game — referenced by specific cards/abilities only. |
| **Control** | Whoever holds the control token on a planet "controls" it and can exhaust its card for resources/influence. |

---

## Key Corrections vs. Prior Implementation

These were wrong in this app's original prompt/UI and have been fixed:

1. **4-player draft is 2 cards per player, not 1.** This was the single biggest gap — the original strategy card picker only let the player take one card.
2. **Agenda Phase is gated behind Custodians Token removal**, not automatic every round.
3. **No official "round 6" end condition** — it's 10 VP or objective deck exhaustion.
4. **Leadership's secondary costs influence only**, not a strategy command token like the other 7 cards.
5. Several strategy card primary/secondary descriptions were paraphrased incorrectly (especially Diplomacy and Politics).
6. **Secret objective cap is 3** (scored + unscored combined) — wasn't previously enforced or documented.
7. Fleet pool limit excludes fighters and ground forces — only conventional ships count.

---

**Sources:** `ti4rules.github.io` full Living Rules Reference (primary, verbatim rule-text citations), cross-checked against `tirules2.com` and `scottmk.github.io/ti4-reference` summary pages where reachable. Items not independently cross-verified beyond the primary source are noted inline as such where relevant; none of the corrections above were contested between sources.
