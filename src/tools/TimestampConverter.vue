<script setup lang="ts">
import { ref } from 'vue'
import ToolEditor from '@/components/ToolEditor.vue'
import { useWorkspaceStore } from '@/stores/workspace'
import { dateToTimestamp, timestampToDate, timezones } from '@/utils/time'

const workspace = useWorkspaceStore()
const timestamp = ref(Math.floor(Date.now() / 1000).toString())
const date = ref(new Date().toISOString().slice(0, 16))
const timezone = ref(Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC')
const output = ref('')
const message = ref('Convert dates and Unix timestamps')

function toDate() {
  try {
    output.value = timestampToDate(timestamp.value, timezone.value)
    message.value = 'Timestamp converted'
    workspace.addHistory('timestamp', 'Timestamp to date', timestamp.value)
  } catch (error) {
    message.value = error instanceof Error ? error.message : 'Invalid timestamp'
  }
}

function toTimestamp() {
  try {
    output.value = dateToTimestamp(date.value)
    message.value = 'Date converted'
    workspace.addHistory('timestamp', 'Date to timestamp', date.value)
  } catch (error) {
    message.value = error instanceof Error ? error.message : 'Invalid date'
  }
}
</script>

<template>
  <div class="grid min-h-0 flex-1 gap-3 lg:grid-cols-[360px_1fr]">
    <section class="panel min-h-0 overflow-y-auto rounded-md p-4">
      <div class="space-y-4">
        <label class="block">
          <span class="mb-1 block text-sm text-slate-500 dark:text-slate-400">Unix timestamp</span>
          <input v-model="timestamp" class="h-10 w-full rounded-md border border-slate-200 bg-white px-3 dark:border-slate-800 dark:bg-slate-900" />
        </label>
        <label class="block">
          <span class="mb-1 block text-sm text-slate-500 dark:text-slate-400">Date</span>
          <input v-model="date" class="h-10 w-full rounded-md border border-slate-200 bg-white px-3 dark:border-slate-800 dark:bg-slate-900" type="datetime-local" />
        </label>
        <label class="block">
          <span class="mb-1 block text-sm text-slate-500 dark:text-slate-400">Timezone</span>
          <select v-model="timezone" class="h-10 w-full rounded-md border border-slate-200 bg-white px-3 dark:border-slate-800 dark:bg-slate-900">
            <option v-for="zone in timezones" :key="zone">{{ zone }}</option>
          </select>
        </label>
        <div class="flex flex-wrap gap-2">
          <button class="primary-button" @click="toDate">Timestamp to date</button>
          <button class="secondary-button" @click="toTimestamp">Date to timestamp</button>
        </div>
        <p class="text-sm text-slate-500 dark:text-slate-400">{{ message }}</p>
      </div>
    </section>
    <ToolEditor v-model="output" title="Output" language="time" readonly filename="timestamp.txt" @save="workspace.saveSnippet('Timestamp output', 'timestamp', $event)" />
  </div>
</template>
