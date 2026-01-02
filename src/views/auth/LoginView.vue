<template>
    <GuestLayout>
        <div class="flex min-h-[calc(100vh-12rem)] items-center justify-center">
            <Card class="w-full max-w-md">
                <CardHeader class="space-y-1">
                    <CardTitle class="text-2xl font-bold">Welcome back</CardTitle>
                    <CardDescription>
                        Enter your credentials to access your account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form @submit.prevent="handleLogin" class="space-y-4">
                        <div class="space-y-2">
                            <Label for="email">Email</Label>
                            <Input id="email" v-model="form.email" type="email" placeholder="john@example.com"
                                required />
                        </div>

                        <div class="space-y-2">
                            <Label for="password">Password</Label>
                            <Input id="password" v-model="form.password" type="password" required />
                        </div>

                        <Alert v-if="authStore.error" variant="destructive">
                            <AlertCircle class="h-4 w-4" />
                            <AlertDescription>
                                {{ authStore.error }}
                            </AlertDescription>
                        </Alert>

                        <Button type="submit" class="w-full" :disabled="authStore.loading">
                            <Loader2 v-if="authStore.loading" class="mr-2 h-4 w-4 animate-spin" />
                            {{ authStore.loading ? 'Signing in...' : 'Sign in' }}
                        </Button>
                    </form>

                    <div class="mt-4 text-center text-sm">
                        Don't have an account?
                        <router-link to="/register" class="text-primary hover:underline">
                            Sign up
                        </router-link>
                    </div>
                </CardContent>
            </Card>
        </div>
    </GuestLayout>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import { AlertCircle, Loader2 } from 'lucide-vue-next';
import GuestLayout from '@/layouts/GuestLayout.vue';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();

const form = reactive({
    email: '',
    password: '',
});

const handleLogin = async () => {
    await authStore.login(form);
};
</script>