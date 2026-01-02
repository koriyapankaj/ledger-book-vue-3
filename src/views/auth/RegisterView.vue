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
                    <Form @submit="handleRegister" :validation-schema="registerSchema">
                        <div class="space-y-4">
                            <FormField name="name" label="Full Name">
                                <template #default="{ field, errorMessage }">
                                    <Input id="name" type="text" placeholder="John Doe" v-bind="field"
                                        :class="{ 'border-destructive': errorMessage || authStore.validationErrors.name }" />
                                    <p v-if="authStore.validationErrors.name"
                                        class="text-sm font-medium text-destructive">
                                        {{ authStore.validationErrors.name[0] }}
                                    </p>
                                </template>
                            </FormField>

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

                            <FormField name="password_confirmation" label="Confirm Password">
                                <template #default="{ field, errorMessage }">
                                    <Input id="password_confirmation" type="password" v-bind="field"
                                        :class="{ 'border-destructive': errorMessage || authStore.validationErrors.password_confirmation }" />
                                    <p v-if="authStore.validationErrors.password_confirmation"
                                        class="text-sm font-medium text-destructive">
                                        {{ authStore.validationErrors.password_confirmation[0] }}
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
                                {{ authStore.loading ? 'Creating account...' : 'Create account' }}
                            </Button>
                        </div>
                    </Form>

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
import type { RegisterData } from '@/types';

const authStore = useAuthStore();

// Validation schema
const registerSchema = yup.object({
    name: yup
        .string()
        .required('Full name is required')
        .min(2, 'Name must be at least 2 characters')
        .max(100, 'Name must not exceed 100 characters'),
    email: yup
        .string()
        .required('Email is required')
        .email('Please enter a valid email address'),
    password: yup
        .string()
        .required('Password is required')
        .min(8, 'Password must be at least 8 characters')
        .matches(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
            'Password must contain at least one uppercase letter, one lowercase letter, and one number'
        ),
    password_confirmation: yup
        .string()
        .required('Please confirm your password')
        .oneOf([yup.ref('password')], 'Passwords must match'),
});

const handleRegister = async (values: any) => {
    try {
        await authStore.register(values as RegisterData);
    } catch (error) {
        // Error is already handled in the store
        console.error('Registration failed:', error);
    }
};

onMounted(() => {
    authStore.clearErrors();
});
</script>