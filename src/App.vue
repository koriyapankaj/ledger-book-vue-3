<template>
  <RouterView />
  <Toaster />
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useAuthStore } from './stores/auth';
import { useThemeStore } from './stores/theme';
import { Toaster } from '@/components/ui/toast';

const authStore = useAuthStore();
const themeStore = useThemeStore();

onMounted(() => {
  authStore.initialize();
  themeStore.initialize();
});
</script>