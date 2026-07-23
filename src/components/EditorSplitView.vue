<script setup lang="ts">
import { Minimize2 } from '@lucide/vue'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useEditorViewStore } from '@/stores/editorView'

const editorView = useEditorViewStore()
const containerRef = ref<HTMLElement | null>(null)
const splitPercent = ref(50)
const isRowLayout = ref(true)
let dragging = false

function updateOrientation() {
  isRowLayout.value = window.matchMedia('(min-width: 1024px)').matches
}

function onDrag(event: PointerEvent) {
  if (!dragging || !containerRef.value) return
  const rect = containerRef.value.getBoundingClientRect()
  const percent = isRowLayout.value
    ? ((event.clientX - rect.left) / rect.width) * 100
    : ((event.clientY - rect.top) / rect.height) * 100
  splitPercent.value = Math.min(80, Math.max(20, percent))
}

function stopDrag() {
  dragging = false
  window.removeEventListener('pointermove', onDrag)
  window.removeEventListener('pointerup', stopDrag)
}

function startDrag(event: PointerEvent) {
  updateOrientation()
  dragging = true
  event.preventDefault()
  ;(event.currentTarget as HTMLElement)?.focus()
  window.addEventListener('pointermove', onDrag)
  window.addEventListener('pointerup', stopDrag)
}

function resetSplit() {
  splitPercent.value = 50
}

function onDividerKeydown(event: KeyboardEvent) {
  updateOrientation()
  const step = 4
  let delta = 0
  if (isRowLayout.value) {
    if (event.key === 'ArrowLeft') delta = -step
    else if (event.key === 'ArrowRight') delta = step
  } else {
    if (event.key === 'ArrowUp') delta = -step
    else if (event.key === 'ArrowDown') delta = step
  }
  if (delta === 0) return
  event.preventDefault()
  splitPercent.value = Math.min(80, Math.max(20, splitPercent.value + delta))
}

function handleFullscreenChange() {
  editorView.setFullscreen(document.fullscreenElement === containerRef.value)
}

onMounted(() => {
  editorView.register(containerRef.value)
  document.addEventListener('fullscreenchange', handleFullscreenChange)
})

onUnmounted(() => {
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
  editorView.register(null)
  editorView.setFullscreen(false)
  stopDrag()
})

const firstPaneStyle = computed(() => ({ flex: `0 0 ${splitPercent.value}%` }))
</script>

<template>
  <div
    ref="containerRef"
    class="relative flex min-h-0 flex-1 flex-col lg:flex-row"
    :class="editorView.isFullscreen ? 'bg-slate-100 p-3 dark:bg-slate-950' : ''"
  >
    <button
      v-if="editorView.isFullscreen"
      class="icon-button absolute right-3 top-3 z-10 size-8"
      title="Exit fullscreen"
      aria-label="Exit fullscreen"
      @click="editorView.toggleFullscreen()"
    >
      <Minimize2 class="size-4" />
    </button>

    <div class="flex min-h-0 min-w-0 flex-col overflow-hidden" :style="firstPaneStyle">
      <slot name="first" />
    </div>

    <div
      class="h-1 shrink-0 touch-none cursor-row-resize bg-slate-200 transition hover:bg-cyan-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 lg:h-auto lg:w-1 lg:cursor-col-resize dark:bg-slate-800"
      role="separator"
      :aria-orientation="isRowLayout ? 'vertical' : 'horizontal'"
      aria-label="Resize panels"
      tabindex="0"
      title="Drag to resize · double-click to reset"
      @pointerdown="startDrag"
      @dblclick="resetSplit"
      @keydown="onDividerKeydown"
    ></div>

    <div class="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      <slot name="second" />
    </div>
  </div>
</template>
