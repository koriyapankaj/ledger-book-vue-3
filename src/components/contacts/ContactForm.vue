<template>
    <form @submit="onSubmit" class="space-y-4">
        <FormField name="name" v-slot="{ field, errorMessage }">
            <Label for="name" :class="{ 'text-destructive': errorMessage }">Name <span
                    class="text-red-500">*</span></Label>
            <Input id="name" :model-value="field.value" @update:model-value="field.onChange" placeholder="e.g., John Doe"
                :class="{ 'border-destructive': errorMessage }" />
        </FormField>

        <div class="grid gap-4 md:grid-cols-2">
            <FormField name="email" v-slot="{ field, errorMessage }">
                <Label for="email" :class="{ 'text-destructive': errorMessage }">Email</Label>
                <Input id="email" :model-value="field.value" @update:model-value="field.onChange" type="email"
                    placeholder="john@example.com" :class="{ 'border-destructive': errorMessage }" />
            </FormField>

            <FormField name="phone" v-slot="{ field, errorMessage }">
                <Label for="phone" :class="{ 'text-destructive': errorMessage }">Phone</Label>
                <Input id="phone" :model-value="field.value" @update:model-value="field.onChange" type="tel"
                    placeholder="+91 98765 43210" :class="{ 'border-destructive': errorMessage }" />
            </FormField>
        </div>

        <FormField name="notes" v-slot="{ field, errorMessage }">
            <Label for="notes" :class="{ 'text-destructive': errorMessage }">Notes</Label>
            <Textarea id="notes" :model-value="field.value" @update:model-value="field.onChange"
                placeholder="Additional information about this contact" rows="3"
                :class="{ 'border-destructive': errorMessage }" />
        </FormField>

        <FormField v-if="contact" name="is_active" v-slot="{ field }">
            <div class="flex items-center space-x-2">
                <Checkbox id="is_active" :model-value="field.value === true"
                    @update:model-value="(value) => field.onChange(value === true)" />
                <Label for="is_active">Active</Label>
            </div>
        </FormField>

        <div class="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" @click="$emit('cancel')">
                Cancel
            </Button>
            <Button type="submit" :disabled="submitting">
                <Loader2 v-if="submitting" class="mr-2 h-4 w-4 animate-spin" />
                {{ contact ? 'Update' : 'Create' }} Contact
            </Button>
        </div>
    </form>
</template>

<script setup lang="ts">
import { watch, ref } from 'vue';
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/yup';
import * as yup from 'yup';
import { Loader2 } from 'lucide-vue-next';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { FormField } from '@/components/ui/form';
import type { Contact } from '@/services/contact.service';

const props = defineProps<{
    contact?: Contact | null;
}>();

const emit = defineEmits<{
    submit: [data: any];
    cancel: [];
}>();

const submitting = ref(false);

const formSchema = toTypedSchema(yup.object({
    name: yup.string().required('Contact name is required').max(255, 'Name must be 255 characters or less'),
    email: yup.string().email('Please enter a valid email address').max(255, 'Email must be 255 characters or less').nullable().optional(),
    phone: yup.string().max(20, 'Phone must be 20 characters or less').nullable().optional(),
    notes: yup.string().max(1000, 'Notes must be 1000 characters or less').nullable().optional(),
    is_active: yup.boolean().default(true),
}));

const defaultValues = {
    name: '',
    email: '',
    phone: '',
    notes: '',
    is_active: true,
};

const { handleSubmit, resetForm } = useForm({
    validationSchema: formSchema,
    initialValues: defaultValues,
});

watch(
    () => props.contact,
    (contact) => {
        if (contact) {
            resetForm({
                values: {
                    name: contact.name,
                    email: contact.email || '',
                    phone: contact.phone || '',
                    notes: contact.notes || '',
                    is_active: contact.is_active,
                },
            });
            return;
        }

        resetForm({ values: defaultValues });
    },
    { immediate: true }
);

const onSubmit = handleSubmit(async (formValues) => {
    if (submitting.value) return;

    submitting.value = true;
    try {
        const data: any = {
            name: formValues.name,
            email: formValues.email || null,
            phone: formValues.phone || null,
            notes: formValues.notes || null,
        };

        if (props.contact) {
            data.is_active = formValues.is_active;
        }

        emit('submit', data);
    } finally {
        submitting.value = false;
    }
});
</script>
