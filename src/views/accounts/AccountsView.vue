<!-- src/views/accounts/AccountsView.vue -->
<template>
  <AuthLayout>
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-3xl font-bold break-words">Accounts</h1>
          <p class="text-muted-foreground">Manage your financial accounts</p>
        </div>
        <Dialog v-model:open="isDialogOpen">
          <DialogTrigger as-child>
            <Button class="w-full sm:w-auto">
              <Plus class="mr-2 h-4 w-4" />
              Add Account
            </Button>
          </DialogTrigger>
          <DialogContent class="max-w-2xl py-4 w-[calc(100%-2rem)] sm:w-full">
            <DialogHeader>
              <DialogTitle>{{ editingAccount ? 'Edit Account' : 'Create New Account' }}</DialogTitle>
              <DialogDescription>
                {{ editingAccount ? 'Update account details' : 'Add a new account' }}
              </DialogDescription>
            </DialogHeader>
            <ScrollArea class="max-h-[70vh] -mx-6 px-6 pb-0">
              <AccountForm :account="editingAccount" @submit="handleSubmit" @cancel="closeDialog" />
            </ScrollArea>
          </DialogContent>

        </Dialog>
      </div>

      <!-- Summary Cards -->
      <div class="grid gap-4 md:grid-cols-3">
        <!-- Loading Skeletons -->
        <template v-if="loading">
          <Card v-for="i in 3" :key="i">
            <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton class="h-4 w-28" />
              <Skeleton class="h-4 w-4 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton class="h-8 w-32" />
            </CardContent>
          </Card>
        </template>

        <!-- Actual Cards -->
        <template v-else>
          <Card>
            <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle class="text-sm font-medium">Total Assets</CardTitle>
              <TrendingUp class="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div class="text-2xl font-bold text-green-600">
                ₹{{ formatNumber(summary?.total_assets || 0) }}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle class="text-sm font-medium">Total Liabilities</CardTitle>
              <TrendingDown class="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div class="text-2xl font-bold text-red-600">
                ₹{{ formatNumber(summary?.total_liabilities || 0) }}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle class="text-sm font-medium">Net Worth</CardTitle>
              <Wallet class="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div class="text-2xl font-bold text-primary">
                ₹{{ formatNumber(summary?.net_worth || 0) }}
              </div>
            </CardContent>
          </Card>
        </template>
      </div>

      <!-- Filters -->
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="flex flex-wrap gap-4">
            <Select v-model="filters.type">
              <SelectTrigger class="w-[180px]">
                <SelectValue placeholder="Account Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="asset">Assets</SelectItem>
                <SelectItem value="liability">Liabilities</SelectItem>
              </SelectContent>
            </Select>

            <Select v-model="filters.subtype">
              <SelectTrigger class="w-[180px]">
                <SelectValue placeholder="Subtype" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subtypes</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="bank_account">Bank Account</SelectItem>
                <SelectItem value="digital_wallet">Digital Wallet</SelectItem>
                <SelectItem value="credit_card">Credit Card</SelectItem>
                <SelectItem value="loan">Loan</SelectItem>
              </SelectContent>
            </Select>

            <div class="flex items-center space-x-2">
              <Checkbox id="active_only" v-model:checked="filters.active_only" />
              <Label for="active_only">Active only</Label>
            </div>

            <Button variant="outline" @click="resetFilters">
              <X class="mr-2 h-4 w-4" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      <!-- Accounts List -->
      <div v-if="loading" class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card v-for="i in 6" :key="i" class="relative overflow-hidden">
          <div class="absolute top-0 left-0 w-1 h-full bg-muted"></div>
          <CardHeader>
            <div class="flex items-start justify-between">
              <div class="flex items-center space-x-3">
                <Skeleton class="h-9 w-9 rounded-lg" />
                <div class="space-y-2">
                  <Skeleton class="h-5 w-32" />
                  <Skeleton class="h-3 w-24" />
                </div>
              </div>
              <Skeleton class="h-8 w-8 rounded-md" />
            </div>
          </CardHeader>
          <CardContent class="space-y-3">
            <div class="flex justify-between items-center">
              <Skeleton class="h-4 w-16" />
              <Skeleton class="h-6 w-24" />
            </div>
            <Skeleton class="h-3 w-full" />
          </CardContent>
        </Card>
      </div>

      <div v-else-if="filteredAccounts.length === 0" class="text-center py-8">
        <p class="text-muted-foreground">No accounts found</p>
      </div>

      <div v-else class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card v-for="account in filteredAccounts" :key="account.id" class="relative overflow-hidden">
          <div class="absolute top-0 left-0 w-1 h-full" :style="{ backgroundColor: account.color }"></div>

          <CardHeader>
            <div class="flex items-start justify-between">
              <div class="flex items-center space-x-3">
                <div class="p-2 rounded-lg" :style="{ backgroundColor: account.color + '20' }">
                  <component :is="getAccountIcon(account.icon)" class="h-5 w-5" :style="{ color: account.color }" />
                </div>
                <div>
                  <CardTitle class="text-lg">{{ account.name }}</CardTitle>
                  <p class="text-xs text-muted-foreground">
                    {{ formatSubtype(account.subtype) }}
                  </p>
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger as-child>
                  <Button variant="ghost" size="icon">
                    <MoreVertical class="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem @click="editAccount(account)">
                    <Pencil class="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem @click="deleteAccount(account)" class="text-destructive">
                    <Trash2 class="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>

          <CardContent class="space-y-2">
            <div class="flex justify-between items-center">
              <span class="text-sm text-muted-foreground">Balance:</span>
              <span class="text-lg font-bold" :class="account.type === 'asset' ? 'text-green-600' : 'text-red-600'">
                ₹{{ formatNumber(account.balance) }}
              </span>
            </div>

            <div v-if="account.credit_limit" class="space-y-1">
              <div class="flex justify-between text-xs">
                <span class="text-muted-foreground">Available Credit:</span>
                <span class="font-medium">₹{{ formatNumber(account.available_credit || 0) }}</span>
              </div>
              <Progress :value="((account.balance / account.credit_limit) * 100)" class="h-2" />
            </div>

            <div v-if="account.bank_name" class="text-xs text-muted-foreground">
              {{ account.bank_name }}
              <span v-if="account.account_number"> • {{ account.account_number }}</span>
            </div>

            <Badge v-if="!account.is_active" variant="secondary">Inactive</Badge>
          </CardContent>
        </Card>
      </div>
    </div>
  </AuthLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useToast } from '@/components/ui/toast/use-toast';
