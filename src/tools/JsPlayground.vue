<script setup lang="ts">
import { ref, watch } from 'vue'
import { Play, Trash2 } from '@lucide/vue'
import ToolEditor from '@/components/ToolEditor.vue'
import { useWorkspaceStore } from '@/stores/workspace'

const workspace = useWorkspaceStore()
const input = ref(workspace.activeTab?.input ?? '// Write your JavaScript here\nconsole.log("Hello World!");\n\nconst data = { name: "DevToolbox", version: "1.0" };\nconsole.log("Object:", data);')
const output = ref('')

watch(input, (value) => workspace.updateActiveInput(value))
watch(() => workspace.activeTabId, () => (input.value = workspace.activeTab?.input ?? ''))

function runCode() {
  const logs: string[] = []
  
  const customConsole = {
    log: (...args: any[]) => {
      logs.push(args.map(a => formatArg(a)).join(' '))
    },
    error: (...args: any[]) => {
      logs.push(`🔴 Error: ${args.map(a => formatArg(a)).join(' ')}`)
    },
    warn: (...args: any[]) => {
      logs.push(`🟡 Warning: ${args.map(a => formatArg(a)).join(' ')}`)
    },
    clear: () => {
      logs.length = 0
    }
  }

  function formatArg(arg: any): string {
    if (arg === null) return 'null'
    if (arg === undefined) return 'undefined'
    if (typeof arg === 'object') {
      try {
        return JSON.stringify(arg, null, 2)
      } catch {
        return String(arg)
      }
    }
    return String(arg)
  }

  try {
    // eslint-disable-next-line no-new-func
    const fn = new Function('console', input.value)
    fn(customConsole)
    output.value = logs.join('\n') || '(No console output)'
    workspace.addHistory('js-playground', 'Executed JS', input.value)
  } catch (err: any) {
    output.value = `❌ Execution Error:\n${err.stack || err.message}`
  }
}

function clearOutput() {
  output.value = ''
}
</script>

<template>
  <div class="flex h-full flex-col gap-3">
    <div class="flex flex-wrap items-center gap-2">
      <button class="primary-button" @click="runCode">
        <Play class="mr-2 size-4" />
        Run Code
      </button>
      <button class="secondary-button" @click="clearOutput">
        <Trash2 class="mr-2 size-4" />
        Clear Console
      </button>
    </div>
    <div class="grid min-h-0 flex-1 gap-3 lg:grid-cols-2">
      <ToolEditor
        v-model="input"
        title="JavaScript Editor"
        language="javascript"
        placeholder="console.log('Hello');"
        filename="playground.js"
        @save="workspace.saveSnippet('JS Playground', 'js-playground', $event)"
      />
      <ToolEditor
        v-model="output"
        title="Console Output"
        language="bash"
        readonly
        placeholder="Output will appear here..."
        filename="console.log"
      />
    </div>
  </div>
</template>
