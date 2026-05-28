<script setup lang="ts">
import { Bookmark, Clock3 } from '@lucide/vue'
import { useWorkspaceStore } from '@/stores/workspace'

const workspace = useWorkspaceStore()
</script>

<template>
  <aside class="hidden w-80 shrink-0 border-l border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/70 xl:block">
    <section class="mb-4">
      <div class="mb-2 flex items-center gap-2 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
        <Clock3 class="size-4" />
        History
      </div>
      <div class="space-y-2">
        <button
          v-for="item in workspace.history.slice(0, 8)"
          :key="item.id"
          class="w-full rounded-md border border-slate-200 bg-white p-2 text-left text-xs transition hover:border-cyan-400 dark:border-slate-800 dark:bg-slate-900"
          @click="workspace.setTool(item.toolId); workspace.updateActiveInput(item.value)"
        >
          <div class="truncate font-medium text-slate-800 dark:text-slate-100">{{ item.label }}</div>
          <div class="truncate text-slate-500">{{ new Date(item.createdAt).toLocaleString() }}</div>
        </button>
        <p v-if="!workspace.history.length" class="text-sm text-slate-500">No history yet.</p>
      </div>
    </section>

    <section>
      <div class="mb-2 flex items-center gap-2 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
        <Bookmark class="size-4" />
        Snippets
      </div>
      <div class="space-y-2">
        <button
          v-for="snippet in workspace.snippets.slice(0, 8)"
          :key="snippet.id"
          class="w-full rounded-md border border-slate-200 bg-white p-2 text-left text-xs transition hover:border-cyan-400 dark:border-slate-800 dark:bg-slate-900"
          @click="workspace.setTool(snippet.toolId); workspace.updateActiveInput(snippet.value)"
        >
          <div class="truncate font-medium text-slate-800 dark:text-slate-100">{{ snippet.name }}</div>
          <div class="truncate text-slate-500">{{ snippet.toolId }}</div>
        </button>
        <p v-if="!workspace.snippets.length" class="text-sm text-slate-500">No saved snippets.</p>
      </div>
    </section>
  </aside>
</template>
