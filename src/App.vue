<script setup lang="ts">
import { Maximize2 } from '@lucide/vue'
import { computed, defineAsyncComponent, onMounted, onUnmounted } from 'vue'
import AppFooter from '@/components/AppFooter.vue'
import AppHeader from '@/components/AppHeader.vue'
import HistoryPanel from '@/components/HistoryPanel.vue'
import SidebarNav from '@/components/SidebarNav.vue'
import WorkspaceTabs from '@/components/WorkspaceTabs.vue'
import { useEditorViewStore } from '@/stores/editorView'
import { syncPreferencesStore, usePreferencesStore } from '@/stores/preferences'
import { useWorkspaceStore } from '@/stores/workspace'
import type { ToolDefinition, ToolId } from '@/types/tool'

const preferences = usePreferencesStore()
const workspace = useWorkspaceStore()
const editorView = useEditorViewStore()

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
  { id: 'english-vocab', name: 'English Vocabulary', description: 'Flashcard sets with login, editing, and study mode.', shortcut: '0', component: defineAsyncComponent(() => import('@/tools/EnglishVocabulary.vue')) },
]

const activeTool = computed(() => tools.find((tool) => tool.id === workspace.activeTool) ?? tools[0])

// Dashboard and Vocabulary render flowing content (no internal scroll region of their own),
// so <main> handles their scrolling. Every other tool embeds Monaco editors that already
// scroll internally — letting <main> scroll too would show two scrollbars at once.
const FLOWING_CONTENT_TOOLS: ToolId[] = ['dashboard', 'english-vocab']
const mainScrollable = computed(() => FLOWING_CONTENT_TOOLS.includes(workspace.activeTool))

function selectToolFromKey(event: KeyboardEvent) {
  if (!event.ctrlKey && !event.metaKey) return
  const tool = tools.find((item) => item.shortcut === event.key)
  if (tool) {
    event.preventDefault()
    workspace.setTool(tool.id)
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
  <div class="flex h-dvh flex-col overflow-hidden bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
    <div class="flex min-h-0 flex-1">
      <SidebarNav :tools="tools" />

      <div class="flex min-w-0 min-h-0 flex-1 flex-col">
        <AppHeader />
        <WorkspaceTabs />

        <div class="flex min-h-0 flex-1">
          <main
            class="flex min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden p-3"
            :class="mainScrollable ? 'scrollbar overflow-y-auto' : 'overflow-y-hidden'"
          >
            <div v-if="workspace.activeTool !== 'dashboard'" class="mb-3 flex shrink-0 flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <h1 class="text-xl font-semibold text-slate-950 dark:text-white">{{ activeTool.name }}</h1>
                <p class="text-sm text-slate-500 dark:text-slate-400">{{ activeTool.description }}</p>
              </div>
              <div class="flex items-center gap-2">
                <select
                  class="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-900 md:hidden"
                  :value="workspace.activeTool"
                  @change="workspace.setTool(($event.target as HTMLSelectElement).value as ToolId)"
                >
                  <option v-for="tool in tools.filter(t => t.id !== 'dashboard')" :key="tool.id" :value="tool.id">{{ tool.name }}</option>
                </select>
                <button
                  v-if="editorView.fullscreenTarget && !editorView.isFullscreen"
                  class="icon-button size-8"
                  title="Fullscreen both panels"
                  aria-label="Fullscreen both panels"
                  @click="editorView.toggleFullscreen()"
                >
                  <Maximize2 class="size-4" />
                </button>
              </div>
            </div>

            <component :is="activeTool.component" />
          </main>

          <HistoryPanel v-if="preferences.historyVisible" />
        </div>
      </div>
    </div>

    <AppFooter />
  </div>
</template>
