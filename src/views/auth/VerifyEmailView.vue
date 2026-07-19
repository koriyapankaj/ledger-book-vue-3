<template>
    <GuestLayout>
        <div class="flex min-h-[calc(100vh-12rem)] items-center justify-center">
            <Card class="w-full max-w-md">
                <CardHeader class="space-y-1">
                    <CardTitle class="text-2xl font-bold">Verify your email</CardTitle>
                    <CardDescription>
                        Enter the 6-digit code we sent to
                        <span class="font-medium text-foreground">{{ email }}</span>
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form @submit.prevent="handleVerify" class="space-y-4">
                        <div class="space-y-2">
                            <Label for="code">Verification code</Label>
                            <Input id="code" v-model="code" inputmode="numeric" autocomplete="one-time-code"
                                maxlength="6" placeholder="000000"
                                class="text-center text-2xl tracking-[0.5em] font-semibold"
                                :class="{ 'border-destructive': codeError }" />
                            <p v-if="codeError" class="text-sm font-medium text-destructive">{{ codeError }}</p>
                        </div>

                        <Alert v-if="authStore.error && !codeError" variant="destructive">
                            <AlertCircle class="h-4 w-4" />
                            <AlertDescription>{{ authStore.error }}</AlertDescription>
                        </Alert>

                        <Alert v-if="successMessage" class="border-green-500/50">
                            <CheckCircle2 class="h-4 w-4 text-green-600" />
                            <AlertDescription class="text-green-700">{{ successMessage }}</AlertDescription>
                        </Alert>

                        <Button type="submit" class="w-full" :disabled="authStore.loading || code.length !== 6">
                            <Loader2 v-if="authStore.loading" class="mr-2 h-4 w-4 animate-spin" />
                            {{ authStore.loading ? 'Verifying...' : 'Verify email' }}
                        </Button>
                    </form>

                    <div class="mt-4 text-center text-sm text-muted-foreground">
                        Didn't get the code?
                        <button type="button"
                            class="text-primary hover:underline disabled:cursor-not-allowed disabled:opacity-60 disabled:no-underline"
                            :disabled="resendCooldown > 0 || resending" @click="handleResend()">
                            {{ resendCooldown > 0 ? `Resend in ${resendCooldown}s` : (resending ? 'Sending...' : 'Resend code') }}
                        </button>
                    </div>

                    <div class="mt-4 text-center text-sm">
                        <router-link to="/login" class="text-primary hover:underline">Back to sign in</router-link>
                    </div>
                </CardContent>
            </Card>
        </div>
    </GuestLayout>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-vue-next';
import GuestLayout from '@/layouts/GuestLayout.vue';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuthStore } from '@/stores/auth';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const email = computed(() => (typeof route.query.email === 'string' ? route.query.email : ''));
const code = ref('');
const successMessage = ref('');
const resending = ref(false);
const resendCooldown = ref(0);
let cooldownTimer: ReturnType<typeof setInterval> | null = null;

const codeError = computed(() => authStore.validationErrors.code?.[0] || null);

// Keep only digits, max 6.
watch(code, (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 6);
    if (digits !== value) {
        code.value = digits;
    }
});

const startCooldown = (seconds = 60) => {
    resendCooldown.value = seconds;
    if (cooldownTimer) clearInterval(cooldownTimer);
    cooldownTimer = setInterval(() => {
        resendCooldown.value -= 1;
        if (resendCooldown.value <= 0 && cooldownTimer) {
            clearInterval(cooldownTimer);
            cooldownTimer = null;
        }
    }, 1000);
};

const handleVerify = async () => {
    if (!email.value || code.value.length !== 6) return;
    successMessage.value = '';
    try {
        await authStore.verifyEmail(email.value, code.value.trim());
    } catch {
        // Error is handled in the store.
    }
};

const handleResend = async (silent = false) => {
    if (!email.value || resending.value || resendCooldown.value > 0) return;
    resending.value = true;
    successMessage.value = '';
    authStore.clearErrors();
    try {
        const res = await authStore.resendVerificationCode(email.value);
        if (res.already_verified) {
            router.push('/login');
            return;
        }
        successMessage.value = res.message || 'A new code has been sent to your email.';
        startCooldown(60);
    } catch (err: any) {
        if (!silent) {
            const data = err.response?.data;
            authStore.error = data?.errors?.code?.[0] || data?.message || 'Could not resend the code.';
        }
    } finally {
        resending.value = false;
    }
};

onMounted(() => {
    authStore.clearErrors();
    if (!email.value) {
        router.replace('/register');
        return;
    }
    // Arriving from a blocked login: request a fresh code automatically.
    if (route.query.resend === '1') {
        handleResend(true);
    }
});

onBeforeUnmount(() => {
    if (cooldownTimer) clearInterval(cooldownTimer);
});
</script>
