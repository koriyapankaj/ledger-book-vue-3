<template>
  <form @submit="onSubmit" class="flex flex-col h-full">
    <div class="space-y-4 px-1">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField name="name" v-slot="{ field, errorMessage }">
          <Label for="name" :class="{ 'text-destructive': errorMessage }">Account Name <span class="text-red-500">*</span></Label>
          <Input
            id="name"
            :model-value="field.value"
            @update:model-value="field.onChange"
            placeholder="e.g., HDFC Savings"
            :class="{ 'border-destructive': errorMessage }"
          />
        </FormField>

        <FormField name="type" v-slot="{ field, errorMessage }">
          <Label for="type" :class="{ 'text-destructive': errorMessage }">Account Type <span class="text-red-500">*</span></Label>
          <Select :model-value="field.value" @update:model-value="field.onChange">
            <SelectTrigger :class="{ 'border-destructive': errorMessage }">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asset">Asset</SelectItem>
              <SelectItem value="liability">Liability</SelectItem>
            </SelectContent>
          </Select>
        </FormField>

        <FormField name="subtype" v-slot="{ field, errorMessage }">
          <Label for="subtype" :class="{ 'text-destructive': errorMessage }">Subtype <span class="text-red-500">*</span></Label>
          <Select :model-value="field.value" @update:model-value="field.onChange">
            <SelectTrigger :class="{ 'border-destructive': errorMessage }">
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
        </FormField>

        <FormField name="balance" v-slot="{ field, errorMessage }">
          <Label for="balance" :class="{ 'text-destructive': errorMessage }">Initial Balance</Label>
          <Input
            id="balance"
            :model-value="field.value"
            @update:model-value="field.onChange"
            type="number"
            step="0.01"
            placeholder="0.00"
            :class="{ 'border-destructive': errorMessage }"
          />
        </FormField>

        <FormField v-if="values.subtype === 'credit_card'" name="credit_limit" v-slot="{ field, errorMessage }">
          <Label for="credit_limit" :class="{ 'text-destructive': errorMessage }">Credit Limit</Label>
          <Input
            id="credit_limit"
            :model-value="field.value"
            @update:model-value="field.onChange"
            type="number"
            step="0.01"
            placeholder="0.00"
            :class="{ 'border-destructive': errorMessage }"
          />
        </FormField>

        <FormField name="bank_name" v-slot="{ field, errorMessage }">
          <Label for="bank_name" :class="{ 'text-destructive': errorMessage }">Bank/Institution Name</Label>
          <Input
            id="bank_name"
            :model-value="field.value"
            @update:model-value="field.onChange"
            placeholder="e.g., HDFC Bank"
            :class="{ 'border-destructive': errorMessage }"
          />
        </FormField>

        <FormField name="account_number" v-slot="{ field, errorMessage }">
          <Label for="account_number" :class="{ 'text-destructive': errorMessage }">Account Number</Label>
          <Input
            id="account_number"
            :model-value="field.value"
            @update:model-value="field.onChange"
            placeholder="****1234"
            :class="{ 'border-destructive': errorMessage }"
          />
        </FormField>

        <FormField name="color" v-slot="{ field, errorMessage }">
          <Label for="color" :class="{ 'text-destructive': errorMessage }">Color</Label>
          <div class="flex items-center gap-2">
            <div class="relative">
              <Input id="color_picker" type="color" :model-value="field.value" @update:model-value="field.onChange" class="h-10 w-12 cursor-pointer p-1" :class="{ 'border-destructive': errorMessage }" />
            </div>
            <Input
              id="color_input"
              :model-value="field.value"
              @update:model-value="field.onChange"
              placeholder="#3B82F6"
              class="flex-1 font-mono uppercase"
              maxlength="7"
              :class="{ 'border-destructive': errorMessage }"
            />
          </div>
        </FormField>
      </div>

      <FormField name="notes" v-slot="{ field, errorMessage }">
        <Label for="notes" :class="{ 'text-destructive': errorMessage }">Notes</Label>
        <Textarea
          id="notes"
          :model-value="field.value"
          @update:model-value="field.onChange"
          placeholder="Additional notes about this account"
          class="min-h-[100px] resize-y"
          :class="{ 'border-destructive': errorMessage }"
        />
      </FormField>

      <FormField name="include_in_total" v-slot="{ field }">
        <div class="flex items-center space-x-2 py-2">
          <Checkbox
            id="include_in_total"
            :model-value="field.value === true"
            @update:model-value="(value) => field.onChange(value === true)"
          />
          <Label for="include_in_total"
            class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Include in net worth calculation
          </Label>
        </div>
      </FormField>

      <FormField name="is_active" v-slot="{ field }">
        <div class="flex items-center space-x-2 pt-0 pb-0">
          <Checkbox
            id="is_active"
            :model-value="field.value === true"
            @update:model-value="(value) => field.onChange(value === true)"
          />
          <Label for="is_active"
            class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Active account
          </Label>
        </div>
      </FormField>
    </div>

    <div class="flex justify-end space-x-2 pt-4 pb-4 mt-auto">
      <Button type="button" variant="outline" @click="$emit('cancel')" :disabled="submitting">
        Cancel
      </Button>
      <Button type="submit" :disabled="submitting">
        <Loader2 v-if="submitting" class="mr-2 h-4 w-4 animate-spin" />
        {{ props.account ? 'Update' : 'Create' }} Account
      </Button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { watch, ref } from 'vue';
