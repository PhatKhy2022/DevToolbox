<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { 
  Code2, 
  FileJson, 
  FileSpreadsheet, 
  Fingerprint, 
  KeyRound, 
  Type, 
  Clock,
  Play,
  BookOpen,
  ArrowRight,
} from '@lucide/vue'
import { useVocabAuthStore } from '@/stores/vocabAuth'
import { useVocabularyStore } from '@/stores/vocabulary'
import { useWorkspaceStore } from '@/stores/workspace'
import type { ToolId } from '@/types/tool'
import type { VocabCard } from '@/types/vocabulary'

const workspace = useWorkspaceStore()
const auth = useVocabAuthStore()
const vocabulary = useVocabularyStore()

const tools = [
  { id: 'json', name: 'JSON Formatter', description: 'Pretty print, minify, and validate JSON data.', icon: FileJson, color: 'text-amber-500' },
  { id: 'csv-json', name: 'CSV JSON', description: 'Convert CSV/Excel to JSON and vice-versa.', icon: FileSpreadsheet, color: 'text-emerald-500' },
  { id: 'yaml-json', name: 'YAML JSON', description: 'Convert between YAML and JSON formats.', icon: Code2, color: 'text-indigo-500' },
  { id: 'jwt', name: 'JWT Decoder', description: 'Decode and inspect JSON Web Tokens.', icon: KeyRound, color: 'text-purple-500' },
  { id: 'uuid', name: 'UUID Generator', description: 'Generate secure random UUID v4 strings.', icon: Fingerprint, color: 'text-rose-500' },
  { id: 'base64', name: 'Base64 Tool', description: 'Encode or decode text and files.', icon: Type, color: 'text-blue-500' },
  { id: 'timestamp', name: 'Timestamp Converter', description: 'Convert between Unix time and dates.', icon: Clock, color: 'text-cyan-500' },
  { id: 'js-playground', name: 'JS Playground', description: 'Run JavaScript code snippets and see console output.', icon: Play, color: 'text-indigo-600' },
  { id: 'english-vocab', name: 'English Vocabulary', description: 'Create flashcard sets, log in, and study like Quizlet.', icon: BookOpen, color: 'text-orange-500' },
] as const

interface RecentVocabularyItem extends VocabCard {
  deckId: string
  deckTitle: string
}

const recentVocabulary = computed<RecentVocabularyItem[]>(() =>
  vocabulary.decks
    .flatMap((deck) =>
      deck.cards.map((card) => ({
        ...card,
        deckId: deck.id,
        deckTitle: deck.title,
      })),
    )
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10),
)

onMounted(() => {
  if (auth.isLoggedIn) {
    vocabulary.syncForUser()
  }
})

function selectTool(id: ToolId) {
  workspace.setTool(id)
}

function openVocabulary() {
  workspace.setTool('english-vocab')
}
</script>

<template>
  <div class="mx-auto max-w-4xl py-8">
    <div class="mb-8 text-center">
      <h2 class="text-3xl font-bold text-slate-900 dark:text-white">Developer Toolbox</h2>
      <p class="mt-2 text-slate-500 dark:text-slate-400">All-in-one productivity tools for developers.</p>
    </div>

    <section class="mb-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div class="flex flex-col gap-3 border-b border-slate-200 p-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex items-center gap-3">
          <div class="flex size-10 items-center justify-center rounded-lg bg-orange-50 text-orange-500 dark:bg-orange-500/10 dark:text-orange-300">
            <BookOpen class="size-5" />
          </div>
          <div>
            <h3 class="font-semibold text-slate-900 dark:text-white">Recent Vocabulary</h3>
            <p class="text-sm text-slate-500 dark:text-slate-400">Your 10 newest vocabulary cards.</p>
          </div>
        </div>
        <button
          class="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-orange-300 hover:text-orange-600 dark:border-slate-700 dark:text-slate-200 dark:hover:border-orange-400 dark:hover:text-orange-300"
          @click="openVocabulary"
        >
          <span>Open Vocabulary</span>
          <ArrowRight class="size-4" />
        </button>
      </div>

      <div v-if="!auth.isLoggedIn" class="p-5">
        <div class="flex flex-col gap-3 rounded-lg bg-slate-50 p-4 dark:bg-slate-800/70 sm:flex-row sm:items-center sm:justify-between">
          <p class="text-sm text-slate-600 dark:text-slate-300">
            Log in to English Vocabulary to see your recent words here.
          </p>
          <button
            class="inline-flex items-center justify-center gap-2 rounded-lg bg-orange-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-orange-600"
            @click="openVocabulary"
          >
            <BookOpen class="size-4" />
            <span>Start</span>
          </button>
        </div>
      </div>

      <div v-else-if="recentVocabulary.length === 0" class="p-5">
        <div class="rounded-lg border border-dashed border-slate-300 p-5 text-center dark:border-slate-700">
          <p class="font-medium text-slate-900 dark:text-white">No vocabulary cards yet</p>
          <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Add terms in English Vocabulary and the newest cards will appear here.
          </p>
        </div>
      </div>

      <ul v-else class="divide-y divide-slate-100 dark:divide-slate-800">
        <li
          v-for="card in recentVocabulary"
          :key="`${card.deckId}-${card.id}`"
          class="p-5"
        >
          <div class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div class="min-w-0">
              <div class="flex flex-wrap items-center gap-2">
                <p class="font-semibold text-slate-900 dark:text-white">{{ card.term }}</p>
                <span class="rounded-md bg-orange-50 px-2 py-1 text-xs font-medium text-orange-700 dark:bg-orange-500/10 dark:text-orange-300">
                  {{ card.deckTitle }}
                </span>
              </div>
              <p class="mt-1 text-sm text-slate-600 dark:text-slate-300">{{ card.definition }}</p>
              <p v-if="card.example" class="mt-2 text-sm italic text-slate-500 dark:text-slate-400">
                {{ card.example }}
              </p>
            </div>
          </div>
        </li>
      </ul>
    </section>

    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <button
        v-for="tool in tools"
        :key="tool.id"
        class="group flex flex-col rounded-xl border border-slate-200 bg-white p-5 text-left transition-all hover:border-cyan-500 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-cyan-400"
        @click="selectTool(tool.id)"
      >
        <div :class="[tool.color, 'mb-4 flex size-10 items-center justify-center rounded-lg bg-slate-50 dark:bg-slate-800']">
          <component :is="tool.icon" class="size-6" />
        </div>
        <h3 class="font-semibold text-slate-900 dark:text-white">{{ tool.name }}</h3>
        <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">{{ tool.description }}</p>
      </button>
    </div>
  </div>
</template>
