export interface VocabCard {
  id: string
  term: string
  definition: string
  example?: string
  createdAt: string
  updatedAt: string
}

export interface VocabDeck {
  id: string
  title: string
  description: string
  cards: VocabCard[]
  createdAt: string
  updatedAt: string
}

export interface VocabUserData {
  decks: VocabDeck[]
}

export interface VocabUserRecord {
  passwordHash: string
  salt: string
  createdAt: string
}

export interface VocabAuthRegistry {
  users: Record<string, VocabUserRecord>
}

export interface VocabSession {
  username: string
  loggedInAt: string
}
