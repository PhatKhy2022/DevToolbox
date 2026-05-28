<script setup lang="ts">
import { Copy, Download, Save } from '@lucide/vue'
import { ref } from 'vue'
import { copyToClipboard, downloadText } from '@/utils/browser'

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

const copied = ref(false)

async function copy() {
  await copyToClipboard(props.modelValue)
  copied.value = true
  window.setTimeout(() => (copied.value = false), 1200)
}
</script>

<template>
  <section class="panel flex min-h-72 flex-1 flex-col rounded-md">
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

    <textarea
      class="scrollbar min-h-64 flex-1 resize-none rounded-b-md bg-white p-3 font-mono text-sm leading-6 text-slate-900 outline-none placeholder:text-slate-400 dark:bg-slate-950 dark:text-slate-100"
      :placeholder="placeholder"
      :readonly="readonly"
      :value="modelValue"
      spellcheck="false"
      @input="emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
    />
  </section>
</template>
