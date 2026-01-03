<template>
    <form @submit.prevent="handleSubmit" class="space-y-4">
        <div class="space-y-2">
            <Label for="name">Name *</Label>
            <Input id="name" v-model="form.name" placeholder="Contact name" required />
        </div>

        <div class="space-y-2">
            <Label for="email">Email</Label>
            <Input id="email" v-model="form.email" type="email" placeholder="email@example.com" />
        </div>

        <div class="space-y-2">
            <Label for="phone">Phone</Label>
            <Input id="phone" v-model="form.phone" type="tel" placeholder="+91 98765 43210" />
        </div>

        <div class="space-y-2">
            <Label for="notes">Notes</Label>
            <Textarea id="notes" v-model="form.notes" placeholder="Additional information" rows="2" />
        </div>

        <div class="flex justify-end space-x-2">
            <Button type="button" variant="outline" @click="$emit('cancel')">
                Cancel
            </Button>
            <Button type="submit">
                Add Contact
            </Button>
        </div>
    </form>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

const emit = defineEmits<{
    submit: [data: any];
    cancel: [];
}>();

const form = reactive({
    name: '',
    email: '',
    phone: '',
    notes: '',
});

const handleSubmit = () => {
    emit('submit', { ...form });
};
</script>