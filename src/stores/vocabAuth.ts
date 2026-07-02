import { defineStore } from 'pinia'
import type { VocabAuthRegistry, VocabSession } from '@/types/vocabulary'
import { hashPassword, randomSalt } from '@/utils/crypto'
import { loadJson, saveJson } from '@/utils/storage'

const AUTH_KEY = 'devtoolbox:vocab-auth'
const SESSION_KEY = 'devtoolbox:vocab-session'

function normalizeUsername(username: string): string {
  return username.trim().toLowerCase()
}

interface VocabAuthState {
  session: VocabSession | null
  authError: string
  authLoading: boolean
}

export const useVocabAuthStore = defineStore('vocabAuth', {
  state: (): VocabAuthState => ({
    session: loadJson<VocabSession | null>(SESSION_KEY, null),
    authError: '',
    authLoading: false,
  }),
  getters: {
    isLoggedIn: (state) => Boolean(state.session?.username),
    username: (state) => state.session?.username ?? '',
  },
  actions: {
    clearError() {
      this.authError = ''
    },
    async register(username: string, password: string) {
      this.authLoading = true
      this.authError = ''
      try {
        const name = normalizeUsername(username)
        if (!name || name.length < 2) {
          throw new Error('Username must be at least 2 characters.')
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters.')
        }

        const registry = loadJson<VocabAuthRegistry>(AUTH_KEY, { users: {} })
        if (registry.users[name]) {
          throw new Error('Username already exists.')
        }

        const salt = randomSalt()
        const passwordHash = await hashPassword(password, salt)
        registry.users[name] = { passwordHash, salt, createdAt: new Date().toISOString() }
        saveJson(AUTH_KEY, registry)

        const session: VocabSession = { username: name, loggedInAt: new Date().toISOString() }
        this.session = session
        saveJson(SESSION_KEY, session)
      } catch (error) {
        this.authError = error instanceof Error ? error.message : 'Registration failed.'
        throw error
      } finally {
        this.authLoading = false
      }
    },
    async login(username: string, password: string) {
      this.authLoading = true
      this.authError = ''
      try {
        const name = normalizeUsername(username)
        const registry = loadJson<VocabAuthRegistry>(AUTH_KEY, { users: {} })
        const user = registry.users[name]
        if (!user) {
          throw new Error('Invalid username or password.')
        }

        const passwordHash = await hashPassword(password, user.salt)
        if (passwordHash !== user.passwordHash) {
          throw new Error('Invalid username or password.')
        }

        const session: VocabSession = { username: name, loggedInAt: new Date().toISOString() }
        this.session = session
        saveJson(SESSION_KEY, session)
      } catch (error) {
        this.authError = error instanceof Error ? error.message : 'Login failed.'
        throw error
      } finally {
        this.authLoading = false
      }
    },
    logout() {
      this.session = null
      localStorage.removeItem(SESSION_KEY)
      this.authError = ''
    },
  },
})
