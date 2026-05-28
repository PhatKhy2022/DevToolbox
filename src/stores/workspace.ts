import { defineStore } from 'pinia'
import type { HistoryItem, Snippet, ToolId, WorkspaceTab } from '@/types/tool'
import { loadJson, saveJson } from '@/utils/storage'

const STORAGE_KEY = 'devtoolbox:workspace'

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
  activeTool: 'json',
  history: [],
  snippets: [],
  tabs: [
    {
      id: id('tab'),
      title: 'JSON',
      toolId: 'json',
      input: '',
      updatedAt: new Date().toISOString(),
    },
  ],
  activeTabId: '',
})

if (!initialState.activeTabId) {
  initialState.activeTabId = initialState.tabs[0].id
}

export const useWorkspaceStore = defineStore('workspace', {
  state: (): WorkspaceState => ({ ...initialState }),
  getters: {
    activeTab: (state) => state.tabs.find((tab) => tab.id === state.activeTabId) ?? state.tabs[0],
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
      const matchingTab = this.tabs.find((tab) => tab.toolId === toolId)
      if (matchingTab) {
        this.activeTabId = matchingTab.id
      } else {
        this.addTab(toolId)
      }
      this.persist()
    },
    addTab(toolId: ToolId) {
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
      if (this.tabs.length === 1) return
      const index = this.tabs.findIndex((tab) => tab.id === tabId)
      this.tabs = this.tabs.filter((tab) => tab.id !== tabId)
      if (this.activeTabId === tabId) {
        this.activeTabId = this.tabs[Math.max(0, index - 1)].id
        this.activeTool = this.activeTab.toolId
      }
      this.persist()
    },
    addHistory(toolId: ToolId, label: string, value: string) {
      this.history = [
        { id: id('history'), toolId, label, value, createdAt: new Date().toISOString() },
        ...this.history,
      ].slice(0, 30)
      this.persist()
    },
    saveSnippet(name: string, toolId: ToolId, value: string) {
      this.snippets.unshift({ id: id('snippet'), name, toolId, value, createdAt: new Date().toISOString() })
      this.persist()
    },
  },
})
