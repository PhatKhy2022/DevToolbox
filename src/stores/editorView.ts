import { defineStore } from 'pinia'

interface EditorViewState {
  fullscreenTarget: HTMLElement | null
  isFullscreen: boolean
}

export const useEditorViewStore = defineStore('editorView', {
  state: (): EditorViewState => ({
    fullscreenTarget: null,
    isFullscreen: false,
  }),
  actions: {
    register(target: HTMLElement | null) {
      this.fullscreenTarget = target
    },
    setFullscreen(value: boolean) {
      this.isFullscreen = value
    },
    async toggleFullscreen() {
      if (!this.fullscreenTarget) return
      if (document.fullscreenElement) {
        await document.exitFullscreen()
      } else {
        await this.fullscreenTarget.requestFullscreen()
      }
    },
  },
})
