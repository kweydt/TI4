# UI Specification

Mobile-first. Single HTML file at `public/index.html`. Vanilla JS — no React, no build step. Designed for iPhone Safari, works on desktop too.

---

## Visual Design

**Palette:**
- Background: `#050810` (void black)
- Panels: `#0d1628` (deep navy)
- Borders: `#1e2240` (dim rim)
- Gold (player): `#d4a843`
- Blue (GM/UI chrome): `#4a9eff`
- Purple (coach): `#9b5de5`
- Orange (opponents): `#e8521a`
- Green (good verdict): `#4ecb71`
- Text: `#c4cedf`
- Dim text: `#4a5570`

**Typography:**
- `Cinzel` (Google Fonts) — phase names, section headers. Roman-imperial feel, not sci-fi.
- `IBM Plex Mono` — stats, labels, numbers, game data
- `Inter` — body text, narrative, choices

**Aesthetic:** Field commander's tablet. War room briefing. Not a video game HUD — a serious strategic instrument.

---

## Layout (Mobile, top to bottom)

```
┌─────────────────────────────────┐
│ STRATEGY │ ACTION │STATUS│AGENDA│  ← phase strip (fixed, 44px)
├─────────────────────────────────┤
│    [hex galaxy minimap]  RND 1  │  ← galaxy strip (fixed, 90px)
├─────────────────────────────────┤
│ ⬡ YOUR COMMAND SHEET        ▲  │  ← collapsible (tap to toggle)
│  VP:0  TG:0  TAC:3  FLEET:3   │
│  [Jord 4/2 ✓] [Moll Primus ✓] │
├─────────────────────────────────┤
│                                 │
│  [GM entry — blue]              │  ← scrollable log
│  [COACH entry — purple]         │
│  [OPPONENTS entry — orange]     │
│  [PLAYER entry — gold]          │
│  [choice buttons]               │
│                                 │
├─────────────────────────────────┤
│ Type your action or question… ⬡│  ← fixed input bar (80px)
└─────────────────────────────────┘
```

---

## Components

### Phase Strip
Fixed at top. 4 equal segments. Active phase: gold text, gold underline, subtle gold background. Done phases: dimmed green tint. Upcoming: dim text only.

```js
function setPhase(phase) {
  const phases = ['strategy', 'action', 'status', 'agenda'];
  document.querySelectorAll('.phase-tab').forEach((el, i) => {
    el.classList.toggle('active', phases[i] === phase);
    el.classList.toggle('done', phases.indexOf(phase) > i);
  });
}
```

### Galaxy Minimap
SVG, 7 hexagons arranged in standard ring pattern. Not interactive. Just visual context.
- Center hex: Mecatol Rex (purple border, glows when controlled)
- Player hex (bottom): gold border, "SOL" label
- 3 opponent hexes: dim steel border with faction abbreviation
- 2 neutral system hexes: very dim

Update hex colors/labels when planets are captured. Keep it abstract — this isn't a real map renderer, just orientation.

### Command Sheet
Collapsible panel. Tap header to toggle. Starts expanded.

**Stats row:** 4 cells in a grid — Victory Points (gold), Trade Goods, Tactics CC (blue), Fleet CC (blue)

**Planets row:** Flex-wrap tags. Each planet tag shows `Name (R/I)`. Green border + checkmark if ready, dim + X if exhausted.

**Units row (optional, collapsed by default):** Show unit counts. Only show when expanded.

Parse from state object on every response.

### Narrative Log
Scrollable. New entries appended at bottom. Auto-scroll on new content.

**Entry anatomy:**
```html
<div class="entry [type]">
  <div class="entry-head">
    <span class="icon">⬡</span>
    <span class="who">GAME MASTER</span>
  </div>
  <div class="entry-body">
    <!-- parsed HTML from Claude response -->
  </div>
</div>
```

**Entry types and colors:**

| Type | Who | Header color | Border |
|------|-----|-------------|--------|
| `gm` | Game Master | Blue `#4a9eff` | `#1e2240` |
| `coach` | Your Coach | Purple `#9b5de5` | purple tint |
| `opponent` | Opponents | Orange `#e8521a` | dim |
| `player` | Commander Kramer | Gold `#d4a843` | gold tint |
| `eval` | Decision Analysis | Green `#4ecb71` | green tint |

**Streaming:** While Claude is streaming, show a live entry with animated loading dots, then replace dots with text as chunks arrive. Don't append a new entry per chunk — update the existing streaming entry's body content.

```js
let streamingEntry = null;

function startStream() {
  streamingEntry = addEntry('gm', 'Game Master', '⬡', '');
  streamingEntry.querySelector('.entry-body').innerHTML = '<div class="dots">...</div>';
}

function appendChunk(text) {
  const body = streamingEntry.querySelector('.entry-body');
  body.innerHTML = formatMarkdown(accumulatedText);
  scrollToBottom();
}

function finalizeStream(fullText) {
  // parse [GM], [COACH], [OPPONENTS], [CHOICES] blocks
  // replace streaming entry and add additional typed entries
  parseAndRenderSections(fullText);
  streamingEntry = null;
}
```

