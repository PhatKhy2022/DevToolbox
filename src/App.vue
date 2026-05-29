<script setup lang="ts">
import { computed, defineAsyncComponent, onMounted, onUnmounted } from 'vue'
import AppHeader from '@/components/AppHeader.vue'
import HistoryPanel from '@/components/HistoryPanel.vue'
import SidebarNav from '@/components/SidebarNav.vue'
import WorkspaceTabs from '@/components/WorkspaceTabs.vue'
import { syncPreferencesStore, usePreferencesStore } from '@/stores/preferences'
import { useWorkspaceStore } from '@/stores/workspace'
import type { ToolDefinition, ToolId } from '@/types/tool'

const preferences = usePreferencesStore()
const workspace = useWorkspaceStore()

const tools: ToolDefinition[] = [
  { id: 'dashboard', name: 'Dashboard', description: 'Overview of all available tools.', shortcut: '1', component: defineAsyncComponent(() => import('@/tools/Dashboard.vue')) },
  { id: 'json', name: 'JSON Formatter', description: 'Pretty print, minify, and validate JSON.', shortcut: '2', component: defineAsyncComponent(() => import('@/tools/JsonFormatter.vue')) },
  { id: 'csv-json', name: 'CSV JSON', description: 'Convert CSV or XLSX to JSON and JSON to CSV.', shortcut: '3', component: defineAsyncComponent(() => import('@/tools/CsvJsonConverter.vue')) },
  { id: 'yaml-json', name: 'YAML JSON', description: 'Convert YAML to JSON and JSON to YAML.', shortcut: '4', component: defineAsyncComponent(() => import('@/tools/YamlJsonConverter.vue')) },
  { id: 'jwt', name: 'JWT Decoder', description: 'Decode JWT payloads and expiry claims.', shortcut: '5', component: defineAsyncComponent(() => import('@/tools/JwtDecoder.vue')) },
  { id: 'uuid', name: 'UUID Generator', description: 'Generate single or batch UUID v4 values.', shortcut: '6', component: defineAsyncComponent(() => import('@/tools/UuidGenerator.vue')) },
  { id: 'base64', name: 'Base64 Tool', description: 'Encode and decode text or files.', shortcut: '7', component: defineAsyncComponent(() => import('@/tools/Base64Tool.vue')) },
  { id: 'timestamp', name: 'Timestamp Converter', description: 'Convert Unix timestamps and dates.', shortcut: '8', component: defineAsyncComponent(() => import('@/tools/TimestampConverter.vue')) },
  { id: 'js-playground', name: 'JS Playground', description: 'Run JavaScript code and see console output.', shortcut: '9', component: defineAsyncComponent(() => import('@/tools/JsPlayground.vue')) },
]

const activeTool = computed(() => tools.find((tool) => tool.id === workspace.activeTool) ?? tools[0])

function selectToolFromKey(event: KeyboardEvent) {
  if (!event.ctrlKey && !event.metaKey) return
  const index = Number(event.key) - 1
  if (index >= 0 && index < tools.length) {
    event.preventDefault()
    workspace.setTool(tools[index].id)
  }
  if (event.key.toLowerCase() === 'n') {
    event.preventDefault()
    workspace.addTab(workspace.activeTool)
  }
}

onMounted(() => {
  syncPreferencesStore()
  window.addEventListener('keydown', selectToolFromKey)
})

onUnmounted(() => window.removeEventListener('keydown', selectToolFromKey))
</script>

<template>
  <div class="flex h-screen overflow-hidden bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
    <SidebarNav :tools="tools" />

    <div class="flex min-w-0 flex-1 flex-col">
      <AppHeader />
      <WorkspaceTabs />

      <div class="flex min-h-0 flex-1">
        <main class="scrollbar min-w-0 flex-1 overflow-auto p-3">
          <div v-if="workspace.activeTool !== 'dashboard'" class="mb-3 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 class="text-xl font-semibold text-slate-950 dark:text-white">{{ activeTool.name }}</h1>
              <p class="text-sm text-slate-500 dark:text-slate-400">{{ activeTool.description }}</p>
            </div>
            <select
              class="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-900 md:hidden"
              :value="workspace.activeTool"
              @change="workspace.setTool(($event.target as HTMLSelectElement).value as ToolId)"
            >
              <option v-for="tool in tools.filter(t => t.id !== 'dashboard')" :key="tool.id" :value="tool.id">{{ tool.name }}</option>
            </select>
          </div>

          <component :is="activeTool.component" />
        </main>

        <HistoryPanel v-if="preferences.historyVisible" />
      </div>
    </div>
  </div>
</template>
