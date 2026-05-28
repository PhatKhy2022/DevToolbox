<script setup lang="ts">
import { Moon, PanelLeftClose, PanelLeftOpen, Plus, Search, Sun } from '@lucide/vue'
import { usePreferencesStore } from '@/stores/preferences'
import { useWorkspaceStore } from '@/stores/workspace'
import { detectContent } from '@/utils/detect'

const preferences = usePreferencesStore()
const workspace = useWorkspaceStore()

function handleSearch(event: Event) {
  const value = (event.target as HTMLInputElement).value
  const detected = detectContent(value)
  const toolMap = {
    json: 'json',
    yaml: 'yaml-json',
    jwt: 'jwt',
    csv: 'csv-json',
    base64: 'base64',
    text: workspace.activeTool,
  } as const

  workspace.setTool(toolMap[detected])
  workspace.updateActiveInput(value)
}
</script>

<template>
  <header class="flex h-14 shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-3 dark:border-slate-800 dark:bg-slate-950">
    <button class="icon-button" title="Toggle sidebar" @click="preferences.toggleSidebar()">
      <PanelLeftOpen v-if="preferences.sidebarCollapsed" class="size-4" />
      <PanelLeftClose v-else class="size-4" />
    </button>

    <div class="relative min-w-0 flex-1">
      <Search class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
      <input
        class="h-9 w-full rounded-md border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none transition focus:border-cyan-500 focus:bg-white dark:border-slate-800 dark:bg-slate-900 dark:focus:bg-slate-950"
        placeholder="Paste JSON, JWT, CSV, YAML, or Base64"
        @change="handleSearch"
      />
    </div>

    <button class="secondary-button hidden sm:inline-flex" @click="workspace.addTab(workspace.activeTool)">
      <Plus class="size-4" />
      New tab
    </button>

    <button class="icon-button" title="Toggle dark mode" @click="preferences.toggleDarkMode()">
      <Sun v-if="preferences.darkMode" class="size-4" />
      <Moon v-else class="size-4" />
    </button>
  </header>
</template>
