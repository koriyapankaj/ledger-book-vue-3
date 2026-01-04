<template>
  <RouterView />
  <Toaster />
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useAuthStore } from './stores/auth';
import { useThemeStore } from './stores/theme';
import { Toaster } from '@/components/ui/toast';
import { useSidebarStore } from './stores/sidebar';

const authStore = useAuthStore();
const themeStore = useThemeStore();
const sidebarStore = useSidebarStore();

onMounted(() => {
  authStore.initialize();
  themeStore.initialize();
  sidebarStore.initialize();
});
</script>