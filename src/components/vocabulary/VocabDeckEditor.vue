<script setup lang="ts">
import { computed, ref } from 'vue'
import { ArrowLeft, Pencil, Plus, Trash2 } from '@lucide/vue'
import { useVocabularyStore } from '@/stores/vocabulary'

const props = defineProps<{ deckId: string }>()
const emit = defineEmits<{ back: []; study: [] }>()

const vocabulary = useVocabularyStore()
const deck = computed(() => vocabulary.getDeck(props.deckId))

const term = ref('')
const definition = ref('')
const example = ref('')
const editingCardId = ref<string | null>(null)
const editTerm = ref('')
const editDefinition = ref('')
const editExample = ref('')

function addCard() {
  if (!deck.value || !term.value.trim() || !definition.value.trim()) return
  vocabulary.addCard(props.deckId, term.value, definition.value, example.value)
  term.value = ''
  definition.value = ''
  example.value = ''
}

function startEdit(cardId: string) {
  const card = deck.value?.cards.find((item) => item.id === cardId)
  if (!card) return
  editingCardId.value = cardId
  editTerm.value = card.term
  editDefinition.value = card.definition
  editExample.value = card.example ?? ''
}

function saveEdit() {
  if (!editingCardId.value) return
  if (!editTerm.value.trim() || !editDefinition.value.trim()) return
  vocabulary.updateCard(props.deckId, editingCardId.value, {
    term: editTerm.value,
    definition: editDefinition.value,
    example: editExample.value,
  })
  editingCardId.value = null
}

function cancelEdit() {
  editingCardId.value = null
}
</script>

<template>
  <div v-if="deck" class="mx-auto max-w-3xl space-y-4">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <button type="button" class="secondary-button" @click="emit('back')">
        <ArrowLeft class="size-4" />
        All sets
      </button>
      <button type="button" class="primary-button" :disabled="deck.cards.length === 0" @click="emit('study')">
        Study this set
      </button>
    </div>

    <div class="panel rounded-xl p-4">
      <label class="mb-3 block text-sm">
        <span class="mb-1 block text-slate-600 dark:text-slate-400">Set title</span>
        <input
          :value="deck.title"
          class="h-10 w-full rounded-md border border-slate-200 bg-white px-3 dark:border-slate-800 dark:bg-slate-900"
          @change="vocabulary.updateDeck(deck.id, { title: ($event.target as HTMLInputElement).value })"
        />
      </label>
      <label class="block text-sm">
        <span class="mb-1 block text-slate-600 dark:text-slate-400">Description</span>
        <input
          :value="deck.description"
          class="h-10 w-full rounded-md border border-slate-200 bg-white px-3 dark:border-slate-800 dark:bg-slate-900"
          placeholder="Optional"
          @change="vocabulary.updateDeck(deck.id, { description: ($event.target as HTMLInputElement).value })"
        />
      </label>
    </div>

    <div class="panel rounded-xl p-4">
      <h3 class="mb-3 text-sm font-semibold text-slate-900 dark:text-white">Add a term</h3>
      <div class="grid gap-2 sm:grid-cols-2">
        <input
          v-model="term"
          class="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-900"
          placeholder="Term (English word)"
        />
        <input
          v-model="definition"
          class="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-900"
          placeholder="Definition / translation"
        />
        <input
          v-model="example"
          class="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-900 sm:col-span-2"
          placeholder="Example sentence (optional)"
        />
      </div>
      <button type="button" class="primary-button mt-3" @click="addCard">
        <Plus class="size-4" />
        Add card
      </button>
    </div>

    <div v-if="deck.cards.length === 0" class="panel rounded-xl p-6 text-center text-sm text-slate-500 dark:text-slate-400">
      No cards in this set yet. Add your first term above.
    </div>

    <ul v-else class="space-y-2">
      <li
        v-for="card in deck.cards"
        :key="card.id"
        class="panel rounded-lg p-4"
      >
        <template v-if="editingCardId === card.id">
          <div class="grid gap-2 sm:grid-cols-2">
            <input v-model="editTerm" class="h-9 rounded-md border border-slate-200 bg-white px-2 text-sm dark:border-slate-800 dark:bg-slate-900" />
            <input v-model="editDefinition" class="h-9 rounded-md border border-slate-200 bg-white px-2 text-sm dark:border-slate-800 dark:bg-slate-900" />
            <input
              v-model="editExample"
              class="h-9 rounded-md border border-slate-200 bg-white px-2 text-sm dark:border-slate-800 dark:bg-slate-900 sm:col-span-2"
              placeholder="Example"
            />
          </div>
          <div class="mt-2 flex gap-2">
            <button type="button" class="primary-button" @click="saveEdit">Save</button>
            <button type="button" class="secondary-button" @click="cancelEdit">Cancel</button>
          </div>
        </template>
        <template v-else>
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <p class="font-medium text-slate-900 dark:text-white">{{ card.term }}</p>
              <p class="mt-1 text-sm text-slate-600 dark:text-slate-300">{{ card.definition }}</p>
              <p v-if="card.example" class="mt-1 text-sm italic text-slate-500 dark:text-slate-400">{{ card.example }}</p>
            </div>
            <div class="flex shrink-0 gap-1">
              <button type="button" class="icon-button" title="Edit" @click="startEdit(card.id)">
                <Pencil class="size-4" />
              </button>
              <button
                type="button"
                class="icon-button text-rose-600 dark:text-rose-400"
                title="Delete"
                @click="vocabulary.deleteCard(deck.id, card.id)"
              >
                <Trash2 class="size-4" />
              </button>
            </div>
          </div>
        </template>
      </li>
    </ul>
  </div>

  <div v-else class="text-center text-slate-500">Set not found.</div>
</template>
