<template>
  <AuthLayout>
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-3xl font-bold break-words">Transactions</h1>
          <p class="text-muted-foreground">Track all your financial transactions</p>
        </div>
        <Dialog v-model:open="isDialogOpen">
          <DialogTrigger as-child>
            <Button class="w-full sm:w-auto">
              <Plus class="mr-2 h-4 w-4" />
              Add Transaction
            </Button>
          </DialogTrigger>
          <DialogContent class="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{{ editingTransaction ? 'Edit Transaction' : 'New Transaction' }}</DialogTitle>
              <DialogDescription>
                {{ editingTransaction ? 'Update transaction details' : 'Record a new transaction' }}
              </DialogDescription>
            </DialogHeader>
            <ScrollArea class="max-h-[70vh] -mx-6 px-6 pb-0">
              <TransactionForm :transaction="editingTransaction" @submit="handleSubmit" @cancel="closeDialog" />
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>
      <!-- Statistics Cards -->
      <div class="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle class="text-sm font-medium">Total Income</CardTitle>
            <TrendingUp class="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold text-green-600">
              ₹{{ formatNumber(statistics?.total_income || 0) }}
            </div>
            <p class="text-xs text-muted-foreground">This {{ period }}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle class="text-sm font-medium">Total Expense</CardTitle>
            <TrendingDown class="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold text-red-600">
              ₹{{ formatNumber(statistics?.total_expense || 0) }}
            </div>
            <p class="text-xs text-muted-foreground">This {{ period }}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle class="text-sm font-medium">Net Savings</CardTitle>
            <Wallet class="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold text-primary">
              ₹{{ formatNumber(statistics?.net_savings || 0) }}
            </div>
            <p class="text-xs text-muted-foreground">This {{ period }}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle class="text-sm font-medium">Transfers</CardTitle>
            <ArrowLeftRight class="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold text-blue-600">
              ₹{{ formatNumber(statistics?.total_transfers || 0) }}
            </div>
            <p class="text-xs text-muted-foreground">This {{ period }}</p>
          </CardContent>
        </Card>
      </div>

      <!-- Filters -->
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="grid gap-4 md:grid-cols-4">
            <Select v-model="filters.period">
              <SelectTrigger>
                <SelectValue placeholder="Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>

            <Select v-model="filters.type">
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
                <SelectItem value="transfer">Transfer</SelectItem>
                <SelectItem value="lent">Lent</SelectItem>
                <SelectItem value="borrowed">Borrowed</SelectItem>
                <SelectItem value="repayment_in">Repayment In</SelectItem>
                <SelectItem value="repayment_out">Repayment Out</SelectItem>
              </SelectContent>
            </Select>

            <Input v-model="filters.search" placeholder="Search transactions..." class="md:col-span-2" />
          </div>

          <div class="flex justify-end mt-4">
            <Button variant="outline" @click="resetFilters">
              <X class="mr-2 h-4 w-4" />
              Reset Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      <!-- Transactions Table -->
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div v-if="loading" class="flex justify-center py-8">
            <Loader2 class="h-8 w-8 animate-spin" />
          </div>

          <div v-else-if="transactions.length === 0" class="text-center py-8">
            <p class="text-muted-foreground">No transactions found</p>
          </div>

          <div v-else class="space-y-2">
            <div v-for="transaction in transactions" :key="transaction.id"
              class="flex items-center justify-between p-4 rounded-lg border hover:bg-accent cursor-pointer transition-colors"
              @click="viewTransaction(transaction)">
              <div class="flex items-center space-x-4">
                <div class="p-2 rounded-full" :class="getTransactionBgClass(transaction.type)">
                  <component :is="getTransactionIcon(transaction.type)" class="h-5 w-5"
                    :class="getTransactionTextClass(transaction.type)" />
                </div>

                <div>
                  <p class="font-medium">{{ transaction.title ||
                    formatTransactionType(transaction.type) }}</p>
                  <div class="flex items-center space-x-2 text-sm text-muted-foreground">
                    <span>{{ transaction.account.name }}</span>
                    <ArrowRight v-if="transaction.to_account" class="h-3 w-3" />
                    <span v-if="transaction.to_account">{{ transaction.to_account.name }}</span>
                    <span v-if="transaction.category">• {{ transaction.category.name }}</span>
                    <span v-if="transaction.contact">• {{ transaction.contact.name }}</span>
                  </div>
                  <p class="text-xs text-muted-foreground">
                    {{ formatDate(transaction.transaction_date) }}
                  </p>
                </div>
              </div>

              <div class="flex items-center space-x-4">
                <div class="text-lg font-bold" :class="getAmountClass(transaction.type)">
                  {{ getAmountPrefix(transaction.type) }}₹{{ formatNumber(transaction.amount) }}
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger as-child @click.stop>
                    <Button variant="ghost" size="icon">
                      <MoreVertical class="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem @click.stop="editTransaction(transaction)">
                      <Pencil class="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem @click.stop="deleteTransaction(transaction)" class="text-destructive">
                      <Trash2 class="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          <!-- Pagination -->
          <div v-if="meta" class="flex items-center justify-between mt-4">
            <p class="text-sm text-muted-foreground">
              Showing {{ transactions.length }} of {{ meta.total }} transactions
            </p>
            <div class="flex space-x-2">
              <Button variant="outline" size="sm" :disabled="meta.current_page === 1"
                @click="changePage(meta.current_page - 1)">
                Previous
              </Button>
              <Button variant="outline" size="sm" :disabled="meta.current_page === meta.last_page"
                @click="changePage(meta.current_page + 1)">
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
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
  ArrowLeftRight,
  ArrowRight,
  MoreVertical,
  Pencil,
  Trash2,
  X,
  Loader2,
  ArrowUpCircle,
  ArrowDownCircle,
  ArrowRightLeft,
  HandCoins,
  Users,
} from 'lucide-vue-next';
import AuthLayout from '@/layouts/AuthLayout.vue';
import TransactionForm from '@/components/transactions/TransactionForm.vue';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  transactionService,
  type Transaction,
  type TransactionStatistics,
} from '@/services/transaction.service';
import { useAuthStore } from '@/stores/auth';

