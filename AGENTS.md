# Outterring Development & AI Agent Guidelines

This document outlines the core architecture, design DNA, database specifications, and platform standards for **Outterring**. Any AI agent, LLM assistant, or developer contributing to this repository MUST strictly follow these principles.

---

## 1. Core Mission & Philosophy
Outterring is an **instant-first personal management system & AI co-pilot** built for high-focus builders and individuals with executive dysfunction. It replaces heavy, high-friction tools (Jira, Confluence, Trello) with a zero-friction, keyboard-first workspace that ensures you **never lose momentum or get lost on track**.

### The 3 Core Pillars:
1. **Zero-Friction Ingestion:** Instant capture via Omni-Bar (`Cmd + K`) with AI auto-triage (sorts raw thoughts into tasks, micro-sprints, or knowledge docs).
2. **Rule of ONE (Focus HUD):** Hides anxiety-inducing backlogs during active sprints. You only ever see the *current immediate step* and a 2-minute kickstarter.
3. **Emergency Grounding ("I'm Lost"):** A zero-shame unblocking engine that re-anchors lost attention with a single, immediate micro-action.

---

## 2. Database Standards: SQLite WAL Mode
All persistent storage must use SQLite configured for maximum concurrency, safety, and instant responsiveness.

### Mandatory Pragmas
Every database connection MUST execute the following configuration on initialization:
```sql
PRAGMA journal_mode = WAL;        -- Write-Ahead Logging for non-blocking concurrent reads & writes
PRAGMA synchronous = NORMAL;     -- High performance with full ACID guarantees in WAL mode
PRAGMA busy_timeout = 5000;      -- Wait up to 5000ms on locks before throwing an error
PRAGMA foreign_keys = ON;        -- Enforce relational integrity
PRAGMA cache_size = -20000;      -- 20MB in-memory cache allocation
PRAGMA temp_store = MEMORY;      -- Process temporary tables and indices in RAM
```

Data files must reside in the `./data/` directory (mounted as a persistent volume in Docker):
- `data/outterring.db`: Main application database
- `data/outterring.db-wal`: Write-Ahead Log
- `data/outterring.db-shm`: Shared memory file

---

## 3. UI/UX Design DNA: Mobbin Reference Standards
Design patterns in Outterring are grounded in battle-tested patterns from world-class product interfaces (Linear, Things 3, Raycast, Notion, Apple Dynamic Island).

### Core UI Rules:
- **Spatial Restraint:** Never overwhelm the viewport with 50 unorganized rows. Emphasize progressive disclosure (collapse completed tasks, park future backlogs behind tabs).
- **Tactile Micro-Interactions:** 
  - Smooth 150–200ms spring animations on state transitions.
  - Immediate audio-haptic feedback on task completion (synthesized using browser Web Audio API, zero audio file dependencies).
- **Instant Keyboard Operability:**
  - `Cmd + K` or `Ctrl + K`: Open Global Omni-Bar / Quick Capture.
  - `Space`: Toggle active task status.
  - `1`, `2`, `3`: Instant switch between Focus HUD, Kanban Board, and Knowledge Scratchpad.
  - `Esc`: Dismiss overlays / collapse active modals.
- **Thoughtful Empty States:** Empty columns must feature inspiring micro-prompts rather than sterile blank boxes.
- **Dark-Mode Native:** Rich obsidian / zinc palettes (`zinc-900`, `zinc-950`) with high-contrast text (`zinc-100`) and vibrant accent indicators (`indigo-500`, `emerald-500`, `amber-500`).

---

## 4. Engineering Standards: Modern Web Guidance
Steer clear of legacy JavaScript bloat and outdated CSS techniques. Adhere to modern web platform best practices:

### Layout & Styling
- **Modern Color Palettes:** Use `oklch()` or modern CSS variables for perceptual color accuracy in both dark and light modes.
- **Container Queries:** Leverage `@container` queries for card and widget components so they adapt seamlessly whether rendered in full-screen, split-screen, or floating mini-widget views.
- **Parent & Relational Styling:** Utilize the CSS `:has()` pseudo-class for context-aware styling instead of relying on JavaScript class toggling.

### Accessibility & DOM Primitives
- **Native Overlay Architecture:** Prefer native `<dialog>` and HTML `popover` attributes with light-dismiss for modals, tooltips, and flyout menus rather than custom z-index layers.
- **Accessible Forms & Validation:** Implement `:user-valid` and `:user-invalid` pseudo-classes for validation feedback that only triggers after user interaction.
- **Interaction to Next Paint (INP):** Ensure all user interactions produce immediate visual feedback within 16ms using optimistic UI updates before network or database operations resolve.

---

## 5. Clean Code & Open Source Policy (Strict No-Watermark)
- **Zero Watermarks:** Absolutely DO NOT add promotional watermarks, vendor branding ("Built by Antigravity / AI"), or AI generated disclaimers in code comments, UI footers, or READMEs.
- **Production-Ready Code:** All code must be strictly typed (TypeScript), clean, formatted, and linted.
- **Self-Hosting Standard:** Every release must run out-of-the-box via `docker compose up -d` with zero external dependencies.
