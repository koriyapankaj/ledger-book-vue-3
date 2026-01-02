<template>
    <GuestLayout>
        <div class="flex min-h-[calc(100vh-12rem)] items-center justify-center py-8">
            <Card class="w-full max-w-md">
                <CardHeader class="space-y-1">
                    <CardTitle class="text-2xl font-bold">Create an account</CardTitle>
                    <CardDescription>
                        Enter your details to get started
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form @submit.prevent="handleRegister" class="space-y-4">
                        <div class="space-y-2">
                            <Label for="name">Full Name</Label>
                            <Input id="name" v-model="form.name" type="text" placeholder="John Doe" required />
                        </div>

                        <div class="space-y-2">
                            <Label for="email">Email</Label>
                            <Input id="email" v-model="form.email" type="email" placeholder="john@example.com"
                                required />
                        </div>

                        <div class="space-y-2">
                            <Label for="password">Password</Label>
                            <Input id="password" v-model="form.password" type="password" required />
                        </div>

                        <div class="space-y-2">
                            <Label for="password_confirmation">Confirm Password</Label>
                            <Input id="password_confirmation" v-model="form.password_confirmation" type="password"
                                required />
                        </div>

                        <Alert v-if="authStore.error" variant="destructive">
                            <AlertCircle class="h-4 w-4" />
                            <AlertDescription>
                                {{ authStore.error }}
                            </AlertDescription>
                        </Alert>

                        <Button type="submit" class="w-full" :disabled="authStore.loading">
                            <Loader2 v-if="authStore.loading" class="mr-2 h-4 w-4 animate-spin" />
                            {{ authStore.loading ? 'Creating account...' : 'Create account' }}
                        </Button>
                    </form>

                    <div class="mt-4 text-center text-sm">
                        Already have an account?
                        <router-link to="/login" class="text-primary hover:underline">
                            Sign in
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
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
});

const handleRegister = async () => {
    await authStore.register(form);
};
</script>