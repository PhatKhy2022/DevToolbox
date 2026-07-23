# DevToolbox

Modern frontend-only developer utility toolbox built with Vue 3, TypeScript, Vite, Tailwind CSS, and Pinia.

## Features

- JSON formatter, minifier, validator, copy, and download
- CSV/XLSX to JSON and JSON to CSV conversion
- YAML to JSON and JSON to YAML conversion
- JWT payload decoder with expiry display
- UUID v4 generator with batch generation
- Base64 text and file encode/decode
- Unix timestamp and date conversion with timezone selection
- English vocabulary flashcards with local login, sets, editing, and study mode (Quizlet-style)
- Drag and drop uploads, content auto-detection, history, saved snippets, dark mode, and keyboard shortcuts

## Setup

```bash
npm install
npm run dev
```

## Production

```bash
npm run build
npm run preview
```

## Project Structure

```text
src/
  components/       Reusable layout, editor, toolbar, and upload components
  stores/           Pinia stores persisted to localStorage
  tools/            Feature modules
  types/            Shared TypeScript types
  utils/            File, parser, storage, clipboard, and download helpers
```
----------------

All data stays in the browser through localStorage. Vocabulary accounts and decks are stored per browser (not synced to a server).
