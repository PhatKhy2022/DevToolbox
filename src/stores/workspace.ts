import { defineStore } from 'pinia'
import type { HistoryItem, Snippet, ToolId, WorkspaceTab } from '@/types/tool'
import { loadJson, saveJson } from '@/utils/storage'

const STORAGE_KEY = 'devtoolbox:workspace'

const TOOLS_WITHOUT_TABS: ToolId[] = ['dashboard', 'english-vocab']

interface WorkspaceState {
  activeTool: ToolId
  history: HistoryItem[]
  snippets: Snippet[]
  tabs: WorkspaceTab[]
  activeTabId: string
}

function id(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`
}

const initialState = loadJson<WorkspaceState>(STORAGE_KEY, {
  activeTool: 'dashboard',
  history: [],
  snippets: [],
  tabs: [],
  activeTabId: '',
})

export const useWorkspaceStore = defineStore('workspace', {
  state: (): WorkspaceState => ({ ...initialState }),
  getters: {
    activeTab: (state) => state.tabs.find((tab) => tab.id === state.activeTabId),
  },
  actions: {
    persist() {
      saveJson(STORAGE_KEY, {
        activeTool: this.activeTool,
        history: this.history,
        snippets: this.snippets,
        tabs: this.tabs,
        activeTabId: this.activeTabId,
      })
    },
    setTool(toolId: ToolId) {
      this.activeTool = toolId
      if (TOOLS_WITHOUT_TABS.includes(toolId)) {
        this.activeTabId = ''
      } else {
        const matchingTab = this.tabs.find((tab) => tab.toolId === toolId)
        if (matchingTab) {
          this.activeTabId = matchingTab.id
        } else {
          this.addTab(toolId)
        }
      }
      this.persist()
    },
    addTab(toolId: ToolId) {
      if (TOOLS_WITHOUT_TABS.includes(toolId)) {
        this.setTool(toolId)
        return
      }
      const tab: WorkspaceTab = {
        id: id('tab'),
        title: toolId.toUpperCase(),
        toolId,
        input: '',
        updatedAt: new Date().toISOString(),
      }
      this.tabs.push(tab)
      this.activeTabId = tab.id
      this.activeTool = toolId
      this.persist()
    },
    updateActiveInput(input: string) {
      if (!this.activeTab) return
      this.activeTab.input = input
      this.activeTab.updatedAt = new Date().toISOString()
      this.persist()
    },
    closeTab(tabId: string) {
      const index = this.tabs.findIndex((tab) => tab.id === tabId)
      this.tabs = this.tabs.filter((tab) => tab.id !== tabId)
      
      if (this.tabs.length === 0) {
        this.activeTabId = ''
        this.activeTool = 'dashboard'
      } else if (this.activeTabId === tabId) {
        this.activeTabId = this.tabs[Math.max(0, index - 1)].id
        this.activeTool = this.activeTab?.toolId ?? 'dashboard'
      }
      this.persist()
    },
    clearTabs() {
      this.tabs = []
      this.activeTabId = ''
      this.activeTool = 'dashboard'
      this.persist()
    },
    addHistory(toolId: ToolId, label: string, value: string) {
      this.history = [
        { id: id('history'), toolId, label, value, createdAt: new Date().toISOString() },
        ...this.history,
      ].slice(0, 30)
      this.persist()
    },
    clearHistory() {
      this.history = []
      this.persist()
    },
    deleteHistoryItem(id: string) {
      this.history = this.history.filter((item) => item.id !== id)
      this.persist()
    },
    saveSnippet(name: string, toolId: ToolId, value: string) {
      this.snippets.unshift({ id: id('snippet'), name, toolId, value, createdAt: new Date().toISOString() })
      this.persist()
    },
    clearSnippets() {
      this.snippets = []
      this.persist()
    },
    deleteSnippet(id: string) {
      this.snippets = this.snippets.filter((snippet) => snippet.id !== id)
      this.persist()
    },
  },
})