### Choice Buttons
Rendered below the last GM entry when Claude's response contains `[CHOICES]` block.

```html
<div class="choices">
  <button class="choice-btn" onclick="selectChoice(this)">
    <span class="choice-label">Option 1</span>
    Take Leadership — gain 3 command tokens, act first this round
  </button>
  ...
</div>
```

Full width. Large tap target (min 52px height). Blue border, subtle blue background. Tap → populate input and send automatically.

### Verdict Badge
Rendered inline when response contains `[VERDICT:Good]` etc.

```html
<span class="verdict good">GOOD</span>     <!-- green -->
<span class="verdict risky">RISKY</span>   <!-- gold -->
<span class="verdict poor">POOR</span>     <!-- orange-red -->
```

### Input Bar
Fixed at bottom. Textarea (3 rows, expands to ~5). Send button right side. Enter sends (shift+enter = newline). Button label "ACT" with hex icon.

Disable send button while streaming. Re-enable on stream complete.

---

## Response Parsing

Claude's responses use section markers. Parse them client-side:

```js
function parseResponse(fullText) {
  const sections = {};

  const gmMatch = fullText.match(/\[GM\]([\s\S]*?)(?=\[COACH\]|\[OPPONENTS\]|\[CHOICES\]|<!--STATE|$)/);
  const coachMatch = fullText.match(/\[COACH\]([\s\S]*?)(?=\[GM\]|\[OPPONENTS\]|\[CHOICES\]|<!--STATE|$)/);
  const oppMatch = fullText.match(/\[OPPONENTS\]([\s\S]*?)(?=\[GM\]|\[COACH\]|\[CHOICES\]|<!--STATE|$)/);
  const choicesMatch = fullText.match(/\[CHOICES\]([\s\S]*?)(?=<!--STATE|$)/);

  if (gmMatch) sections.gm = gmMatch[1].trim();
  if (coachMatch) sections.coach = coachMatch[1].trim();
  if (oppMatch) sections.opponents = oppMatch[1].trim();
  if (choicesMatch) {
    sections.choices = choicesMatch[1].trim()
      .split('\n')
      .filter(l => /^\d+\./.test(l))
      .map(l => l.replace(/^\d+\.\s*/, '').trim());
  }

  return sections;
}

function renderSections(sections) {
  if (sections.gm) addEntry('gm', 'Game Master', '⬡', formatMarkdown(sections.gm));
  if (sections.coach) addEntry('coach', 'Your Coach', '◈', formatMarkdown(sections.coach));
  if (sections.opponents) addEntry('opponent', 'Opponents', '⬟', formatMarkdown(sections.opponents));
  if (sections.choices) appendChoices(sections.choices);
}
```

### Markdown Formatting
Minimal — just what Claude actually outputs:

```js
function formatMarkdown(text) {
  return text
    .replace(/\[VERDICT:(Good|Risky|Poor)\]/g, (_, v) => {
      const cls = {Good:'good', Risky:'risky', Poor:'poor'}[v];
      return `<span class="verdict ${cls}">${v.toUpperCase()}</span>`;
    })
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*\n]+)\*/g, '<em>$1</em>')
    .replace(/^### (.+)$/gm, '<h4>$1</h4>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>')
    .replace(/^/, '<p>').replace(/$/, '</p>');
}
```

---

## API Call (Client Side)

```js
async function send(message) {
  history.push({ role: 'user', content: message });

  const res = await fetch('/api/turn', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history })
  });

  // Streaming via ReadableStream
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let accumulated = '';

  startStream();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    accumulated += decoder.decode(value);
    updateStreamEntry(accumulated);
  }

  finalizeStream(accumulated);
  history.push({ role: 'assistant', content: accumulated });
  parseStateFromResponse(accumulated);
}
```

---

## State Sync

On every finalized response, extract and apply state:

```js
function parseStateFromResponse(text) {
  const match = text.match(/<!--STATE:([\s\S]*?)-->/);
  if (!match) return;
  try {
    const updates = JSON.parse(match[1]);
    applyStateToUI(updates);
  } catch(e) {
    console.warn('State parse failed:', e);
  }
}

function applyStateToUI(state) {
  if (state.round) document.getElementById('round-badge').textContent = `ROUND ${state.round}`;
  if (state.phase) setPhase(state.phase);
  if (state.player) {
    const p = state.player;
    if (p.vp !== undefined) el('stat-vp').textContent = p.vp;
    if (p.tradeGoods !== undefined) el('stat-tg').textContent = p.tradeGoods;
    if (p.commandTokens) {
      el('stat-tac').textContent = p.commandTokens.tactics;
      el('stat-fleet').textContent = p.commandTokens.fleet;
    }
    if (p.planets) renderPlanets(p.planets);
  }
}
```

---

## Performance Notes

- Keep conversation `history` array to last 20 exchanges max to avoid context bloat (summarize earlier turns into a single system note if needed)
- Streaming makes responses feel fast even if they take 8–10 seconds total
- Auto-scroll should use `scrollIntoView({ behavior: 'smooth' })` on the last entry
- On mobile: `user-scalable=no` in viewport meta prevents accidental zoom during gameplay