const { toast } = useToast();
const authStore = useAuthStore();

const transactions = ref<Transaction[]>([]);
const statistics = ref<TransactionStatistics | null>(null);
const meta = ref<any>(null);
const loading = ref(false);
const isDialogOpen = ref(false);
const editingTransaction = ref<Transaction | null>(null);
const period = ref('month');

const filters = ref({
  period: 'month',
  type: 'all',
  search: '',
  page: 1,
});

const fetchTransactions = async () => {
  try {
    loading.value = true;
    const params: any = {
      period: filters.value.period,
      per_page: 15,
      page: filters.value.page,
    };

    if (filters.value.type !== 'all') {
      params.type = filters.value.type;
    }

    if (filters.value.search) {
      params.search = filters.value.search;
    }

    const response = await transactionService.getAll(params);
    transactions.value = response.transactions;
    meta.value = response.meta;
  } catch (error: any) {
    toast({
      title: 'Error',
      description: error.response?.data?.message || 'Failed to fetch transactions',
      variant: 'destructive',
    });
  } finally {
    loading.value = false;
  }
};

const fetchStatistics = async () => {
  try {
    const response = await transactionService.getStatistics(filters.value.period);
    statistics.value = response.statistics;
    period.value = response.statistics.period;
  } catch (error) {
    console.error('Failed to fetch statistics', error);
  }
};

