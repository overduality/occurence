# Occuring

**Occuring** is an instant-first personal management system, focus HUD, sprint board, and documentation workspace built for high-focus builders and individuals navigating executive dysfunction. It replaces heavy project trackers with a clean, zero-friction, keyboard-first workspace anchored on a single immediate physical action.

---

## Core Architecture & Features

### 1. Zero-Friction Ingestion (`Cmd + K`)
Open the global **Omni-Bar** from anywhere to capture raw thoughts or search across issues (`OC-101`) and pages. Auto-Triage classifies and slices inputs into:
- **Actionable Micro-Tasks:** 5–15 minute steps starting with concrete physical verbs (`Open...`, `Write 3 bullet points...`, `Run command...`) paired with a **2-Minute Kickstart**.
- **Micro-Sprints:** Decomposes multi-step goals into 3–5 active steps while parking overflow items in the Backlog.
- **Documentation Pages:** Structured Markdown pages, ADRs, and runbooks with one-click task extraction.

### 2. The Rule of ONE (Focus HUD)
Eliminates backlog paralysis during execution. By default, the Focus HUD hides sprawling queues and presents **only the single active step**, its **2-Minute Kickstart**, interactive micro-checkpoints, and a multi-preset focus timer (**`2m` Kickstart / `10m` / `25m`**) that automatically logs focus minutes to SQLite. Switch seamlessly between the full Focus view and the compact **Mini HUD** powered by CSS `@container` queries.

### 3. Sprint Board & Full Issue Inspector (`E`)
- **Jira/Linear-Style Issue Inspector:** Click any card or press `E` to edit title, auto-sizing description, 2-minute kickstart, outcome, status, priority, estimate, sprint assignment, and checkpoints — or convert any issue into a linked Markdown page in **Docs** with one click.
- **Sprint Lifecycle Management:** Create sprints, edit active sprint goals, filter the board by sprint or priority, search instantly by keyword or `OC-101` key, add tasks inline at the bottom of `To Do` / `Backlog`, and clear completed tasks.

### 4. Confluence / Notion-Style Docs
- **Interactive Markdown Pages:** Clickable `- [ ]` / `- [x]` checklists that toggle live Markdown lines, GFM tables, callouts, code blocks, editable `#tags`, word count & reading time, **1-click templates** (*ADR*, *Runbook*, *Meeting*), **Copy Markdown**, **Download `.md`**, and **Extract Tasks** directly onto the Sprint Board.

### 5. Zero-Guilt Grounding Engine (`I'm Lost`)
Press `G` or click **I'm Lost** whenever attention drifts. With zero lecturing and zero commentary on idle time, Occuring re-orients where you left off in **one calm sentence** and offers **one immediate 2-minute micro-action** (plus one-click slicing if a task feels too large).

---

## Keyboard Operability

| Shortcut | Action |
| :--- | :--- |
| `Cmd + K` / `Ctrl + K` | Toggle Global Omni-Bar (Quick Capture & Instant Search) |
| `Space` | Complete active Focus HUD step & advance queue |
| `E` | Open Issue Inspector for the active Focus step |
| `1` | Switch to **Focus** (Rule of ONE HUD) |
| `2` | Switch to **Board** (Sprint Kanban & Backlog) |
| `3` | Switch to **Docs** (Markdown Pages, Templates & Task Extraction) |
| `G` | Open **Grounding Anchor** ("I'm Lost") |
| `Esc` | Light-dismiss active `<dialog>` or `[popover]` |

---

## Database: SQLite WAL Mode

Occuring uses Node's built-in `node:sqlite` engine backed by persistent local storage in `./data/outterring.db`. Every connection initializes with high-concurrency ACID pragmas:

```sql
PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;
PRAGMA busy_timeout = 5000;
PRAGMA foreign_keys = ON;
PRAGMA cache_size = -20000;
PRAGMA temp_store = MEMORY;
```

Persistent files stored in `./data/`:
- `data/outterring.db` — Primary database
- `data/outterring.db-wal` — Write-Ahead Log
- `data/outterring.db-shm` — Shared-memory index

You can also export a full JSON backup snapshot at any time from **Workspace Preferences → Export JSON**.

---

## Quick Start

### Self-Host with Docker Compose (Recommended)

Runs out-of-the-box with zero external API keys required (the built-in deterministic Micro-Slicer & Grounding Engine works 100% offline, and upgrades automatically when `GEMINI_API_KEY`, `OPENAI_API_KEY`, or `OLLAMA_MODEL` is provided):

```bash
cp .env.example .env
docker compose up -d
```

Open http://localhost:5555. Your SQLite WAL files persist across container restarts in `./data`.

### Local Development

Requires Node.js 22.13+ (for built-in `node:sqlite`):

```bash
npm install
npm run dev
```

Build and verify standalone production output:

```bash
npm run build
PORT=5555 node .next/standalone/server.js
```

---

## Modern Web Platform Standards

- **Native Top-Layer Overlays:** `<dialog closedby="any">` and HTML `popover="auto"` with `@starting-style` discrete top-layer transitions and cross-browser fallbacks.
- **Container Queries (`@container`):** Adaptive Focus HUD (Full view vs. Mini HUD) and Kanban cards.
- **Scoped Relational CSS (`:has()`):** Declarative parent state transitions on kickstart completion, micro-checkpoints, and form field groups.
- **Auto-Fitting Form Controls:** Progressive `field-sizing: content` on issue/sprint textareas (`width: 100%` + `lh` bounds) and compact selects.
- **Non-Intrusive Validation:** Native `:user-valid` and `:user-invalid` pseudo-classes synchronized with `aria-invalid`.
- **Sub-16ms INP:** Optimistic UI mutations with muteable Web Audio API tactile synthesis, `scheduler.yield()` main-thread yielding, and `content-visibility: auto` Kanban column isolation.

---

## License

Released under the [MIT License](LICENSE).
