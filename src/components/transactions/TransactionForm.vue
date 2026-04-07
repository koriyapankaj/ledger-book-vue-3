<template>
  <form @submit="onSubmit" class="space-y-6">
    <!-- Transaction Type Selection -->
    <div class="space-y-2">
      <FormField name="type" v-slot="{ field, errorMessage }">
        <Label for="type" :class="{ 'text-destructive': errorMessage }">Transaction Type *</Label>
        <Select :model-value="field.value" @update:model-value="field.onChange">
          <SelectTrigger :class="{ 'border-destructive': errorMessage }">
            <SelectValue placeholder="Select transaction type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="income">
              <div class="flex items-center">
                <ArrowUpCircle class="mr-2 h-4 w-4 text-green-600" />
                Income
              </div>
            </SelectItem>
            <SelectItem value="expense">
              <div class="flex items-center">
                <ArrowDownCircle class="mr-2 h-4 w-4 text-red-600" />
                Expense
              </div>
            </SelectItem>
            <SelectItem value="transfer">
              <div class="flex items-center">
                <ArrowRightLeft class="mr-2 h-4 w-4 text-blue-600" />
                Transfer
              </div>
            </SelectItem>
            <SelectItem value="lent">
              <div class="flex items-center">
                <HandCoins class="mr-2 h-4 w-4 text-orange-600" />
                Lent Money
              </div>
            </SelectItem>
            <SelectItem value="borrowed">
              <div class="flex items-center">
                <HandCoins class="mr-2 h-4 w-4 text-purple-600" />
                Borrowed Money
              </div>
            </SelectItem>
            <SelectItem value="repayment_in">
              <div class="flex items-center">
                <ArrowUpCircle class="mr-2 h-4 w-4 text-green-600" />
                Repayment In
              </div>
            </SelectItem>
            <SelectItem value="repayment_out">
              <div class="flex items-center">
                <ArrowDownCircle class="mr-2 h-4 w-4 text-red-600" />
                Repayment Out
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
        <p class="text-xs text-muted-foreground">{{ getTypeDescription(field.value) }}</p>
      </FormField>
    </div>

    <Separator />

    <!-- Dynamic Fields Based on Transaction Type -->
    <div class="grid gap-4 md:grid-cols-2">
      <!-- Amount -->
      <div class="space-y-2">
        <FormField name="amount" v-slot="{ field, errorMessage }">
          <Label for="amount" :class="{ 'text-destructive': errorMessage || hasInsufficientBalance }">Amount *</Label>
          <div class="relative">
            <span class="absolute left-3 top-2.5 text-muted-foreground">₹</span>
            <Input id="amount" v-bind="field" type="number" step="0.01" min="0.01" class="pl-8"
              placeholder="0.00" :class="{ 'border-destructive': errorMessage || hasInsufficientBalance }" />
          </div>
          <p v-if="hasInsufficientBalance" class="text-xs text-destructive">
            Insufficient balance. Available: ₹{{ formatNumber(selectedAccountBalance) }}
          </p>
        </FormField>
      </div>

      <!-- Transaction Date -->
      <div class="space-y-2">
        <FormField name="transaction_date" v-slot="{ field, errorMessage }">
          <Label for="transaction_date" :class="{ 'text-destructive': errorMessage }">Date *</Label>
          <Input id="transaction_date" v-bind="field" type="date" :max="today" :class="{ 'border-destructive': errorMessage }" />
        </FormField>
      </div>

      <!-- Source Account (All types) -->
      <div class="space-y-2">
        <FormField name="account_id" v-slot="{ field, errorMessage }">
          <Label for="account_id" :class="{ 'text-destructive': errorMessage }">
            {{ values.type === 'transfer' ? 'From Account' : 'Account' }} *
          </Label>
          <Select :model-value="field.value" @update:model-value="field.onChange">
            <SelectTrigger :class="{ 'border-destructive': errorMessage }">
              <SelectValue placeholder="Select account" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="account in accounts" :key="account.id" :value="account.id.toString()">
                <div class="flex items-center justify-between w-full">
                  <span>{{ account.name }}</span>
                  <span class="text-xs text-muted-foreground ml-2">
                    ₹{{ formatNumber(account.balance) }}
                  </span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </FormField>
      </div>

      <!-- Destination Account (Transfer only) -->
      <div v-if="values.type === 'transfer'" class="space-y-2">
        <FormField name="to_account_id" v-slot="{ field, errorMessage }">
          <Label for="to_account_id" :class="{ 'text-destructive': errorMessage }">To Account *</Label>
          <Select :model-value="field.value" @update:model-value="field.onChange">
            <SelectTrigger :class="{ 'border-destructive': errorMessage }">
              <SelectValue placeholder="Select destination account" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="account in filteredToAccounts" :key="account.id" :value="account.id.toString()">
                <div class="flex items-center justify-between w-full">
                  <span>{{ account.name }}</span>
                  <span class="text-xs text-muted-foreground ml-2">
                    ₹{{ formatNumber(account.balance) }}
                  </span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </FormField>
      </div>

      <!-- Category (Income/Expense only) -->
      <div v-if="showCategoryField" class="space-y-2">
        <FormField name="category_id" v-slot="{ field, errorMessage }">
          <Label for="category_id" :class="{ 'text-destructive': errorMessage }">Category *</Label>
          <Select :model-value="field.value" @update:model-value="field.onChange">
            <SelectTrigger :class="{ 'border-destructive': errorMessage }">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <div v-for="category in filteredCategories" :key="category.id">
                <!-- Parent Category -->
                <SelectItem :value="category.id.toString()" class="font-semibold">
                  {{ category.name }}
                </SelectItem>
                <!-- Child Categories -->
                <SelectItem v-for="child in category.children" :key="child.id" :value="child.id.toString()" class="pl-6">
                  {{ child.name }}
                </SelectItem>
              </div>
            </SelectContent>
          </Select>
        </FormField>
      </div>

      <!-- Contact (Debt transactions only) -->
      <div v-if="showContactField" class="space-y-2">
        <FormField name="contact_id" v-slot="{ field, errorMessage }">
          <Label for="contact_id" :class="{ 'text-destructive': errorMessage }">Contact *</Label>
          <div class="flex space-x-2">
            <Select :model-value="field.value" @update:model-value="field.onChange" class="flex-1">
              <SelectTrigger :class="{ 'border-destructive': errorMessage }">
                <SelectValue placeholder="Select contact" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="contact in contacts" :key="contact.id" :value="contact.id.toString()">
                  <div class="flex items-center justify-between w-full">
                    <span>{{ contact.name }}</span>
                    <span class="text-xs ml-2"
                      :class="contact.balance > 0 ? 'text-green-600' : contact.balance < 0 ? 'text-red-600' : 'text-muted-foreground'">
                      {{ contact.balance > 0 ? 'Owes ₹' : contact.balance < 0 ? 'You owe ₹' : '₹' }}{{
                        formatNumber(Math.abs(contact.balance)) }} </span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <Dialog v-model:open="isContactDialogOpen">
              <DialogTrigger as-child>
                <Button type="button" variant="outline" size="icon">
                  <Plus class="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Contact</DialogTitle>
                  <DialogDescription>Create a new contact for debt tracking</DialogDescription>
                </DialogHeader>
                <QuickContactForm @submit="handleContactSubmit" @cancel="isContactDialogOpen = false" />
              </DialogContent>
            </Dialog>
          </div>
        </FormField>
      </div>
    </div>

    <!-- Title and Description -->
    <div class="space-y-4">
      <div class="space-y-2">
        <FormField name="title" v-slot="{ field, errorMessage }">
          <Label for="title" :class="{ 'text-destructive': errorMessage }">Title</Label>
          <Input id="title" v-bind="field" placeholder="e.g., Monthly salary, Grocery shopping, ATM withdrawal" :class="{ 'border-destructive': errorMessage }" />
        </FormField>
      </div>

      <div class="space-y-2">
        <FormField name="description" v-slot="{ field, errorMessage }">
          <Label for="description" :class="{ 'text-destructive': errorMessage }">Description</Label>
          <Textarea id="description" v-bind="field" placeholder="Additional details about this transaction" rows="3" :class="{ 'border-destructive': errorMessage }" />
        </FormField>
      </div>

      <div class="space-y-2">
        <FormField name="reference_number" v-slot="{ field, errorMessage }">
          <Label for="reference_number" :class="{ 'text-destructive': errorMessage }">Reference Number</Label>
          <Input id="reference_number" v-bind="field" placeholder="Transaction ID, Receipt number, etc." :class="{ 'border-destructive': errorMessage }" />
        </FormField>
      </div>
    </div>

    <!-- Transaction Summary Card -->
    <Card class="bg-muted">
      <CardHeader>
        <CardTitle class="text-sm">Transaction Summary</CardTitle>
      </CardHeader>
      <CardContent class="space-y-2 text-sm">
        <div class="flex justify-between">
          <span class="text-muted-foreground">Type:</span>
          <span class="font-medium">{{ formatTransactionType(values.type) }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-muted-foreground">Amount:</span>
          <span class="font-bold text-lg">₹{{ formatNumber(values.amount || 0) }}</span>
        </div>
        <Separator />
        <div v-if="values.type === 'income'" class="text-green-600">
          <Check class="inline h-4 w-4 mr-1" />
          Your {{ getAccountName(values.account_id) }} will increase by ₹{{ formatNumber(values.amount || 0) }}
        </div>
        <div v-else-if="values.type === 'expense'" class="text-red-600">
          <AlertCircle class="inline h-4 w-4 mr-1" />
          Your {{ getAccountName(values.account_id) }} will decrease by ₹{{ formatNumber(values.amount || 0) }}
        </div>
        <div v-else-if="values.type === 'transfer'" class="text-blue-600">
          <ArrowRightLeft class="inline h-4 w-4 mr-1" />
          Transfer ₹{{ formatNumber(values.amount || 0) }} from {{ getAccountName(values.account_id) }} to {{
            getAccountName(values.to_account_id) }}
        </div>
        <div v-else-if="values.type === 'lent'" class="text-orange-600">
          <HandCoins class="inline h-4 w-4 mr-1" />
          You lent ₹{{ formatNumber(values.amount || 0) }} to {{ getContactName(values.contact_id) }}
        </div>
        <div v-else-if="values.type === 'borrowed'" class="text-purple-600">
          <HandCoins class="inline h-4 w-4 mr-1" />
          You borrowed ₹{{ formatNumber(values.amount || 0) }} from {{ getContactName(values.contact_id) }}
        </div>
        <div v-else-if="values.type === 'repayment_in'" class="text-green-600">
          <Check class="inline h-4 w-4 mr-1" />
          {{ getContactName(values.contact_id) }} paid you back ₹{{ formatNumber(values.amount || 0) }}
        </div>
        <div v-else-if="values.type === 'repayment_out'" class="text-red-600">
          <AlertCircle class="inline h-4 w-4 mr-1" />
          You paid back ₹{{ formatNumber(values.amount || 0) }} to {{ getContactName(values.contact_id) }}
        </div>
      </CardContent>
    </Card>

    <!-- Form Actions -->
    <div class="flex justify-end space-x-2 pt-4">
      <Button type="button" variant="outline" @click="$emit('cancel')" :disabled="submitting">
        Cancel
      </Button>
      <Button type="submit" :disabled="submitting || hasInsufficientBalance">
        <Loader2 v-if="submitting" class="mr-2 h-4 w-4 animate-spin" />
        {{ transaction ? 'Update' : 'Create' }} Transaction
      </Button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { computed, watch, onMounted, ref } from 'vue';
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/yup';
import * as yup from 'yup';

import {
  Loader2,
  ArrowUpCircle,
  ArrowDownCircle,
  ArrowRightLeft,
  HandCoins,
  Plus,
  Check,
  AlertCircle,
} from 'lucide-vue-next';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { FormField } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import QuickContactForm from './QuickContactForm.vue';
import type { Transaction } from '@/services/transaction.service';
import type { Account } from '@/services/account.service';
import type { Category } from '@/services/category.service';
import type { Contact } from '@/services/contact.service';
import { accountService } from '@/services/account.service';
import { categoryService } from '@/services/category.service';
import { contactService } from '@/services/contact.service';

const props = defineProps<{
  transaction?: Transaction | null;
}>();

const emit = defineEmits<{
  submit: [data: any];
  cancel: [];
}>();

const submitting = ref(false);
const accounts = ref<Account[]>([]);
const categories = ref<Category[]>([]);
const contacts = ref<Contact[]>([]);
const isContactDialogOpen = ref(false);

const today = new Date().toISOString().split('T')[0];

const formSchema = toTypedSchema(yup.object({
  type: yup.string().required('Required'),
  amount: yup.number()
    .transform((value, originalValue) => (String(originalValue).trim() === '' ? 0 : value))
    .min(0.01, 'Minimum check required')
    .required('Required'),
  transaction_date: yup.string().required('Date required'),
  account_id: yup.string().required('Required'),
  to_account_id: yup.string().when('type', {
    is: 'transfer',
    then: (schema) => schema.required('Required'),
    otherwise: (schema) => schema.nullable().optional(),
  }),
  category_id: yup.string().when('type', {
    is: (val: string) => ['income', 'expense'].includes(val),
    then: (schema) => schema.required('Required'),
    otherwise: (schema) => schema.nullable().optional(),
  }),
  contact_id: yup.string().when('type', {
    is: (val: string) => ['lent', 'borrowed', 'repayment_in', 'repayment_out'].includes(val),
    then: (schema) => schema.required('Required'),
    otherwise: (schema) => schema.nullable().optional(),
  }),
  title: yup.string().nullable().optional(),
  description: yup.string().nullable().optional(),
  reference_number: yup.string().nullable().optional(),
}));

const { handleSubmit, setValues, values } = useForm({
  validationSchema: formSchema,
  initialValues: {
    type: 'expense',
    amount: 0,
    account_id: '',
    to_account_id: '',
    category_id: '',
    contact_id: '',
    transaction_date: today,
    title: '',
    description: '',
    reference_number: '',
  },
});

// Computed properties
const showCategoryField = computed(() => {
  return ['income', 'expense'].includes(values.type || '');
});

const showContactField = computed(() => {
  return ['lent', 'borrowed', 'repayment_in', 'repayment_out'].includes(values.type || '');
});

const filteredToAccounts = computed(() => {
  return accounts.value.filter((acc) => acc.id.toString() !== values.account_id);
});

const filteredCategories = computed(() => {
  const type = values.type === 'income' ? 'income' : 'expense';
  return categories.value.filter((cat) => cat.type === type && !cat.parent_id);
});

const selectedAccountBalance = computed(() => {
  const account = accounts.value.find((a) => a.id.toString() === values.account_id);

  if (!account) return 0;

  let availableBalance = account.balance;

  if (props.transaction && props.transaction.account.id.toString() === values.account_id) {
    const originalType = props.transaction.type;
    const originalAmount = props.transaction.amount;
    const wasDeduction = ['expense', 'transfer', 'lent', 'repayment_out'].includes(originalType);

    if (wasDeduction) {
      availableBalance += originalAmount;
    } else {
      availableBalance -= originalAmount;
    }
  }

  return availableBalance;
});

const hasInsufficientBalance = computed(() => {
  if (!values.account_id || !values.amount) return false;
  const isDeduction = ['expense', 'transfer', 'lent', 'repayment_out'].includes(values.type || '');
  if (!isDeduction) return false;

  return values.amount > selectedAccountBalance.value;
});

// Methods
const fetchAccounts = async () => {
  try {
    const response = await accountService.getAll({ active_only: true });
    accounts.value = response.accounts;
  } catch (error) {
    console.error('Failed to fetch accounts', error);
  }
};

const fetchCategories = async () => {
  try {
    const response = await categoryService.getAll({ active_only: true });
    categories.value = response.categories;
  } catch (error) {
    console.error('Failed to fetch categories', error);
  }
};

const fetchContacts = async () => {
  try {
    const response = await contactService.getAll({ active_only: true });
    contacts.value = response.contacts;
  } catch (error) {
    console.error('Failed to fetch contacts', error);
  }
};

const handleContactSubmit = async (contactData: any) => {
  try {
    const response = await contactService.create(contactData);
    contacts.value.push(response.contact);
    setValues({ contact_id: response.contact.id.toString() });
    isContactDialogOpen.value = false;
  } catch (error) {
    console.error('Failed to create contact', error);
  }
};

const onSubmit = handleSubmit(async (formValues) => {
  if (hasInsufficientBalance.value || submitting.value) return;

  submitting.value = true;
  const data: any = {
    type: formValues.type,
    amount: formValues.amount,
    account_id: parseInt(formValues.account_id as string),
    transaction_date: formValues.transaction_date,
    title: formValues.title || null,
    description: formValues.description || null,
    reference_number: formValues.reference_number || null,
  };

  if (formValues.type === 'transfer') {
    data.to_account_id = parseInt(formValues.to_account_id as string);
  }

  if (showCategoryField.value) {
    data.category_id = parseInt(formValues.category_id as string);
  }

  if (showContactField.value) {
    data.contact_id = parseInt(formValues.contact_id as string);
  }

  emit('submit', data);
});

const getTypeDescription = (type: string | undefined) => {
  if (!type) return '';
  const descriptions: Record<string, string> = {
    income: 'Money coming into your account (salary, freelance, etc.)',
    expense: 'Money going out from your account (shopping, bills, etc.)',
    transfer: 'Move money between your own accounts',
    lent: 'Money you gave to someone (they owe you)',
    borrowed: 'Money you took from someone (you owe them)',
    repayment_in: 'Someone is paying you back',
    repayment_out: 'You are paying someone back',
  };
  return descriptions[type] || '';
};

const formatTransactionType = (type: string | undefined) => {
  if (!type) return '';
  return type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
};

const formatNumber = (num: number) => {
  return new Intl.NumberFormat('en-IN').format(num);
};

const getAccountName = (accountId: string | undefined) => {
  if (!accountId) return 'Selected Account';
  const account = accounts.value.find((a) => a.id.toString() === accountId);
  return account?.name || 'Selected Account';
};

const getContactName = (contactId: string | undefined) => {
  if (!contactId) return 'Selected Contact';
  const contact = contacts.value.find((c) => c.id.toString() === contactId);
  return contact?.name || 'Selected Contact';
};

// Watch for transaction type changes and reset dependent fields
watch(
  () => values.type,
  (newType, oldType) => {
    if (!oldType) return;
    if (newType !== 'transfer') {
      setValues({ to_account_id: '' });
    }
    if (!['income', 'expense'].includes(newType || '')) {
      setValues({ category_id: '' });
    }
    if (!['lent', 'borrowed', 'repayment_in', 'repayment_out'].includes(newType || '')) {
      setValues({ contact_id: '' });
    }
  }
);

// Initialize form with transaction data if editing
watch(
  () => props.transaction,
  (transaction) => {
    if (transaction) {
      setValues({
        type: transaction.type as any,
        amount: transaction.amount,
        account_id: transaction.account.id.toString(),
        to_account_id: transaction.to_account?.id.toString() || '',
        category_id: transaction.category?.id.toString() || '',
        contact_id: transaction.contact?.id.toString() || '',
        transaction_date: transaction.transaction_date,
        title: transaction.title || '',
        description: transaction.description || '',
        reference_number: transaction.reference_number || '',
      });
    }
  },
  { immediate: true }
);

onMounted(() => {
  fetchAccounts();
  fetchCategories();
  fetchContacts();
});
</script>
