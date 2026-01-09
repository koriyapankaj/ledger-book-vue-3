<template>
  <div class="min-h-screen bg-background">
    <Header />

    <div class="flex">
      <Sidebar />

      <main class="flex-1 transition-all duration-300 ml-0" :class="sidebarStore.isCollapsed ? 'md:ml-16' : 'md:ml-64'">
        <div class="container mx-auto px-4 py-6">
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import Header from '@/components/common/Header.vue';
import Sidebar from '@/components/common/Sidebar.vue';
import { useSidebarStore } from '@/stores/sidebar';

const sidebarStore = useSidebarStore();

onMounted(() => {
  sidebarStore.initialize();
});
</script>
