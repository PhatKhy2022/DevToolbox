# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install       # install dependencies
npm run dev        # start Vite dev server (0.0.0.0, hot reload)
npm run build       # vue-tsc -b (typecheck) then vite build
npm run preview      # preview production build (0.0.0.0)
npm run typecheck     # vue-tsc -b only, no build output
```

There is no test runner or lint script configured in `package.json` — do not assume `npm test` or `npm run lint` exist. Always run `npm run build` (or `npm run typecheck`) before considering a change complete, since `vue-tsc -b` is the only correctness check in this repo.

There is no single-test command since there is no test framework.

## Architecture

DevToolbox is a **frontend-only, no-backend** developer utility app (Vue 3 + TypeScript + Vite + Tailwind CSS v4 + Pinia). Every feature must work with zero server/database — all persistence is `localStorage` via `src/utils/storage.ts` (`loadJson`/`saveJson`). Do not introduce backend calls, databases, or server-only dependencies (see `CONTRIBUTING.md`).

### Tool registration (the core extension point)

Each utility ("tool") is a single Vue component under `src/tools/`. Tools are registered in one place, `src/App.vue`, as a `ToolDefinition[]` array (id, name, description, keyboard shortcut, async component). `src/types/tool.ts` defines the `ToolId` union — adding a new tool means:
1. Add the id to the `ToolId` union in `src/types/tool.ts`.
2. Create the component in `src/tools/`.
3. Register it (with a `defineAsyncComponent` import) in the `tools` array in `src/App.vue`.

`Ctrl/Cmd+<shortcut digit>` switches tools; `Ctrl/Cmd+N` opens a new tab for the current tool (see `selectToolFromKey` in `App.vue`).

### Workspace store (tabs/history/snippets)

`src/stores/workspace.ts` (Pinia) is the shared state for most tools: multi-tab editing (`tabs`/`activeTabId`), recent-value `history` (capped at 30 items), and saved `snippets`. Every mutation ends by calling `this.persist()`, which serializes the whole state to `localStorage` under `devtoolbox:workspace` — there is no reactive/automatic persistence, so any new state field must be added to `persist()` explicitly.

`TOOLS_WITHOUT_TABS` (`dashboard`, `english-vocab`) opt tools out of the tab system — these tools manage their own view state instead of `workspace.activeTab`.

Most tool components follow the same pattern: read initial value from `workspace.activeTab?.input`, `watch(input, ...)` to call `workspace.updateActiveInput`, and `watch(() => workspace.activeTabId, ...)` to reload input when the active tab changes.

### Preferences store

`src/stores/preferences.ts` holds `darkMode`/`sidebarCollapsed`/`historyVisible`, persisted to `devtoolbox:preferences`. `syncPreferencesStore()` (called once in `App.vue` `onMounted`) wires a `watch` that persists on change and toggles the `dark` class on `document.documentElement` — dark mode is plain Tailwind `dark:` variants, not a CSS-in-JS theme system.

### English Vocabulary sub-app

`english-vocab` is a self-contained mini-app nested inside the toolbox, with its own auth and data layer, all still localStorage-only:
- `src/stores/vocabAuth.ts`: local "accounts" keyed by username, password hashed with PBKDF2 (`src/utils/crypto.ts`), stored in `devtoolbox:vocab-auth`. This is *not* real security — it's just to separate per-browser-user data, not to protect against a determined attacker with local storage access.
- `src/stores/vocabulary.ts`: decks/cards persisted **per user** under `devtoolbox:vocab-data:<username>` (via `dataKey()`), loaded lazily by `syncForUser()` and guarded by `loadedFor` so data isn't reloaded redundantly.
- Components live under `src/components/vocabulary/` (auth form, deck list/editor, study mode) and are orchestrated by `src/tools/EnglishVocabulary.vue`.

### Editor component

`src/components/ToolEditor.vue` wraps Monaco Editor (not CodeMirror, despite an older commit title) and is the shared input/output panel used by nearly every tool: copy/download/save-snippet buttons, language-aware syntax highlighting (`getMonacoLanguage` maps a few aliases like `js`→`javascript`), and dark-mode-aware theme switching. Monaco web workers are pre-bundled via `optimizeDeps.include` in `vite.config.ts` — if you add a new Monaco language, its worker may need to be added there too.

### Split view and fullscreen

Two-panel tools (`json`, `csv-json`, `yaml-json`, `jwt`, `base64`, `js-playground`) wrap their pair of `ToolEditor` instances in `src/components/EditorSplitView.vue`, passed via the `#first`/`#second` slots. It renders a draggable divider (resizes 20%–80%, double-click resets to 50%, orientation flips from row to column below the `lg` breakpoint) and registers its container element with `src/stores/editorView.ts` (Pinia) on mount. That store just tracks `fullscreenTarget`/`isFullscreen`; the actual fullscreen toggle button lives in `App.vue`'s tool header and calls the Fullscreen API on the registered element. A tool only gets the fullscreen button if it uses `EditorSplitView` — single-panel tools (`dashboard`, `uuid`, `timestamp`, `english-vocab`) don't register a target, so `editorView.fullscreenTarget` stays null and the button doesn't render.

### JS Playground sandboxing

`src/tools/JsPlayground.vue` runs user code via `new Function('console', code)` with a stubbed-out `console` (log/error/warn/clear) that captures output into an array instead of executing in a real sandbox/iframe. There is no isolation from the page's JS context — treat this as a convenience tool, not a secure sandbox, when modifying it.

### Content auto-detection

`src/utils/detect.ts` (`detectContent`) sniffs pasted text as JSON/YAML/JWT/CSV/base64/text using cheap heuristics (tried in a specific order — JSON parse first, then JWT/base64/CSV/YAML regexes). Order matters because inputs can match multiple patterns loosely.

### Path alias

`@/*` resolves to `src/*` (configured in both `tsconfig.app.json` and `vite.config.ts`) — always import via `@/...`, not relative paths, matching the existing codebase convention.

### Styling

Tailwind CSS v4 via the `@tailwindcss/vite` plugin (no `tailwind.config.js` — v4 uses CSS-based config, see `src/styles.css`). Reusable classes like `primary-button`, `secondary-button`, `icon-button`, `panel` are defined there and used across tool components instead of repeating Tailwind utility strings.
