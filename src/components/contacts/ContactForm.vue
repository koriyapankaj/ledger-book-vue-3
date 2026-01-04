<template>
    <form @submit.prevent="handleSubmit" class="space-y-4">
        <div class="space-y-2">
            <Label for="name">Name *</Label>
            <Input id="name" v-model="form.name" placeholder="e.g., John Doe" required />
        </div>

        <div class="grid gap-4 md:grid-cols-2">
            <div class="space-y-2">
                <Label for="email">Email</Label>
                <Input id="email" v-model="form.email" type="email" placeholder="john@example.com" />
            </div>

            <div class="space-y-2">
                <Label for="phone">Phone</Label>
                <Input id="phone" v-model="form.phone" type="tel" placeholder="+91 98765 43210" />
            </div>
        </div>

        <div class="space-y-2">
            <Label for="notes">Notes</Label>
            <Textarea id="notes" v-model="form.notes" placeholder="Additional information about this contact"
                rows="3" />
        </div>

        <div v-if="contact" class="flex items-center space-x-2">
            <Checkbox id="is_active" v-model:checked="form.is_active" />
            <Label for="is_active">Active</Label>
        </div>

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
import { reactive, watch, ref } from 'vue';
import { Loader2 } from 'lucide-vue-next';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import type { Contact } from '@/services/contact.service';

const props = defineProps<{
    contact?: Contact | null;
}>();

const emit = defineEmits<{
    submit: [data: any];
    cancel: [];
}>();

const submitting = ref(false);

const form = reactive({
    name: '',
    email: '',
    phone: '',
    notes: '',
    is_active: true,
});

watch(
    () => props.contact,
    (contact) => {
        if (contact) {
            Object.assign(form, {
                name: contact.name,
                email: contact.email || '',
                phone: contact.phone || '',
                notes: contact.notes || '',
                is_active: contact.is_active,
            });
        }
    },
    { immediate: true }
);

const handleSubmit = async () => {
    submitting.value = true;
    try {
        const data: any = {
            name: form.name,
            email: form.email || null,
            phone: form.phone || null,
            notes: form.notes || null,
        };

        if (props.contact) {
            data.is_active = form.is_active;
        }

        emit('submit', data);
    } finally {
        submitting.value = false;
    }
};
</script>