import {
  Plus,
  TrendingUp,
  TrendingDown,
  Wallet,
  MoreVertical,
  Pencil,
  Trash2,
  X,
  CreditCard,
  Banknote,
  Smartphone,
  Building2,
  HandCoins,
} from 'lucide-vue-next';
import AuthLayout from '@/layouts/AuthLayout.vue';
import AccountForm from '@/components/accounts/AccountForm.vue';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { accountService, type Account, type AccountSummary } from '@/services/account.service';

const { toast } = useToast();

const accounts = ref<Account[]>([]);
const summary = ref<AccountSummary | null>(null);
const loading = ref(false);
const isDialogOpen = ref(false);
const editingAccount = ref<Account | null>(null);

const filters = ref({
  type: 'all',
  subtype: 'all',
  active_only: true,
});

const filteredAccounts = computed(() => {
  return accounts.value.filter((account) => {
    if (filters.value.type !== 'all' && account.type !== filters.value.type) {
      return false;
    }
    if (filters.value.subtype !== 'all' && account.subtype !== filters.value.subtype) {
      return false;
    }
    if (filters.value.active_only && !account.is_active) {
      return false;
    }
    return true;
  });
});

const fetchAccounts = async () => {
  try {
    loading.value = true;
    const response = await accountService.getAll();
    accounts.value = response.accounts;
  } catch (error: any) {
    toast({
      title: 'Error',
      description: error.response?.data?.message || 'Failed to fetch accounts',
      variant: 'destructive',
    });
  } finally {
    loading.value = false;
  }
};

const fetchSummary = async () => {
  try {
    const response = await accountService.getSummary();
    summary.value = response.summary;
  } catch (error) {
    console.error('Failed to fetch summary', error);
  }
};

const handleSubmit = async (formData: any) => {
  try {
    if (editingAccount.value) {
      await accountService.update(editingAccount.value.id, formData);
      toast({
        title: 'Success',
        description: 'Account updated successfully',
      });
    } else {
      await accountService.create(formData);
      toast({
        title: 'Success',
        description: 'Account created successfully',
      });
    }
    closeDialog();
    await fetchAccounts();
    await fetchSummary();
  } catch (error: any) {
    toast({
      title: 'Error',
      description: error.response?.data?.message || 'Operation failed',
      variant: 'destructive',
    });
  }
};

const editAccount = (account: Account) => {
  editingAccount.value = account;
  isDialogOpen.value = true;
};

const deleteAccount = async (account: Account) => {
  if (!confirm(`Are you sure you want to delete "${account.name}"?`)) {
    return;
  }

  try {
    await accountService.delete(account.id);
    toast({
      title: 'Success',
      description: 'Account deleted successfully',
    });
    await fetchAccounts();
    await fetchSummary();
  } catch (error: any) {
    toast({
      title: 'Error',
      description: error.response?.data?.message || 'Failed to delete account',
      variant: 'destructive',
    });
  }
};

const closeDialog = () => {
  isDialogOpen.value = false;
  editingAccount.value = null;
};

const resetFilters = () => {
  filters.value = {
    type: 'all',
    subtype: 'all',
    active_only: true,
  };
};

const formatNumber = (num: number) => {
  return new Intl.NumberFormat('en-IN').format(num);
};

const formatSubtype = (subtype: string) => {
  return subtype.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
};

const getAccountIcon = (icon: string) => {
  const icons: Record<string, any> = {
    wallet: Banknote,
    bank: Building2,
    smartphone: Smartphone,
    'credit-card': CreditCard,
    loan: HandCoins,
  };
  return icons[icon] || Wallet;
};

onMounted(() => {
  fetchAccounts();
  fetchSummary();
});

watch(isDialogOpen, (newValue) => {
  if (!newValue) {
    editingAccount.value = null;
  }
});
</script>
