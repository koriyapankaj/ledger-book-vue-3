<template>
    <div class="min-h-screen bg-background">
        <header class="border-b">
            <div class="container mx-auto px-4 py-4">
                <div class="flex items-center justify-between">
                    <router-link to="/" class="flex items-center space-x-2">
                        <Wallet class="h-6 w-6 text-primary" />
                        <span class="text-xl font-bold">Ledger Book</span>
                    </router-link>

                    <Button variant="ghost" size="icon" @click="themeStore.toggleTheme()">
                        <Sun v-if="themeStore.theme === 'dark'" class="h-5 w-5" />
                        <Moon v-else class="h-5 w-5" />
                    </Button>
                </div>
            </div>
        </header>

        <main class="container mx-auto px-4 py-8">
            <slot />
        </main>

        <footer class="border-t mt-auto">
            <div class="container mx-auto px-4 py-6">
                <p class="text-center text-sm text-muted-foreground">
                    © 2025 Ledger Book. All rights reserved.
                </p>
            </div>
        </footer>
    </div>
</template>

<script setup lang="ts">
import { Wallet, Sun, Moon } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import { useThemeStore } from '@/stores/theme';

const themeStore = useThemeStore();
</script>