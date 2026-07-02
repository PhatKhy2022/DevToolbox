<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ArrowLeft, RotateCcw, Shuffle } from '@lucide/vue'
import { useVocabularyStore } from '@/stores/vocabulary'
import type { VocabCard } from '@/types/vocabulary'

const props = defineProps<{ deckId: string }>()
const emit = defineEmits<{ back: [] }>()

const vocabulary = useVocabularyStore()
const deck = computed(() => vocabulary.getDeck(props.deckId))

const queue = ref<VocabCard[]>([])
const index = ref(0)
const flipped = ref(false)
const shuffled = ref(true)

function buildQueue() {
  const cards = deck.value?.cards ?? []
  queue.value = shuffled.value ? [...cards].sort(() => Math.random() - 0.5) : [...cards]
  index.value = 0
  flipped.value = false
}

watch(
  () => [props.deckId, deck.value?.cards.length],
  () => buildQueue(),
  { immediate: true },
)

const current = computed(() => queue.value[index.value])
const progress = computed(() => {
  if (queue.value.length === 0) return '0 / 0'
  return `${index.value + 1} / ${queue.value.length}`
})

function next() {
  if (index.value < queue.value.length - 1) {
    index.value += 1
    flipped.value = false
  }
}

function prev() {
  if (index.value > 0) {
    index.value -= 1
    flipped.value = false
  }
}

function restart() {
  buildQueue()
}
</script>

<template>
  <div v-if="deck" class="mx-auto max-w-xl space-y-4">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <button type="button" class="secondary-button" @click="emit('back')">
        <ArrowLeft class="size-4" />
        Back
      </button>
      <div class="text-sm text-slate-500 dark:text-slate-400">{{ deck.title }} · {{ progress }}</div>
    </div>

    <div v-if="queue.length === 0" class="panel rounded-xl p-8 text-center text-slate-500">
      This set has no cards to study.
    </div>

    <template v-else-if="current">
      <button
        type="button"
        class="panel mx-auto flex min-h-56 w-full max-w-lg flex-col items-center justify-center rounded-2xl p-8 text-center transition hover:border-cyan-400 dark:hover:border-cyan-500"
        @click="flipped = !flipped"
      >
        <p class="mb-2 text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {{ flipped ? 'Definition' : 'Term' }} — click to flip
        </p>
        <p class="text-2xl font-semibold text-slate-900 dark:text-white">
          {{ flipped ? current.definition : current.term }}
        </p>
        <p v-if="flipped && current.example" class="mt-4 text-sm italic text-slate-500 dark:text-slate-400">
          {{ current.example }}
        </p>
      </button>

      <div class="flex flex-wrap items-center justify-center gap-2">
        <button type="button" class="secondary-button" :disabled="index === 0" @click="prev">Previous</button>
        <button type="button" class="secondary-button" @click="flipped = !flipped">
          {{ flipped ? 'Show term' : 'Show definition' }}
        </button>
        <button type="button" class="primary-button" :disabled="index >= queue.length - 1" @click="next">Next</button>
      </div>

      <div class="flex justify-center gap-2">
        <button type="button" class="secondary-button" @click="shuffled = !shuffled; buildQueue()">
          <Shuffle class="size-4" />
          {{ shuffled ? 'Shuffled' : 'In order' }}
        </button>
        <button type="button" class="secondary-button" @click="restart">
          <RotateCcw class="size-4" />
          Restart
        </button>
      </div>
    </template>
  </div>
</template>
