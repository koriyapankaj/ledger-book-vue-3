<template>
  <RouterView />
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useAuthStore } from './stores/auth';
import { useThemeStore } from './stores/theme';

const authStore = useAuthStore();
const themeStore = useThemeStore();

onMounted(() => {
  authStore.initialize();
  themeStore.initialize();
});
</script>