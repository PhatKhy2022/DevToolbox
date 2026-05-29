<script setup lang="ts">
import { Copy, Download, Save } from '@lucide/vue'
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { copyToClipboard, downloadText } from '@/utils/browser'
import { usePreferencesStore } from '@/stores/preferences'

// CodeMirror imports
import { EditorView, basicSetup } from 'codemirror'
import { EditorState, Compartment } from '@codemirror/state'
import { javascript } from '@codemirror/lang-javascript'
import { json } from '@codemirror/lang-json'
import { yaml } from '@codemirror/lang-yaml'
import { oneDark } from '@codemirror/theme-one-dark'
import { keymap } from '@codemirror/view'
import { indentWithTab } from '@codemirror/commands'

const props = withDefaults(
  defineProps<{
    title: string
    modelValue: string
    placeholder?: string
    readonly?: boolean
    language?: string
    filename?: string
  }>(),
  {
    placeholder: '',
    readonly: false,
    language: 'text',
    filename: 'output.txt',
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
  save: [value: string]
}>()

const preferences = usePreferencesStore()
const editorRef = ref<HTMLElement | null>(null)
const copied = ref(false)
let view: EditorView | null = null

// Compartments for dynamic configuration
const languageConf = new Compartment()
const themeConf = new Compartment()
const readonlyConf = new Compartment()

function getLanguageExtension(lang?: string) {
  switch (lang?.toLowerCase()) {
    case 'javascript':
    case 'js':
      return javascript()
    case 'json':
      return json()
    case 'yaml':
    case 'yml':
      return yaml()
    default:
      return []
  }
}

function getTheme() {
  return preferences.darkMode ? oneDark : []
}

onMounted(() => {
  if (!editorRef.value) return

  const startState = EditorState.create({
    doc: props.modelValue,
    extensions: [
      basicSetup,
      keymap.of([indentWithTab]),
      languageConf.of(getLanguageExtension(props.language)),
      themeConf.of(getTheme()),
      readonlyConf.of(EditorState.readOnly.of(props.readonly)),
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          emit('update:modelValue', update.state.doc.toString())
        }
      }),
      EditorView.theme({
        '&': { height: '100%', fontSize: '14px' },
        '.cm-scroller': { fontFamily: 'JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' },
        '&.cm-focused': { outline: 'none' }
      })
    ],
  })

  view = new EditorView({
    state: startState,
    parent: editorRef.value,
  })
})

onUnmounted(() => {
  view?.destroy()
})

// Sync modelValue -> Editor
watch(() => props.modelValue, (newValue) => {
  if (view && newValue !== view.state.doc.toString()) {
    view.dispatch({
      changes: { from: 0, to: view.state.doc.length, insert: newValue }
    })
  }
})

// Sync language -> Editor
watch(() => props.language, (newLang) => {
  view?.dispatch({
    effects: languageConf.reconfigure(getLanguageExtension(newLang))
  })
})

// Sync readonly -> Editor
watch(() => props.readonly, (newReadonly) => {
  view?.dispatch({
    effects: readonlyConf.reconfigure(EditorState.readOnly.of(newReadonly))
  })
})

// Sync dark mode -> Editor
watch(() => preferences.darkMode, () => {
  view?.dispatch({
    effects: themeConf.reconfigure(getTheme())
  })
})

async function copy() {
  await copyToClipboard(props.modelValue)
  copied.value = true
  window.setTimeout(() => (copied.value = false), 1200)
}
</script>

<template>
  <section class="panel flex min-h-80 flex-1 flex-col rounded-md overflow-hidden">
    <div class="flex h-10 shrink-0 items-center gap-2 border-b border-slate-200 px-3 dark:border-slate-800">
      <div class="min-w-0 flex-1 truncate text-sm font-medium">{{ title }}</div>
      <span class="hidden rounded bg-slate-100 px-2 py-0.5 text-[11px] uppercase tracking-wide text-slate-500 dark:bg-slate-900 dark:text-slate-400 sm:inline">
        {{ language }}
      </span>
      <button class="icon-button size-8" title="Copy" :disabled="!modelValue" @click="copy">
        <Copy class="size-4" />
      </button>
      <button class="icon-button size-8" title="Download" :disabled="!modelValue" @click="downloadText(filename, modelValue)">
        <Download class="size-4" />
      </button>
      <button class="icon-button size-8" title="Save snippet" :disabled="!modelValue" @click="emit('save', modelValue)">
        <Save class="size-4" />
      </button>
      <span v-if="copied" class="text-xs text-cyan-600 dark:text-cyan-300">Copied</span>
    </div>

    <div ref="editorRef" class="min-h-0 flex-1 overflow-hidden" />
  </section>
</template>

<style>
/* CodeMirror Dark Mode Tweaks */
.dark .cm-editor {
  background-color: #020617 !important; /* slate-950 */
}
.dark .cm-gutters {
  background-color: #020617 !important;
  border-right: 1px solid #1e293b !important; /* slate-800 */
  color: #64748b !important; /* slate-500 */
}

/* CodeMirror Light Mode Tweaks */
.cm-editor {
  background-color: #ffffff;
}
.cm-gutters {
  background-color: #f8fafc !important; /* slate-50 */
  border-right: 1px solid #e2e8f0 !important; /* slate-200 */
  color: #94a3b8 !important; /* slate-400 */
}
</style>