const handleSubmit = async (formData: any) => {
  try {
    if (editingTransaction.value) {
      await transactionService.update(editingTransaction.value.id, formData);
      toast({
        title: 'Success',
        description: 'Transaction updated successfully',
      });
    } else {
      await transactionService.create(formData);
      toast({
        title: 'Success',
        description: 'Transaction created successfully',
      });
    }
    closeDialog();
    await fetchTransactions();
    await fetchStatistics();
    await authStore.fetchUser();
  } catch (error: any) {
    toast({
      title: 'Error',
      description: error.response?.data?.message || 'Operation failed',
      variant: 'destructive',
    });
  }
};

const viewTransaction = (transaction: Transaction) => {
  // You can implement a detail view here
  console.log('View transaction:', transaction);
};

const editTransaction = (transaction: Transaction) => {
  editingTransaction.value = transaction;
  isDialogOpen.value = true;
};

const deleteTransaction = async (transaction: Transaction) => {
  if (!confirm(`Are you sure you want to delete this transaction?`)) {
    return;
  }

  try {
    await transactionService.delete(transaction.id);
    toast({
      title: 'Success',
      description: 'Transaction deleted successfully',
    });
    await fetchTransactions();
    await fetchStatistics();
    await authStore.fetchUser();
  } catch (error: any) {
    toast({
      title: 'Error',
      description: error.response?.data?.message || 'Failed to delete transaction',
      variant: 'destructive',
    });
  }
};

const closeDialog = () => {
  isDialogOpen.value = false;
  editingTransaction.value = null;
};

const resetFilters = () => {
  filters.value = {
    period: 'month',
    type: 'all',
    search: '',
    page: 1,
  };
};

const changePage = (page: number) => {
  filters.value.page = page;
  fetchTransactions();
};

const formatNumber = (num: number) => {
  return new Intl.NumberFormat('en-IN').format(num);
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const formatTransactionType = (type: string) => {
  return type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
};

const getTransactionIcon = (type: string) => {
  const icons: Record<string, any> = {
    income: ArrowUpCircle,
    expense: ArrowDownCircle,
    transfer: ArrowRightLeft,
    lent: HandCoins,
    borrowed: HandCoins,
    repayment_in: ArrowUpCircle,
    repayment_out: ArrowDownCircle,
  };
  return icons[type] || Wallet;
};

const getTransactionBgClass = (type: string) => {
  const classes: Record<string, string> = {
    income: 'bg-green-100 dark:bg-green-900/20',
    expense: 'bg-red-100 dark:bg-red-900/20',
    transfer: 'bg-blue-100 dark:bg-blue-900/20',
    lent: 'bg-orange-100 dark:bg-orange-900/20',
    borrowed: 'bg-purple-100 dark:bg-purple-900/20',
    repayment_in: 'bg-green-100 dark:bg-green-900/20',
    repayment_out: 'bg-red-100 dark:bg-red-900/20',
  };
  return classes[type] || 'bg-gray-100';
};

const getTransactionTextClass = (type: string) => {
  const classes: Record<string, string> = {
    income: 'text-green-600',
    expense: 'text-red-600',
    transfer: 'text-blue-600',
    lent: 'text-orange-600',
    borrowed: 'text-purple-600',
    repayment_in: 'text-green-600',
    repayment_out: 'text-red-600',
  };
  return classes[type] || 'text-gray-600';
};

const getAmountClass = (type: string) => {
  const isPositive = ['income', 'repayment_in', 'borrowed'].includes(type);
  return isPositive ? 'text-green-600' : 'text-red-600';
};

const getAmountPrefix = (type: string) => {
  const isPositive = ['income', 'repayment_in', 'borrowed'].includes(type);
  return isPositive ? '+' : '-';
};

onMounted(() => {
  fetchTransactions();
  fetchStatistics();
});

watch(
  () => [filters.value.period, filters.value.type, filters.value.search],
  () => {
    filters.value.page = 1;
    fetchTransactions();
    fetchStatistics();
  }
);

watch(isDialogOpen, (newValue) => {
  if (!newValue) {
    editingTransaction.value = null;
  }
});
</script>
