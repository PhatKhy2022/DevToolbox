# Contributing

## Development

1. Install dependencies with `npm install`.
2. Start the local server with `npm run dev`.
3. Run `npm run build` before opening a pull request.

## Code Style

- Use Vue 3 Composition API and TypeScript.
- Keep tool-specific logic inside `src/tools`.
- Put reusable browser utilities in `src/utils`.
- Persist user data through the Pinia workspace store or the localStorage helpers.
- Avoid adding backend, database, or server-only dependencies.

## Shared Conventions

**Branches:** `<type>/<description>`, where `<description>` is kebab-case.
Types: `feature`, `bugfix`, `hotfix`, `chore`.
Example: `feature/uuid-batch-copy`

**Commits:** Angular convention — `<type>(<scope>): <subject>`.
Types: `feat`, `fix`, `chore`, `docs`, `style`, `refactor`, `test`, `perf`.

Suggested scopes match a tool id from `src/types/tool.ts`, or a cross-cutting area:
`dashboard`, `json`, `csv-json`, `yaml-json`, `jwt`, `uuid`, `base64`, `timestamp`, `js-playground`, `english-vocab`, `workspace`, `ui`, `deps`, `docs`

Subject line:
- imperative mood ("add", not "added"/"adds")
- no capitalized first letter
- no trailing period

Body (optional): explain *why* the change was made, not what changed — the diff already shows what.

Example:
```
feat(english-vocab): persist decks per logged-in user

Multiple users share one browser; without per-user keys, decks
from different accounts overwrote each other in localStorage.
```

## Shared Conventions

**Branches:** `<type>/<description>`, where `<description>` is kebab-case.
Types: `feature`, `bugfix`, `hotfix`, `chore`.
Example: `feature/uuid-batch-copy`

**Commits:** Angular convention — `<type>(<scope>): <subject>`.
Types: `feat`, `fix`, `chore`, `docs`, `style`, `refactor`, `test`, `perf`.

Suggested scopes match a tool id from `src/types/tool.ts`, or a cross-cutting area:
`dashboard`, `json`, `csv-json`, `yaml-json`, `jwt`, `uuid`, `base64`, `timestamp`, `js-playground`, `english-vocab`, `workspace`, `ui`, `deps`, `docs`

Subject line:
- imperative mood ("add", not "added"/"adds")
- no capitalized first letter
- no trailing period

Body (optional): explain *why* the change was made, not what changed — the diff already shows what.

Example:
```
feat(english-vocab): persist decks per logged-in user

Multiple users share one browser; without per-user keys, decks
from different accounts overwrote each other in localStorage.
```

## Pull Requests

Include a short summary, screenshots for UI changes, and notes about manual testing.
