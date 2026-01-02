<script setup lang="ts">
import { Field } from 'vee-validate';
import { computed, useAttrs } from 'vue';
import { Label } from '@/components/ui/label';

interface Props {
    name: string;
    label?: string;
    hideError?: boolean;
}

const props = defineProps<Props>();
const attrs = useAttrs();

const errorMessageClass = computed(() => 'text-sm font-medium text-destructive');
</script>

<template>
    <Field v-slot="{ field, errorMessage }" :name="name">
        <div class="space-y-2">
            <Label v-if="label" :for="name">{{ label }}</Label>
            <slot :field="field" :errorMessage="errorMessage" />
            <p v-if="errorMessage && !hideError" :class="errorMessageClass">
                {{ errorMessage }}
            </p>
        </div>
    </Field>
</template>
