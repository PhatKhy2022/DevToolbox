<script setup lang="ts">
import { 
  Code2, 
  FileJson, 
  FileSpreadsheet, 
  Fingerprint, 
  Hash, 
  KeyRound, 
  Type, 
  Clock 
} from '@lucide/vue'
import { useWorkspaceStore } from '@/stores/workspace'
import type { ToolId } from '@/types/tool'

const workspace = useWorkspaceStore()

const tools = [
  { id: 'json', name: 'JSON Formatter', description: 'Pretty print, minify, and validate JSON data.', icon: FileJson, color: 'text-amber-500' },
  { id: 'csv-json', name: 'CSV JSON', description: 'Convert CSV/Excel to JSON and vice-versa.', icon: FileSpreadsheet, color: 'text-emerald-500' },
  { id: 'yaml-json', name: 'YAML JSON', description: 'Convert between YAML and JSON formats.', icon: Code2, color: 'text-indigo-500' },
  { id: 'jwt', name: 'JWT Decoder', description: 'Decode and inspect JSON Web Tokens.', icon: KeyRound, color: 'text-purple-500' },
  { id: 'uuid', name: 'UUID Generator', description: 'Generate secure random UUID v4 strings.', icon: Fingerprint, color: 'text-rose-500' },
  { id: 'base64', name: 'Base64 Tool', description: 'Encode or decode text and files.', icon: Type, color: 'text-blue-500' },
  { id: 'timestamp', name: 'Timestamp Converter', description: 'Convert between Unix time and dates.', icon: Clock, color: 'text-cyan-500' },
] as const

function selectTool(id: ToolId) {
  workspace.setTool(id)
}
</script>

<template>
  <div class="mx-auto max-w-4xl py-8">
    <div class="mb-8 text-center">
      <h2 class="text-3xl font-bold text-slate-900 dark:text-white">Developer Toolbox</h2>
      <p class="mt-2 text-slate-500 dark:text-slate-400">All-in-one productivity tools for developers.</p>
    </div>

    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <button
        v-for="tool in tools"
        :key="tool.id"
        class="group flex flex-col rounded-xl border border-slate-200 bg-white p-5 text-left transition-all hover:border-cyan-500 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-cyan-400"
        @click="selectTool(tool.id)"
      >
        <div :class="[tool.color, 'mb-4 flex size-10 items-center justify-center rounded-lg bg-slate-50 dark:bg-slate-800']">
          <component :is="tool.icon" class="size-6" />
        </div>
        <h3 class="font-semibold text-slate-900 dark:text-white">{{ tool.name }}</h3>
        <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">{{ tool.description }}</p>
      </button>
    </div>
  </div>
</template>
