<script setup lang="ts">
import { Upload } from '@lucide/vue'
import { ref } from 'vue'

defineProps<{ accept?: string }>()
const emit = defineEmits<{ files: [files: FileList] }>()
const dragging = ref(false)
</script>

<template>
  <label
    class="flex min-h-24 cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed p-4 text-center text-sm transition"
    :class="dragging ? 'border-cyan-500 bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-200' : 'border-slate-300 bg-slate-50 text-slate-500 hover:border-cyan-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400'"
    @dragover.prevent="dragging = true"
    @dragleave="dragging = false"
    @drop.prevent="dragging = false; $event.dataTransfer?.files && emit('files', $event.dataTransfer.files)"
  >
    <Upload class="size-5" />
    <span>Drop a file or click to upload</span>
    <input class="hidden" type="file" :accept="accept" @change="$event.target && emit('files', ($event.target as HTMLInputElement).files!)" />
  </label>
</template>
