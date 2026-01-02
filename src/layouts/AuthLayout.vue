<template>
    <div class="min-h-screen bg-background">
        <Header />

        <div class="flex">
            <Sidebar :is-collapsed="isSidebarCollapsed" @toggle="toggleSidebar" />

            <main class="flex-1 transition-all duration-300" :class="isSidebarCollapsed ? 'ml-16' : 'ml-64'">
                <div class="container mx-auto px-4 py-6">
                    <slot />
                </div>
            </main>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Header from '@/components/common/Header.vue';
import Sidebar from '@/components/common/Sidebar.vue';

const isSidebarCollapsed = ref(false);

const toggleSidebar = () => {
    isSidebarCollapsed.value = !isSidebarCollapsed.value;
};
</script>