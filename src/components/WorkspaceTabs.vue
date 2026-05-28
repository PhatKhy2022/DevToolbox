<script setup lang="ts">
import { X } from '@lucide/vue'
import { useWorkspaceStore } from '@/stores/workspace'

const workspace = useWorkspaceStore()
</script>

<template>
  <div class="flex h-10 shrink-0 items-center overflow-x-auto border-b border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900">
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
  </div>
</template>
