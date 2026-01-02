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
                    <Form @submit="handleLogin" :validation-schema="loginSchema">
                        <div class="space-y-4">
                            <FormField name="email" label="Email">
                                <template #default="{ field, errorMessage }">
                                    <Input id="email" type="email" placeholder="john@example.com" v-bind="field"
                                        :class="{ 'border-destructive': errorMessage || authStore.validationErrors.email }" />
                                    <p v-if="authStore.validationErrors.email"
                                        class="text-sm font-medium text-destructive">
                                        {{ authStore.validationErrors.email[0] }}
                                    </p>
                                </template>
                            </FormField>

                            <FormField name="password" label="Password">
                                <template #default="{ field, errorMessage }">
                                    <Input id="password" type="password" v-bind="field"
                                        :class="{ 'border-destructive': errorMessage || authStore.validationErrors.password }" />
                                    <p v-if="authStore.validationErrors.password"
                                        class="text-sm font-medium text-destructive">
                                        {{ authStore.validationErrors.password[0] }}
                                    </p>
                                </template>
                            </FormField>

                            <Alert v-if="authStore.error && !Object.keys(authStore.validationErrors).length"
                                variant="destructive">
                                <AlertCircle class="h-4 w-4" />
                                <AlertDescription>
                                    {{ authStore.error }}
                                </AlertDescription>
                            </Alert>

                            <Button type="submit" class="w-full" :disabled="authStore.loading">
                                <Loader2 v-if="authStore.loading" class="mr-2 h-4 w-4 animate-spin" />
                                {{ authStore.loading ? 'Signing in...' : 'Sign in' }}
                            </Button>
                        </div>
                    </Form>

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
import { onMounted } from 'vue';
import { AlertCircle, Loader2 } from 'lucide-vue-next';
import { Form } from 'vee-validate';
import * as yup from 'yup';
import GuestLayout from '@/layouts/GuestLayout.vue';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FormField } from '@/components/ui/form';
import { useAuthStore } from '@/stores/auth';
import type { LoginCredentials } from '@/types';

const authStore = useAuthStore();

// Validation schema
const loginSchema = yup.object({
    email: yup
        .string()
        .required('Email is required')
        .email('Please enter a valid email address'),
    password: yup
        .string()
        .required('Password is required')
        .min(6, 'Password must be at least 6 characters'),
});

const handleLogin = async (values: any) => {
    try {
        await authStore.login(values as LoginCredentials);
    } catch (error) {
        // Error is already handled in the store
        console.error('Login failed:', error);
    }
};

onMounted(() => {
    authStore.clearErrors();
});
</script>