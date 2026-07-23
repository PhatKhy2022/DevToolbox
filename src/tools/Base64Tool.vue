<script setup lang="ts">
import { ref, watch } from 'vue'
import EditorSplitView from '@/components/EditorSplitView.vue'
import FileDropzone from '@/components/FileDropzone.vue'
import ToolEditor from '@/components/ToolEditor.vue'
import { useWorkspaceStore } from '@/stores/workspace'
import { readFileAsArrayBuffer } from '@/utils/browser'
import { base64ToBytes, bytesToBase64, decodeBase64, encodeBase64 } from '@/utils/base64'
import { downloadBytes } from '@/utils/browser'

const workspace = useWorkspaceStore()
const input = ref(workspace.activeTab?.input ?? '')
const output = ref('')
const message = ref('Encode or decode Base64')

watch(input, (value) => workspace.updateActiveInput(value))
watch(
  () => workspace.activeTab?.input,
  (value) => {
    if (value !== undefined && value !== input.value) input.value = value
  },
)

async function handleFiles(files: FileList) {
  const file = files[0]
  if (!file) return
  const bytes = new Uint8Array(await readFileAsArrayBuffer(file))
  output.value = bytesToBase64(bytes)
  message.value = `Encoded ${file.name}`
}

function encode() {
  output.value = encodeBase64(input.value)
  message.value = 'Text encoded'
  workspace.addHistory('base64', 'Base64 encoded', input.value)
}

function decode() {
  try {
    output.value = decodeBase64(input.value)
    message.value = 'Text decoded'
    workspace.addHistory('base64', 'Base64 decoded', input.value)
  } catch {
    message.value = 'Invalid Base64 input'
  }
}

function downloadDecoded() {
  downloadBytes('decoded.bin', base64ToBytes(output.value || input.value))
}
</script>

<template>
  <div class="flex min-h-0 flex-1 flex-col gap-3">
    <div class="grid gap-3 lg:grid-cols-[1fr_auto]">
      <FileDropzone @files="handleFiles" />
      <div class="flex flex-wrap content-start gap-2">
        <button class="primary-button" @click="encode">Encode</button>
        <button class="secondary-button" @click="decode">Decode</button>
        <button class="secondary-button" @click="downloadDecoded">Download decoded</button>
        <span class="w-full text-sm text-slate-500 dark:text-slate-400">{{ message }}</span>
      </div>
    </div>
    <EditorSplitView>
      <template #first>
        <ToolEditor v-model="input" title="Input" language="text/base64" placeholder="Paste text or Base64" filename="base64-input.txt" @save="workspace.saveSnippet('Base64 input', 'base64', $event)" />
      </template>
      <template #second>
        <ToolEditor v-model="output" title="Output" language="text/base64" readonly filename="base64-output.txt" @save="workspace.saveSnippet('Base64 output', 'base64', $event)" />
      </template>
    </EditorSplitView>
  </div>
</template>
