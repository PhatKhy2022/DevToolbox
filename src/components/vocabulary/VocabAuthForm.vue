<script setup lang="ts">
import { ref } from 'vue'
import { LogIn, UserPlus } from '@lucide/vue'
import { useVocabAuthStore } from '@/stores/vocabAuth'
import { useVocabularyStore } from '@/stores/vocabulary'

const auth = useVocabAuthStore()
const vocabulary = useVocabularyStore()

const mode = ref<'login' | 'register'>('login')
const username = ref('')
const password = ref('')
const confirmPassword = ref('')

async function submit() {
  auth.clearError()
  try {
    if (mode.value === 'register') {
      if (password.value !== confirmPassword.value) {
        auth.authError = 'Passwords do not match.'
        return
      }
      await auth.register(username.value, password.value)
    } else {
      await auth.login(username.value, password.value)
    }
    vocabulary.syncForUser()
    username.value = ''
    password.value = ''
    confirmPassword.value = ''
  } catch {
    // authError set in store
  }
}
</script>

<template>
  <div class="mx-auto max-w-md">
    <div class="panel rounded-xl p-6">
      <div class="mb-6 text-center">
        <h2 class="text-xl font-semibold text-slate-900 dark:text-white">English Vocabulary</h2>
        <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Sign in to create flashcard sets and study like Quizlet. Data stays in this browser.
        </p>
      </div>

      <div class="mb-4 flex rounded-lg border border-slate-200 p-1 dark:border-slate-800">
        <button
          type="button"
          class="flex-1 rounded-md py-2 text-sm font-medium transition"
          :class="mode === 'login' ? 'bg-cyan-600 text-white' : 'text-slate-600 dark:text-slate-300'"
          @click="mode = 'login'; auth.clearError()"
        >
          Log in
        </button>
        <button
          type="button"
          class="flex-1 rounded-md py-2 text-sm font-medium transition"
          :class="mode === 'register' ? 'bg-cyan-600 text-white' : 'text-slate-600 dark:text-slate-300'"
          @click="mode = 'register'; auth.clearError()"
        >
          Register
        </button>
      </div>

      <form class="space-y-3" @submit.prevent="submit">
        <label class="block text-sm">
          <span class="mb-1 block text-slate-600 dark:text-slate-400">Username</span>
          <input
            v-model="username"
            class="h-10 w-full rounded-md border border-slate-200 bg-white px-3 outline-none focus:border-cyan-500 dark:border-slate-800 dark:bg-slate-900"
            autocomplete="username"
            required
            minlength="2"
          />
        </label>

        <label class="block text-sm">
          <span class="mb-1 block text-slate-600 dark:text-slate-400">Password</span>
          <input
            v-model="password"
            type="password"
            class="h-10 w-full rounded-md border border-slate-200 bg-white px-3 outline-none focus:border-cyan-500 dark:border-slate-800 dark:bg-slate-900"
            autocomplete="current-password"
            required
            minlength="6"
          />
        </label>

        <label v-if="mode === 'register'" class="block text-sm">
          <span class="mb-1 block text-slate-600 dark:text-slate-400">Confirm password</span>
          <input
            v-model="confirmPassword"
            type="password"
            class="h-10 w-full rounded-md border border-slate-200 bg-white px-3 outline-none focus:border-cyan-500 dark:border-slate-800 dark:bg-slate-900"
            autocomplete="new-password"
            required
            minlength="6"
          />
        </label>

        <p v-if="auth.authError" class="text-sm text-rose-600 dark:text-rose-400">{{ auth.authError }}</p>

        <button type="submit" class="primary-button w-full" :disabled="auth.authLoading">
          <LogIn v-if="mode === 'login'" class="size-4" />
          <UserPlus v-else class="size-4" />
          {{ auth.authLoading ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Create account' }}
        </button>
      </form>
    </div>
  </div>
</template>
