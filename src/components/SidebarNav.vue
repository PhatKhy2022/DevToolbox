<script setup lang="ts">
import {
  Binary,
  Braces,
  Clock3,
  FileJson2,
  FileSpreadsheet,
  Fingerprint,
  KeyRound,
  LayoutDashboard,
  Play,
} from '@lucide/vue'
import type { ToolDefinition } from '@/types/tool'
import { usePreferencesStore } from '@/stores/preferences'
import { useWorkspaceStore } from '@/stores/workspace'

defineProps<{ tools: ToolDefinition[] }>()

const icons = {
  dashboard: LayoutDashboard,
  json: Braces,
  'csv-json': FileSpreadsheet,
  'yaml-json': FileJson2,
  jwt: KeyRound,
  uuid: Fingerprint,
  base64: Binary,
  timestamp: Clock3,
  'js-playground': Play,
}

const preferences = usePreferencesStore()
const workspace = useWorkspaceStore()
</script>

<template>
  <aside
    class="hidden shrink-0 border-r border-slate-200 bg-slate-50 transition-[width] duration-200 dark:border-slate-800 dark:bg-slate-950/70 md:block"
    :class="preferences.sidebarCollapsed ? 'w-16' : 'w-72'"
  >
    <div class="flex h-14 items-center gap-2 border-b border-slate-200 px-4 dark:border-slate-800">
      <div class="grid size-8 place-items-center rounded-md bg-cyan-600 text-sm font-black text-white">DT</div>
      <div v-if="!preferences.sidebarCollapsed" class="min-w-0">
        <div class="truncate text-sm font-semibold text-slate-900 dark:text-white">DevToolbox</div>
        <div class="truncate text-xs text-slate-500 dark:text-slate-400">Frontend utilities</div>
      </div>
    </div>

    <nav class="space-y-1 p-2">
      <button
        v-for="tool in tools"
        :key="tool.id"
        class="flex h-11 w-full items-center gap-3 rounded-md px-3 text-left text-sm transition"
        :class="
          workspace.activeTool === tool.id
            ? 'bg-cyan-600 text-white shadow-sm'
            : 'text-slate-600 hover:bg-white hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white'
        "
        :title="tool.name"
        @click="workspace.setTool(tool.id)"
      >
        <component :is="icons[tool.id]" class="size-4 shrink-0" />
        <span v-if="!preferences.sidebarCollapsed" class="truncate">{{ tool.name }}</span>
        <kbd v-if="!preferences.sidebarCollapsed" class="ml-auto text-[10px] opacity-70">{{ tool.shortcut }}</kbd>
      </button>
    </nav>
  </aside>
</template>
