import { defineStore } from 'pinia'
import { watch } from 'vue'
import { loadJson, saveJson } from '@/utils/storage'

const STORAGE_KEY = 'devtoolbox:preferences'

interface PreferencesState {
  darkMode: boolean
  sidebarCollapsed: boolean
}

const initialState = loadJson<PreferencesState>(STORAGE_KEY, {
  darkMode: true,
  sidebarCollapsed: false,
})

export const usePreferencesStore = defineStore('preferences', {
  state: (): PreferencesState => ({ ...initialState }),
  actions: {
    toggleDarkMode() {
      this.darkMode = !this.darkMode
    },
    toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed
    },
    hydrateDom() {
      document.documentElement.classList.toggle('dark', this.darkMode)
    },
  },
})

export function syncPreferencesStore(): void {
  const store = usePreferencesStore()
  store.hydrateDom()
  watch(
    () => ({ darkMode: store.darkMode, sidebarCollapsed: store.sidebarCollapsed }),
    (value) => {
      saveJson(STORAGE_KEY, value)
      store.hydrateDom()
    },
    { deep: true },
  )
}
