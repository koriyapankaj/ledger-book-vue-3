<!-- src/components/accounts/AccountForm.vue -->
<template>
    <form @submit.prevent="handleSubmit" class="space-y-4">
        <div class="grid gap-4 md:grid-cols-2">
            <div class="space-y-2">
                <Label for="name">Account Name *</Label>
                <Input id="name" v-model="form.name" placeholder="e.g., HDFC Savings" required />
            </div>

            <div class="space-y-2">
                <Label for="type">Account Type *</Label>
                <Select v-model="form.type" required>
                    <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="asset">Asset</SelectItem>
                        <SelectItem value="liability">Liability</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div class="space-y-2">
                <Label for="subtype">Subtype *</Label>
                <Select v-model="form.subtype" required>
                    <SelectTrigger>
                        <SelectValue placeholder="Select subtype" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="bank_account">Bank Account</SelectItem>
                        <SelectItem value="digital_wallet">Digital Wallet</SelectItem>
                        <SelectItem value="credit_card">Credit Card</SelectItem>
                        <SelectItem value="loan">Loan</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div class="space-y-2">
                <Label for="balance">Initial Balance</Label>
                <Input id="balance" v-model.number="form.balance" type="number" step="0.01" placeholder="0.00" />
            </div>

            <div v-if="form.subtype === 'credit_card'" class="space-y-2">
                <Label for="credit_limit">Credit Limit</Label>
                <Input id="credit_limit" v-model.number="form.credit_limit" type="number" step="0.01"
                    placeholder="0.00" />
            </div>

            <div class="space-y-2">
                <Label for="bank_name">Bank/Institution Name</Label>
                <Input id="bank_name" v-model="form.bank_name" placeholder="e.g., HDFC Bank" />
            </div>

            <div class="space-y-2">
                <Label for="account_number">Account Number</Label>
                <Input id="account_number" v-model="form.account_number" placeholder="****1234" />
            </div>

            <div class="space-y-2">
                <Label for="color">Color</Label>
                <div class="flex space-x-2">
                    <Input id="color" v-model="form.color" type="color" class="w-16 h-10" />
                    <Input v-model="form.color" placeholder="#3B82F6" class="flex-1" />
                </div>
            </div>
        </div>

        <div class="space-y-2">
            <Label for="notes">Notes</Label>
            <Textarea id="notes" v-model="form.notes" placeholder="Additional notes about this account" rows="3" />
        </div>

        <div class="flex items-center space-x-2">
            <Checkbox id="include_in_total" v-model:checked="form.include_in_total" />
            <Label for="include_in_total">Include in net worth calculation</Label>
        </div>

        <div class="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" @click="$emit('cancel')">
                Cancel
            </Button>
            <Button type="submit" :disabled="submitting">
                <Loader2 v-if="submitting" class="mr-2 h-4 w-4 animate-spin" />
                {{ account ? 'Update' : 'Create' }} Account
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { Account } from '@/services/account.service';

const props = defineProps<{
    account?: Account | null;
}>();

const emit = defineEmits<{
    submit: [data: any];
    cancel: [];
}>();

const submitting = ref(false);

const form = reactive({
    name: '',
    type: 'asset' as 'asset' | 'liability',
    subtype: 'cash' as any,
    balance: 0,
    credit_limit: undefined as number | undefined,
    account_number: '',
    bank_name: '',
    color: '#3B82F6',
    icon: 'wallet',
    include_in_total: true,
    notes: '',
});

// Initialize form with account data if editing
watch(
    () => props.account,
    (account) => {
        if (account) {
            Object.assign(form, {
                name: account.name,
                type: account.type,
                subtype: account.subtype,
                balance: account.balance,
                credit_limit: account.credit_limit,
                account_number: account.account_number || '',
                bank_name: account.bank_name || '',
                color: account.color,
                icon: account.icon,
                include_in_total: account.include_in_total,
                notes: account.notes || '',
            });
        }
    },
    { immediate: true }
);

const handleSubmit = async () => {
    submitting.value = true;
    try {
        emit('submit', { ...form });
    } finally {
        submitting.value = false;
    }
};
</script>