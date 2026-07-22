<script setup lang="ts">
const version = __APP_VERSION__
const year = new Date().getFullYear()
</script>

<template>
  <footer
    class="flex h-8 shrink-0 items-center justify-center border-t border-slate-200 bg-white px-3 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400"
  >
    <span>DevToolbox v{{ version }} &middot; &copy; {{ year }} Khy Phat</span>
  </footer>
</template>
