<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <!-- Transaction Type Selection -->
    <div class="space-y-2">
      <Label for="type">Transaction Type *</Label>
      <Select v-model="form.type" required>
        <SelectTrigger>
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
      <p class="text-xs text-muted-foreground">{{ getTypeDescription(form.type) }}</p>
    </div>

    <Separator />

    <!-- Dynamic Fields Based on Transaction Type -->
    <div class="grid gap-4 md:grid-cols-2">
      <!-- Amount -->
      <div class="space-y-2">
        <Label for="amount">Amount *</Label>
        <div class="relative">
          <span class="absolute left-3 top-2.5 text-muted-foreground">₹</span>
          <Input id="amount" v-model.number="form.amount" type="number" step="0.01" min="0.01" class="pl-8"
            placeholder="0.00" required />
        </div>
      </div>

      <!-- Transaction Date -->
      <div class="space-y-2">
        <Label for="transaction_date">Date *</Label>
        <Input id="transaction_date" v-model="form.transaction_date" type="date" :max="today" required />
      </div>

      <!-- Source Account (All types) -->
      <div class="space-y-2">
        <Label for="account_id">
          {{ form.type === 'transfer' ? 'From Account' : 'Account' }} *
        </Label>
        <Select v-model="form.account_id" required>
          <SelectTrigger>
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
      </div>

      <!-- Destination Account (Transfer only) -->
      <div v-if="form.type === 'transfer'" class="space-y-2">
        <Label for="to_account_id">To Account *</Label>
        <Select v-model="form.to_account_id" required>
          <SelectTrigger>
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
      </div>

      <!-- Category (Income/Expense only) -->
      <div v-if="showCategoryField" class="space-y-2">
        <Label for="category_id">Category *</Label>
        <Select v-model="form.category_id" required>
          <SelectTrigger>
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
      </div>

      <!-- Contact (Debt transactions only) -->
      <div v-if="showContactField" class="space-y-2">
        <Label for="contact_id">Contact *</Label>
        <div class="flex space-x-2">
          <Select v-model="form.contact_id" required class="flex-1">
            <SelectTrigger>
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
      </div>
    </div>

    <!-- Title and Description -->
    <div class="space-y-4">
      <div class="space-y-2">
        <Label for="title">Title</Label>
        <Input id="title" v-model="form.title" placeholder="e.g., Monthly salary, Grocery shopping, ATM withdrawal" />
      </div>

      <div class="space-y-2">
        <Label for="description">Description</Label>
        <Textarea id="description" v-model="form.description" placeholder="Additional details about this transaction"
          rows="3" />
      </div>

      <div class="space-y-2">
        <Label for="reference_number">Reference Number</Label>
        <Input id="reference_number" v-model="form.reference_number"
          placeholder="Transaction ID, Receipt number, etc." />
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
          <span class="font-medium">{{ formatTransactionType(form.type) }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-muted-foreground">Amount:</span>
          <span class="font-bold text-lg">₹{{ formatNumber(form.amount || 0) }}</span>
        </div>
        <Separator />
        <div v-if="form.type === 'income'" class="text-green-600">
          <Check class="inline h-4 w-4 mr-1" />
          Your {{ getAccountName(form.account_id) }} will increase by ₹{{ formatNumber(form.amount || 0) }}
        </div>
        <div v-else-if="form.type === 'expense'" class="text-red-600">
          <AlertCircle class="inline h-4 w-4 mr-1" />
          Your {{ getAccountName(form.account_id) }} will decrease by ₹{{ formatNumber(form.amount || 0) }}
        </div>
        <div v-else-if="form.type === 'transfer'" class="text-blue-600">
          <ArrowRightLeft class="inline h-4 w-4 mr-1" />
          Transfer ₹{{ formatNumber(form.amount || 0) }} from {{ getAccountName(form.account_id) }} to {{
            getAccountName(form.to_account_id) }}
        </div>
        <div v-else-if="form.type === 'lent'" class="text-orange-600">
          <HandCoins class="inline h-4 w-4 mr-1" />
          You lent ₹{{ formatNumber(form.amount || 0) }} to {{ getContactName(form.contact_id) }}
        </div>
        <div v-else-if="form.type === 'borrowed'" class="text-purple-600">
          <HandCoins class="inline h-4 w-4 mr-1" />
          You borrowed ₹{{ formatNumber(form.amount || 0) }} from {{ getContactName(form.contact_id) }}
        </div>
        <div v-else-if="form.type === 'repayment_in'" class="text-green-600">
          <Check class="inline h-4 w-4 mr-1" />
          {{ getContactName(form.contact_id) }} paid you back ₹{{ formatNumber(form.amount || 0) }}
        </div>
        <div v-else-if="form.type === 'repayment_out'" class="text-red-600">
          <AlertCircle class="inline h-4 w-4 mr-1" />
          You paid back ₹{{ formatNumber(form.amount || 0) }} to {{ getContactName(form.contact_id) }}
        </div>
      </CardContent>
    </Card>

    <!-- Form Actions -->
    <div class="flex justify-end space-x-2 pt-4">
      <Button type="button" variant="outline" @click="$emit('cancel')" :disabled="submitting">
        Cancel
      </Button>
      <Button type="submit" :disabled="submitting || !isFormValid">
        <Loader2 v-if="submitting" class="mr-2 h-4 w-4 animate-spin" />
        {{ transaction ? 'Update' : 'Create' }} Transaction
      </Button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { reactive, computed, watch, onMounted, ref } from 'vue';
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

const form = reactive({
  type: 'expense' as any,
  amount: 0,
  account_id: '',
  to_account_id: '',
  category_id: '',
  contact_id: '',
  transaction_date: today,
  title: '',
  description: '',
  reference_number: '',
});

// Computed properties
const showCategoryField = computed(() => {
  return ['income', 'expense'].includes(form.type);
});

const showContactField = computed(() => {
  return ['lent', 'borrowed', 'repayment_in', 'repayment_out'].includes(form.type);
});

const filteredToAccounts = computed(() => {
  return accounts.value.filter((acc) => acc.id.toString() !== form.account_id);
});

const filteredCategories = computed(() => {
  const type = form.type === 'income' ? 'income' : 'expense';
  return categories.value.filter((cat) => cat.type === type && !cat.parent_id);
});

const isFormValid = computed(() => {
  if (!form.type || !form.amount || !form.account_id || !form.transaction_date) {
    return false;
  }

  if (form.type === 'transfer' && !form.to_account_id) {
    return false;
  }

  if (showCategoryField.value && !form.category_id) {
    return false;
  }

  if (showContactField.value && !form.contact_id) {
    return false;
  }

  return true;
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
    form.contact_id = response.contact.id.toString();
    isContactDialogOpen.value = false;
  } catch (error) {
    console.error('Failed to create contact', error);
  }
};

const handleSubmit = async () => {
  if (!isFormValid.value) return;

  // Prevent multiple submissions
  if (submitting.value) return;

  submitting.value = true;
  const data: any = {
    type: form.type,
    amount: form.amount,
    account_id: parseInt(form.account_id),
    transaction_date: form.transaction_date,
    title: form.title || null,
    description: form.description || null,
    reference_number: form.reference_number || null,
  };

  if (form.type === 'transfer') {
    data.to_account_id = parseInt(form.to_account_id);
  }

  if (showCategoryField.value) {
    data.category_id = parseInt(form.category_id);
  }

  if (showContactField.value) {
    data.contact_id = parseInt(form.contact_id);
  }

  emit('submit', data);
};

const getTypeDescription = (type: string) => {
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

const formatTransactionType = (type: string) => {
  return type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
};

const formatNumber = (num: number) => {
  return new Intl.NumberFormat('en-IN').format(num);
};

const getAccountName = (accountId: string) => {
  const account = accounts.value.find((a) => a.id.toString() === accountId);
  return account?.name || 'Selected Account';
};

const getContactName = (contactId: string) => {
  const contact = contacts.value.find((c) => c.id.toString() === contactId);
  return contact?.name || 'Selected Contact';
};

// Watch for transaction type changes and reset dependent fields
watch(
  () => form.type,
  (newType) => {
    // Reset fields that are not applicable to the new type
    if (newType !== 'transfer') {
      form.to_account_id = '';
    }
    if (!['income', 'expense'].includes(newType)) {
      form.category_id = '';
    }
    if (!['lent', 'borrowed', 'repayment_in', 'repayment_out'].includes(newType)) {
      form.contact_id = '';
    }
  }
);

// Initialize form with transaction data if editing
watch(
  () => props.transaction,
  (transaction) => {
    if (transaction) {
      form.type = transaction.type;
      form.amount = transaction.amount;
      form.account_id = transaction.account.id.toString();
      form.to_account_id = transaction.to_account?.id.toString() || '';
      form.category_id = transaction.category?.id.toString() || '';
      form.contact_id = transaction.contact?.id.toString() || '';
      form.transaction_date = transaction.transaction_date;
      form.title = transaction.title || '';
      form.description = transaction.description || '';
      form.reference_number = transaction.reference_number || '';
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
