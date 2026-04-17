<template>
    <GuestLayout>
        <div class="flex min-h-[calc(100vh-12rem)] items-center justify-center px-4">
            <div class="text-center">

                <!-- BIG Animated 404 -->
                <h1 class="font-extrabold text-gray-800 animate-bounce 
                           text-[120px] sm:text-[160px] md:text-[220px] lg:text-[280px] leading-none">
                    404
                </h1>

                <!-- Message -->
                <p class="mt-6 text-xl sm:text-2xl md:text-3xl font-semibold text-gray-600">
                    Oops! Page not found
                </p>

                <!-- Sub message -->
                <p class="mt-3 text-base sm:text-lg text-gray-400">
                    The page you are looking for doesn't exist.
                </p>

                <!-- Button -->
                <Button @click="$router.push('/')" class="mt-8 px-6 py-3 text-lg hover:scale-105 transition">
                    Go Home
                </Button>

            </div>
        </div>
    </GuestLayout>
</template>

<script setup lang="ts">
import GuestLayout from '@/layouts/GuestLayout.vue';
import { Button } from '@/components/ui/button'
</script>