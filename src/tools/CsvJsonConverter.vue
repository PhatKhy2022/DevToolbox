<script setup lang="ts">
import { ref, watch } from 'vue'
import EditorSplitView from '@/components/EditorSplitView.vue'
import FileDropzone from '@/components/FileDropzone.vue'
import ToolEditor from '@/components/ToolEditor.vue'
import { useWorkspaceStore } from '@/stores/workspace'
import { readFileAsText } from '@/utils/browser'
import { csvToJson, jsonToCsv, xlsxToJson } from '@/utils/csv'

const workspace = useWorkspaceStore()
const input = ref(workspace.activeTab?.input ?? '')
const output = ref('')
const message = ref('CSV, XLSX, or JSON input')

watch(input, (value) => workspace.updateActiveInput(value))
watch(
  () => workspace.activeTab?.input,
  (value) => {
    if (value !== undefined && value !== input.value) input.value = value
  },
)

async function handleFiles(files: FileList) {
  const file = files[0]
  if (!file) return
  if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
    output.value = await xlsxToJson(file)
    message.value = `Converted ${file.name} to JSON`
  } else {
    input.value = await readFileAsText(file)
    message.value = `Loaded ${file.name}`
  }
}

function toJson() {
  try {
    output.value = csvToJson(input.value)
    message.value = 'CSV converted to JSON'
    workspace.addHistory('csv-json', 'CSV to JSON', input.value)
  } catch (error) {
    message.value = error instanceof Error ? error.message : 'Conversion failed'
  }
}

function toCsv() {
  try {
    output.value = jsonToCsv(input.value)
    message.value = 'JSON converted to CSV'
    workspace.addHistory('csv-json', 'JSON to CSV', input.value)
  } catch (error) {
    message.value = error instanceof Error ? error.message : 'Conversion failed'
  }
}
</script>

<template>
  <div class="flex min-h-0 flex-1 flex-col gap-3">
    <div class="grid gap-3 lg:grid-cols-[1fr_auto]">
      <FileDropzone accept=".csv,.xlsx,.xls" @files="handleFiles" />
      <div class="flex flex-wrap content-start gap-2">
        <button class="primary-button" @click="toJson">CSV to JSON</button>
        <button class="secondary-button" @click="toCsv">JSON to CSV</button>
        <span class="w-full text-sm text-slate-500 dark:text-slate-400">{{ message }}</span>
      </div>
    </div>
    <EditorSplitView>
      <template #first>
        <ToolEditor v-model="input" title="Input" language="csv/json" placeholder="Paste CSV or JSON" filename="input.csv" @save="workspace.saveSnippet('CSV/JSON input', 'csv-json', $event)" />
      </template>
      <template #second>
        <ToolEditor v-model="output" title="Output" language="json/csv" readonly filename="converted.txt" @save="workspace.saveSnippet('CSV/JSON output', 'csv-json', $event)" />
      </template>
    </EditorSplitView>
  </div>
</template>
