import { defineStore } from 'pinia'
import type { VocabCard, VocabDeck, VocabUserData } from '@/types/vocabulary'
import { loadJson, saveJson } from '@/utils/storage'
import { useVocabAuthStore } from '@/stores/vocabAuth'

function id(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`
}

function dataKey(username: string): string {
  return `devtoolbox:vocab-data:${username}`
}

interface VocabularyState {
  decks: VocabDeck[]
  loadedFor: string | null
}

export const useVocabularyStore = defineStore('vocabulary', {
  state: (): VocabularyState => ({
    decks: [],
    loadedFor: null,
  }),
  getters: {
    deckCount: (state) => state.decks.length,
    totalCards: (state) => state.decks.reduce((sum, deck) => sum + deck.cards.length, 0),
    getDeck: (state) => (deckId: string) => state.decks.find((deck) => deck.id === deckId),
  },
  actions: {
    syncForUser() {
      const auth = useVocabAuthStore()
      if (!auth.isLoggedIn) {
        this.decks = []
        this.loadedFor = null
        return
      }

      if (this.loadedFor === auth.username) return

      const data = loadJson<VocabUserData>(dataKey(auth.username), { decks: [] })
      this.decks = data.decks
      this.loadedFor = auth.username
    },
    persist() {
      const auth = useVocabAuthStore()
      if (!auth.isLoggedIn) return
      saveJson(dataKey(auth.username), { decks: this.decks })
    },
    reset() {
      this.decks = []
      this.loadedFor = null
    },
    createDeck(title: string, description = ''): VocabDeck {
      const now = new Date().toISOString()
      const deck: VocabDeck = {
        id: id('deck'),
        title: title.trim() || 'Untitled set',
        description: description.trim(),
        cards: [],
        createdAt: now,
        updatedAt: now,
      }
      this.decks.unshift(deck)
      this.persist()
      return deck
    },
    updateDeck(deckId: string, patch: Partial<Pick<VocabDeck, 'title' | 'description'>>) {
      const deck = this.getDeck(deckId)
      if (!deck) return
      if (patch.title !== undefined) deck.title = patch.title.trim() || deck.title
      if (patch.description !== undefined) deck.description = patch.description.trim()
      deck.updatedAt = new Date().toISOString()
      this.persist()
    },
    deleteDeck(deckId: string) {
      this.decks = this.decks.filter((deck) => deck.id !== deckId)
      this.persist()
    },
    addCard(deckId: string, term: string, definition: string, example = ''): VocabCard | null {
      const deck = this.getDeck(deckId)
      if (!deck) return null
      const trimmedTerm = term.trim()
      const trimmedDefinition = definition.trim()
      if (!trimmedTerm || !trimmedDefinition) return null
      const now = new Date().toISOString()
      const card: VocabCard = {
        id: id('card'),
        term: trimmedTerm,
        definition: trimmedDefinition,
        example: example.trim() || undefined,
        createdAt: now,
        updatedAt: now,
      }
      deck.cards.unshift(card)
      deck.updatedAt = now
      this.persist()
      return card
    },
    updateCard(deckId: string, cardId: string, patch: Partial<Pick<VocabCard, 'term' | 'definition' | 'example'>>) {
      const deck = this.getDeck(deckId)
      if (!deck) return
      const card = deck.cards.find((item) => item.id === cardId)
      if (!card) return
      if (patch.term !== undefined) {
        const trimmedTerm = patch.term.trim()
        if (!trimmedTerm) return
        card.term = trimmedTerm
      }
      if (patch.definition !== undefined) {
        const trimmedDefinition = patch.definition.trim()
        if (!trimmedDefinition) return
        card.definition = trimmedDefinition
      }
      if (patch.example !== undefined) {
        const value = patch.example.trim()
        card.example = value || undefined
      }
      card.updatedAt = new Date().toISOString()
      deck.updatedAt = card.updatedAt
      this.persist()
    },
    deleteCard(deckId: string, cardId: string) {
      const deck = this.getDeck(deckId)
      if (!deck) return
      deck.cards = deck.cards.filter((card) => card.id !== cardId)
      deck.updatedAt = new Date().toISOString()
      this.persist()
    },
  },
})
