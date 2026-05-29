<script setup lang="ts">
import { LayoutDashboard, X } from '@lucide/vue'
import { useWorkspaceStore } from '@/stores/workspace'

const workspace = useWorkspaceStore()
</script>

<template>
  <div class="flex h-10 shrink-0 items-center overflow-x-auto border-b border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900">
    <button
      class="flex h-full items-center gap-2 border-r border-slate-200 px-4 text-sm dark:border-slate-800"
      :class="workspace.activeTool === 'dashboard' ? 'bg-white text-cyan-700 dark:bg-slate-950 dark:text-cyan-200' : 'text-slate-500 hover:bg-white/70 dark:text-slate-400 dark:hover:bg-slate-950/60'"
      @click="workspace.setTool('dashboard')"
    >
      <LayoutDashboard class="size-4" />
      <span v-if="workspace.tabs.length === 0">Dashboard</span>
    </button>

    <button
      v-for="tab in workspace.tabs"
      :key="tab.id"
      class="flex h-full min-w-36 max-w-48 items-center gap-2 border-r border-slate-200 px-3 text-sm dark:border-slate-800"
      :class="workspace.activeTabId === tab.id ? 'bg-white text-cyan-700 dark:bg-slate-950 dark:text-cyan-200' : 'text-slate-500 hover:bg-white/70 dark:text-slate-400 dark:hover:bg-slate-950/60'"
      @click="workspace.activeTabId = tab.id; workspace.activeTool = tab.toolId; workspace.persist()"
    >
      <span class="truncate">{{ tab.title }}</span>
      <X class="ml-auto size-3.5 shrink-0" @click.stop="workspace.closeTab(tab.id)" />
    </button>

    <div v-if="workspace.tabs.length > 0" class="ml-auto px-3">
      <button
        class="text-xs font-medium text-slate-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400"
        @click="workspace.clearTabs()"
      >
        Clear All
      </button>
    </div>
  </div>
</template>
