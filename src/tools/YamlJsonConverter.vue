<script setup lang="ts">
import { ref, watch } from 'vue'
import YAML from 'yaml'
import EditorSplitView from '@/components/EditorSplitView.vue'
import ToolEditor from '@/components/ToolEditor.vue'
import { useWorkspaceStore } from '@/stores/workspace'

const workspace = useWorkspaceStore()
const input = ref(workspace.activeTab?.input ?? '')
const output = ref('')
const message = ref('YAML and JSON converter')

watch(input, (value) => workspace.updateActiveInput(value))
watch(() => workspace.activeTabId, () => (input.value = workspace.activeTab?.input ?? ''))

function yamlToJson() {
  try {
    output.value = JSON.stringify(YAML.parse(input.value), null, 2)
    message.value = 'YAML converted to JSON'
    workspace.addHistory('yaml-json', 'YAML to JSON', input.value)
  } catch (error) {
    message.value = error instanceof Error ? error.message : 'Invalid YAML'
  }
}

function jsonToYaml() {
  try {
    output.value = YAML.stringify(JSON.parse(input.value))
    message.value = 'JSON converted to YAML'
    workspace.addHistory('yaml-json', 'JSON to YAML', input.value)
  } catch (error) {
    message.value = error instanceof Error ? error.message : 'Invalid JSON'
  }
}
</script>

<template>
  <div class="flex min-h-0 flex-1 flex-col gap-3">
    <div class="flex flex-wrap items-center gap-2">
      <button class="primary-button" @click="yamlToJson">YAML to JSON</button>
      <button class="secondary-button" @click="jsonToYaml">JSON to YAML</button>
      <span class="text-sm text-slate-500 dark:text-slate-400">{{ message }}</span>
    </div>
    <EditorSplitView>
      <template #first>
        <ToolEditor v-model="input" title="Input" language="yaml/json" placeholder="Paste YAML or JSON" filename="input.yml" @save="workspace.saveSnippet('YAML/JSON input', 'yaml-json', $event)" />
      </template>
      <template #second>
        <ToolEditor v-model="output" title="Output" language="yaml/json" readonly filename="converted.yml" @save="workspace.saveSnippet('YAML/JSON output', 'yaml-json', $event)" />
      </template>
    </EditorSplitView>
  </div>
</template>
