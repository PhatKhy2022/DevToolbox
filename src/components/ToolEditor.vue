<script setup lang="ts">
import { Copy, Download, Save } from '@lucide/vue'
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { copyToClipboard, downloadText } from '@/utils/browser'
import { usePreferencesStore } from '@/stores/preferences'

// Monaco imports
import * as monaco from 'monaco-editor'

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
let editor: monaco.editor.IStandaloneCodeEditor | null = null

function getMonacoLanguage(lang?: string) {
  const map: Record<string, string> = {
    js: 'javascript',
    yml: 'yaml',
  }
  const l = lang?.toLowerCase() || 'text'
  return map[l] || l
}

function updateTheme() {
  if (editor) {
    monaco.editor.setTheme(preferences.darkMode ? 'vs-dark' : 'vs')
  }
}

onMounted(() => {
  if (!editorRef.value) return

  editor = monaco.editor.create(editorRef.value, {
    value: props.modelValue,
    language: getMonacoLanguage(props.language),
    theme: preferences.darkMode ? 'vs-dark' : 'vs',
    readOnly: props.readonly,
    automaticLayout: true,
    minimap: { enabled: false },
    fontSize: 14,
    fontFamily: 'JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    scrollBeyondLastLine: false,
    lineNumbers: 'on',
    roundedSelection: true,
    scrollbar: {
      vertical: 'visible',
      horizontal: 'visible',
    },
    padding: { top: 12, bottom: 12 }
  })

  editor.onDidChangeModelContent(() => {
    const value = editor?.getValue() || ''
    if (value !== props.modelValue) {
      emit('update:modelValue', value)
    }
  })
})

onUnmounted(() => {
  editor?.dispose()
})

// Sync modelValue -> Editor
watch(() => props.modelValue, (newValue) => {
  if (editor && newValue !== editor.getValue()) {
    editor.setValue(newValue)
  }
})

// Sync language -> Editor
watch(() => props.language, (newLang) => {
  if (editor) {
    const model = editor.getModel()
    if (model) {
      monaco.editor.setModelLanguage(model, getMonacoLanguage(newLang))
    }
  }
})

// Sync readonly -> Editor
watch(() => props.readonly, (newReadonly) => {
  editor?.updateOptions({ readOnly: newReadonly })
})

// Sync dark mode -> Editor
watch(() => preferences.darkMode, () => {
  updateTheme()
})

async function copy() {
  await copyToClipboard(props.modelValue)
  copied.value = true
  window.setTimeout(() => (copied.value = false), 1200)
}
</script>

<template>
  <section class="panel flex min-h-48 flex-1 flex-col rounded-md overflow-hidden">
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
/* Monaco Overrides */
.monaco-editor {
  padding: 0;
}
.vs-dark .monaco-editor, 
.vs-dark .monaco-editor .margin,
.vs-dark .monaco-editor-background {
  background-color: #020617 !important; /* slate-950 */
}
</style>
