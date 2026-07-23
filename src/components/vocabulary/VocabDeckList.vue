<script setup lang="ts">
import { ref } from 'vue'
import { BookOpen, LogOut, Plus, Trash2 } from '@lucide/vue'
import { useVocabAuthStore } from '@/stores/vocabAuth'
import { useVocabularyStore } from '@/stores/vocabulary'

const emit = defineEmits<{
  openDeck: [deckId: string]
  studyDeck: [deckId: string]
}>()

const auth = useVocabAuthStore()
const vocabulary = useVocabularyStore()

const newTitle = ref('')
const newDescription = ref('')

function createDeck() {
  if (!newTitle.value.trim()) return
  const deck = vocabulary.createDeck(newTitle.value, newDescription.value)
  newTitle.value = ''
  newDescription.value = ''
  emit('openDeck', deck.id)
}

function logout() {
  auth.logout()
  vocabulary.reset()
}
</script>

<template>
  <div class="mx-auto max-w-3xl space-y-4">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <p class="text-sm text-slate-500 dark:text-slate-400">Signed in as</p>
        <p class="font-medium text-slate-900 dark:text-white">{{ auth.username }}</p>
      </div>
      <div class="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
        <span>{{ vocabulary.deckCount }} sets</span>
        <span>·</span>
        <span>{{ vocabulary.totalCards }} cards</span>
        <button type="button" class="secondary-button ml-2" @click="logout">
          <LogOut class="size-4" />
          Log out
        </button>
      </div>
    </div>

    <div class="panel rounded-xl p-4">
      <h3 class="mb-3 text-sm font-semibold text-slate-900 dark:text-white">Create a new set</h3>
      <div class="flex flex-col gap-2 sm:flex-row">
        <input
          v-model="newTitle"
          class="h-10 min-w-0 flex-1 rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-900"
          placeholder="Set title (e.g. IELTS Week 1)"
        />
        <input
          v-model="newDescription"
          class="h-10 min-w-0 flex-1 rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-900"
          placeholder="Description (optional)"
        />
        <button type="button" class="primary-button shrink-0" @click="createDeck">
          <Plus class="size-4" />
          Create
        </button>
      </div>
    </div>

    <div v-if="vocabulary.decks.length === 0" class="panel rounded-xl p-8 text-center">
      <BookOpen class="mx-auto mb-3 size-10 text-slate-400" />
      <p class="text-slate-600 dark:text-slate-300">No vocabulary sets yet.</p>
      <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">Create your first set above to start adding words.</p>
    </div>

    <div v-else class="grid gap-3 sm:grid-cols-2">
      <article
        v-for="deck in vocabulary.decks"
        :key="deck.id"
        class="panel flex flex-col rounded-xl p-4 transition hover:border-cyan-400 dark:hover:border-cyan-500"
      >
        <h3 class="font-semibold text-slate-900 dark:text-white">{{ deck.title }}</h3>
        <p v-if="deck.description" class="mt-1 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
          {{ deck.description }}
        </p>
        <p class="mt-2 text-xs text-slate-500 dark:text-slate-400">{{ deck.cards.length }} terms</p>

        <div class="mt-4 flex flex-wrap gap-2">
          <button type="button" class="primary-button" @click="emit('openDeck', deck.id)">Edit cards</button>
          <button
            type="button"
            class="secondary-button"
            :disabled="deck.cards.length === 0"
            @click="emit('studyDeck', deck.id)"
          >
            Study
          </button>
          <button
            type="button"
            class="icon-button text-rose-600 dark:text-rose-400"
            title="Delete set"
            :aria-label="`Delete '${deck.title}' set`"
            @click="vocabulary.deleteDeck(deck.id)"
          >
            <Trash2 class="size-4" />
          </button>
        </div>
      </article>
    </div>
  </div>
</template>
