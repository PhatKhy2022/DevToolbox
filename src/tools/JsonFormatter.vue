<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import EditorSplitView from '@/components/EditorSplitView.vue'
import ToolEditor from '@/components/ToolEditor.vue'
import { useWorkspaceStore } from '@/stores/workspace'
import { downloadText } from '@/utils/browser'
import { formatJson, minifyJson, parseJson } from '@/utils/json'

const workspace = useWorkspaceStore()
const input = ref(workspace.activeTab?.input ?? '{"hello":"world"}')
const output = ref('')
const status = ref('Ready')

watch(input, (value) => workspace.updateActiveInput(value))
watch(
  () => workspace.activeTab?.input,
  (value) => {
    if (value !== undefined && value !== input.value) input.value = value
  },
)

const valid = computed(() => parseJson(input.value).ok)

function pretty() {
  const result = formatJson(input.value)
  if (result.ok) {
    output.value = result.data ?? ''
    status.value = 'Valid JSON'
    workspace.addHistory('json', 'Formatted JSON', input.value)
  } else {
    status.value = result.error ?? 'Invalid JSON'
  }
}

function minify() {
  const result = minifyJson(input.value)
  if (result.ok) {
    output.value = result.data ?? ''
    status.value = 'Minified JSON'
    workspace.addHistory('json', 'Minified JSON', input.value)
  } else {
    status.value = result.error ?? 'Invalid JSON'
  }
}
</script>

<template>
  <div class="flex min-h-0 flex-1 flex-col gap-3">
    <div class="flex flex-wrap items-center gap-2">
      <button class="primary-button" @click="pretty">Pretty print</button>
      <button class="secondary-button" @click="minify">Minify</button>
      <button class="secondary-button" :disabled="!output" @click="downloadText('formatted.json', output, 'application/json')">Download JSON</button>
      <span class="text-sm" :class="valid ? 'text-emerald-600 dark:text-emerald-300' : 'text-rose-600 dark:text-rose-300'">{{ status }}</span>
    </div>
    <EditorSplitView>
      <template #first>
        <ToolEditor v-model="input" title="Input" language="json" placeholder="Paste JSON here" filename="input.json" @save="workspace.saveSnippet('JSON input', 'json', $event)" />
      </template>
      <template #second>
        <ToolEditor v-model="output" title="Output" language="json" readonly filename="formatted.json" @save="workspace.saveSnippet('JSON output', 'json', $event)" />
      </template>
    </EditorSplitView>
  </div>
</template>