import { Loader2 } from 'lucide-vue-next';
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/yup';
import * as yup from 'yup';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { FormField } from '@/components/ui/form';
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

const formSchema = toTypedSchema(yup.object({
  name: yup.string().required('Account name is required'),
  type: yup.string().oneOf(['asset', 'liability']).required('Account type is required'),
  subtype: yup.string().required('Account subtype is required'),
  balance: yup.number()
    .transform((value, originalValue) => (String(originalValue).trim() === '' ? 0 : value))
    .default(0),
  credit_limit: yup.number()
    .transform((value, originalValue) => (String(originalValue).trim() === '' ? undefined : value))
    .nullable()
    .optional(),
  account_number: yup.string().nullable().optional(),
  bank_name: yup.string().nullable().optional(),
  color: yup.string()
    .matches(/^#([0-9A-Fa-f]{3}){1,2}$/, 'Invalid hex color')
    .default('#3B82F6'),
  notes: yup.string().nullable().optional(),
  include_in_total: yup.boolean().default(true),
  is_active: yup.boolean().default(true),
}));

const defaultValues: {
  name: string;
  type: 'asset' | 'liability';
  subtype: string;
  balance: number;
  credit_limit: number | undefined;
  account_number: string;
  bank_name: string;
  color: string;
  notes: string;
  include_in_total: boolean;
  is_active: boolean;
} = {
  name: '',
  type: 'asset',
  subtype: 'cash',
  balance: 0,
  credit_limit: undefined,
  account_number: '',
  bank_name: '',
  color: '#3B82F6',
  notes: '',
  include_in_total: true,
  is_active: true,
};

const { handleSubmit, resetForm, values } = useForm({
  validationSchema: formSchema,
  initialValues: defaultValues,
});

watch(
  () => props.account,
  (account) => {
    if (account) {
      resetForm({ values: {
        name: account.name,
        type: account.type as 'asset' | 'liability',
        subtype: account.subtype,
        balance: account.balance,
        credit_limit: account.credit_limit,
        account_number: account.account_number || '',
        bank_name: account.bank_name || '',
        color: account.color || '#3B82F6',
        notes: account.notes || '',
        include_in_total: account.include_in_total,
        is_active: account.is_active,
      } });
      return;
    }

    resetForm({ values: defaultValues });
  },
  { immediate: true }
);

const onSubmit = handleSubmit(async (formValues) => {
  if (submitting.value) return;

  submitting.value = true;
  // Cleanup credit_limit if not credit_card
  const payload = { ...formValues };
  if (payload.subtype !== 'credit_card') {
    payload.credit_limit = undefined;
  }

  emit('submit', payload);
  // submitting will be reset by parent or component unmount
});
</script>
