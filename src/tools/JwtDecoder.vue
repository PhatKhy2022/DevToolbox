<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import EditorSplitView from '@/components/EditorSplitView.vue'
import ToolEditor from '@/components/ToolEditor.vue'
import { useWorkspaceStore } from '@/stores/workspace'
import { decodeJwt } from '@/utils/jwt'

const workspace = useWorkspaceStore()
const token = ref(workspace.activeTab?.input ?? '')
const output = ref('')
const message = ref('Decode JWT payload')

watch(token, (value) => workspace.updateActiveInput(value))
watch(
  () => workspace.activeTab?.input,
  (value) => {
    if (value !== undefined && value !== token.value) token.value = value
  },
)

const expiry = computed(() => {
  try {
    return decodeJwt(token.value)
  } catch {
    return undefined
  }
})

function decode() {
  try {
    const decoded = decodeJwt(token.value)
    output.value = JSON.stringify(decoded.payload, null, 2)
    message.value = decoded.expiresAt ? `Expires: ${decoded.expiresAt}` : 'No exp claim found'
    workspace.addHistory('jwt', 'Decoded JWT', token.value)
  } catch (error) {
    message.value = error instanceof Error ? error.message : 'Invalid JWT'
  }
}
</script>

<template>
  <div class="flex min-h-0 flex-1 flex-col gap-3">
    <div class="flex flex-wrap items-center gap-2">
      <button class="primary-button" @click="decode">Decode payload</button>
      <span v-if="expiry?.expiresAt" class="rounded px-2 py-1 text-xs" :class="expiry.isExpired ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-200' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200'">
        {{ expiry.isExpired ? 'Expired' : 'Active' }}
      </span>
      <span class="text-sm text-slate-500 dark:text-slate-400">{{ message }}</span>
    </div>
    <EditorSplitView>
      <template #first>
        <ToolEditor v-model="token" title="JWT" language="token" placeholder="Paste JWT" filename="token.txt" @save="workspace.saveSnippet('JWT token', 'jwt', $event)" />
      </template>
      <template #second>
        <ToolEditor v-model="output" title="Payload" language="json" readonly filename="jwt-payload.json" @save="workspace.saveSnippet('JWT payload', 'jwt', $event)" />
      </template>
    </EditorSplitView>
  </div>
</template>
