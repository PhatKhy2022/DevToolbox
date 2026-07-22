# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

DevToolbox is a frontend-only developer utility toolbox (JSON formatter, CSV/YAML converters, JWT decoder, UUID generator, Base64 tool, timestamp converter, JS playground, and an English vocabulary flashcard app). Built with Vue 3 (Composition API + `<script setup>`), TypeScript, Vite, Tailwind CSS v4, and Pinia.

There is no backend and no database. Everything persists to the browser's `localStorage`. This is a hard constraint, not an oversight — do not introduce server calls, databases, or backend-only dependencies (see CONTRIBUTING.md).

## Commands

```bash
npm run dev        # start Vite dev server on 0.0.0.0
npm run build      # type-check (vue-tsc -b) then production build
npm run preview    # preview the production build on 0.0.0.0
npm run typecheck  # vue-tsc -b only, no build
```

There is no test suite, lint script, or formatter configured. `npm run build` (which runs `vue-tsc -b`) is the only correctness gate — always run it before considering a change done.

## Architecture

### Tool registration is centralized in `App.vue`

Every tool is declared once in the `tools` array in `src/App.vue` as a `ToolDefinition` (`src/types/tool.ts`): id, name, description, keyboard shortcut, and a `defineAsyncComponent` pointing at `src/tools/<Tool>.vue`. `App.vue` renders whichever tool is active via `<component :is="activeTool.component" />`. Adding a new tool means: add its `ToolId`, add the entry to this array, and create the matching file in `src/tools/`.

`Ctrl/Cmd+<shortcut digit>` switches tools; `Ctrl/Cmd+N` opens a new tab for the current tool. This is wired in `App.vue`'s `selectToolFromKey`.

### Workspace store drives tabs, history, and snippets (`src/stores/workspace.ts`)

Most tools are multi-tab (one `WorkspaceTab` per open instance, each with its own `input`); `dashboard` and `english-vocab` are listed in `TOOLS_WITHOUT_TABS` and bypass tabs entirely. The store also holds a global `history` (last 30 entries, capped and pruned in `addHistory`) and saved `snippets`, both shown in `HistoryPanel.vue`. Every mutating action ends by calling `this.persist()`, which serializes the whole state to `localStorage` under `devtoolbox:workspace`. When adding store state, follow this same "mutate then persist()" pattern rather than relying on a generic watcher.

### Pinia stores are hand-persisted, not plugin-persisted

There's no `pinia-plugin-persistedstate`. Every store follows the same manual pattern: read initial state via `loadJson(KEY, fallback)` from `src/utils/storage.ts` at module scope, then call `saveJson(KEY, ...)` inside actions (or a `watch(..., { deep: true })`, as in `preferences.ts`) after every change. `loadJson`/`saveJson` swallow errors and fall back silently — keep using them rather than touching `localStorage` directly.

### Vocabulary tool has its own local auth and per-user namespacing

`english-vocab` is the one tool with account-like behavior, but it is still fully client-side — there is no server:
- `stores/vocabAuth.ts` implements register/login against a `VocabAuthRegistry` stored under a single `devtoolbox:vocab-auth` key (`username -> { passwordHash, salt }`). Passwords are hashed with PBKDF2-SHA256 via WebCrypto (`src/utils/crypto.ts`), never stored in plaintext. The active session lives under `devtoolbox:vocab-session`.
- `stores/vocabulary.ts` stores each user's decks under a per-user key `devtoolbox:vocab-data:<username>` (see `dataKey()`). Call `syncForUser()` when the active user may have changed — it's a no-op if `loadedFor` already matches the current username, and it clears `decks` when logged out.
- Components live in `src/components/vocabulary/` (`VocabAuthForm`, `VocabDeckList`, `VocabDeckEditor`, `VocabStudyMode`).

This is browser-local "auth" for UX separation between users of the same browser, not a real security boundary — don't upgrade its threat model without the user asking for it.

### Utils follow a `ParseResult<T>` convention for fallible parsing

`src/utils/json.ts`, `csv.ts`, `yaml`-handling code, etc. return `{ ok, data?, error? }` instead of throwing, so tool components can branch on `.ok` and surface `.error` in the UI directly. Follow this convention for new parse/convert utilities rather than throwing exceptions.

`src/utils/detect.ts` implements paste-and-autodetect (JSON → JWT → Base64 → CSV → YAML → text, in that priority order) used to guess content type on paste.

### Shared editor: `ToolEditor.vue`

Nearly every tool embeds `src/components/ToolEditor.vue`, a Monaco-based editor wrapper handling copy/download/save-snippet buttons, language switching, and dark-mode theme sync. Monaco workers are registered once in `src/main.ts` (`self.MonacoEnvironment`) and Monaco language ids are aliased in `ToolEditor.vue`'s `getMonacoLanguage` (e.g. `js` -> `javascript`, `yml` -> `yaml`) — extend that map rather than passing raw Monaco ids into tool components.

### Styling conventions

Tailwind v4 is loaded via `@tailwindcss/vite` (no `tailwind.config.js`); dark mode uses a custom variant keyed off a `.dark` class on `<html>` (toggled by `preferences.hydrateDom()`), not `prefers-color-scheme`. Shared component classes (`.panel`, `.primary-button`, `.secondary-button`, `.icon-button`) are defined once in `src/styles.css` via `@apply` — reuse these instead of re-authoring button/panel styles per tool.

### Path alias

`@/*` maps to `src/*` (configured in both `vite.config.ts` and `tsconfig.app.json`) — use it for all intra-`src` imports.
