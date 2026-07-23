<script setup lang="ts">
import { ref } from 'vue'
import ToolEditor from '@/components/ToolEditor.vue'
import { useWorkspaceStore } from '@/stores/workspace'

const workspace = useWorkspaceStore()
const count = ref(10)
const output = ref('')

function generate() {
  const total = Math.min(Math.max(count.value, 1), 1000)
  output.value = Array.from({ length: total }, () => crypto.randomUUID()).join('\n')
  workspace.addHistory('uuid', `${total} UUIDs`, output.value)
}
</script>

<template>
  <div class="flex min-h-0 flex-1 flex-col gap-3">
    <div class="flex flex-wrap items-center gap-2">
      <label class="text-sm text-slate-500 dark:text-slate-400" for="uuid-count">Count</label>
      <input id="uuid-count" v-model.number="count" class="h-9 w-24 rounded-md border border-slate-200 bg-white px-2 text-sm dark:border-slate-800 dark:bg-slate-900" type="number" min="1" max="1000" />
      <button class="primary-button" @click="generate">Generate UUID v4</button>
    </div>
    <ToolEditor v-model="output" title="UUIDs" language="text" readonly filename="uuids.txt" @save="workspace.saveSnippet('UUID list', 'uuid', $event)" />
  </div>
</template>
