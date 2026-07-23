<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import VocabAuthForm from '@/components/vocabulary/VocabAuthForm.vue'
import VocabDeckEditor from '@/components/vocabulary/VocabDeckEditor.vue'
import VocabDeckList from '@/components/vocabulary/VocabDeckList.vue'
import VocabStudyMode from '@/components/vocabulary/VocabStudyMode.vue'
import { useVocabAuthStore } from '@/stores/vocabAuth'
import { useVocabularyStore } from '@/stores/vocabulary'

type View = 'decks' | 'editor' | 'study'

const auth = useVocabAuthStore()
const vocabulary = useVocabularyStore()

const view = ref<View>('decks')
const activeDeckId = ref<string | null>(null)

onMounted(() => {
  if (auth.isLoggedIn) vocabulary.syncForUser()
})

watch(
  () => auth.isLoggedIn,
  (loggedIn) => {
    if (loggedIn) {
      vocabulary.syncForUser()
      view.value = 'decks'
      activeDeckId.value = null
    } else {
      vocabulary.reset()
      view.value = 'decks'
      activeDeckId.value = null
    }
  },
)

function openDeck(deckId: string) {
  activeDeckId.value = deckId
  view.value = 'editor'
}

function studyDeck(deckId: string) {
  activeDeckId.value = deckId
  view.value = 'study'
}

function backToDecks() {
  view.value = 'decks'
  activeDeckId.value = null
}
</script>

<template>
  <div class="w-full shrink-0 pt-2 pb-16">
    <VocabAuthForm v-if="!auth.isLoggedIn" />

    <template v-else>
      <VocabDeckList
        v-if="view === 'decks'"
        @open-deck="openDeck"
        @study-deck="studyDeck"
      />
      <VocabDeckEditor
        v-else-if="view === 'editor' && activeDeckId"
        :deck-id="activeDeckId"
        @back="backToDecks"
        @study="view = 'study'"
      />
      <VocabStudyMode
        v-else-if="view === 'study' && activeDeckId"
        :deck-id="activeDeckId"
        @back="view = 'editor'"
      />
    </template>
  </div>
</template>
