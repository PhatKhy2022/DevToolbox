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

## Pull Requests

Include a short summary, screenshots for UI changes, and notes about manual testing.
