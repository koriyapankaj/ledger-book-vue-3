<template>
  <AuthLayout>
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-3xl font-bold break-words">Budgets</h1>
          <p class="text-muted-foreground">Set spending limits and track your progress</p>
        </div>
        <Dialog v-model:open="isDialogOpen">
          <DialogTrigger as-child>
            <Button @click="openCreateDialog" class="w-full sm:w-auto">
              <Plus class="mr-2 h-4 w-4" />
              Create Budget
            </Button>
          </DialogTrigger>
          <DialogContent class="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{{ editingBudget ? 'Edit Budget' : 'Create New Budget' }}</DialogTitle>
              <DialogDescription>
                {{ editingBudget ? 'Update budget details' : 'Set a spending limit for a category' }}
              </DialogDescription>
            </DialogHeader>
            <BudgetForm :budget="editingBudget" @submit="handleSubmit" @cancel="closeDialog" />
          </DialogContent>
        </Dialog>
      </div>

      <!-- Overall Budget Summary -->
      <Card class="bg-gradient-to-r from-primary/10 to-primary/5">
        <CardHeader>
          <CardTitle>Budget Overview</CardTitle>
          <CardDescription>Your overall budget status</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="grid gap-4 md:grid-cols-3">
            <div class="space-y-2">
              <p class="text-sm text-muted-foreground">Total Budgets</p>
              <p class="text-3xl font-bold">{{ budgets.length }}</p>
            </div>
            <div class="space-y-2">
              <p class="text-sm text-muted-foreground">Active Budgets</p>
              <p class="text-3xl font-bold text-green-600">{{ activeBudgets.length }}</p>
            </div>
            <div class="space-y-2">
              <p class="text-sm text-muted-foreground">Over Budget</p>
              <p class="text-3xl font-bold text-red-600">{{ overBudgetCount }}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Filters -->
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="flex flex-wrap gap-4">
            <Select v-model="filters.period">
              <SelectTrigger class="w-[180px]">
                <SelectValue placeholder="Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Periods</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>

            <Select v-model="filters.status">
              <SelectTrigger class="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="under">Under Budget</SelectItem>
                <SelectItem value="over">Over Budget</SelectItem>
                <SelectItem value="warning">Near Limit (>80%)</SelectItem>
              </SelectContent>
            </Select>

            <div class="flex items-center space-x-2">
              <Checkbox id="active_only" :checked="filters.active_only"
                @update:checked="filters.active_only = $event" />
              <Label for="active_only">Active only</Label>
            </div>

            <Button variant="outline" @click="resetFilters">
              <X class="mr-2 h-4 w-4" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      <!-- Budgets List -->
      <div v-if="loading" class="flex justify-center py-8">
        <Loader2 class="h-8 w-8 animate-spin" />
      </div>

      <div v-else-if="filteredBudgets.length === 0" class="text-center py-8">
        <Target class="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p class="text-muted-foreground">No budgets found</p>
        <Button class="mt-4" @click="openCreateDialog">
          <Plus class="mr-2 h-4 w-4" />
          Create Your First Budget
        </Button>
      </div>

      <div v-else class="grid gap-4 md:grid-cols-2">
        <Card v-for="budget in filteredBudgets" :key="budget.id" class="relative overflow-hidden">
          <!-- Progress Bar Background -->
          <div class="absolute top-0 left-0 h-1 w-full bg-muted">
            <div class="h-full transition-all duration-300" :class="getProgressBarClass(budget.percentage_used || 0)"
              :style="{ width: `${Math.min(budget.percentage_used || 0, 100)}%` }"></div>
          </div>

          <CardHeader>
            <div class="flex items-start justify-between">
              <div class="flex items-center space-x-3">
                <div class="p-3 rounded-lg" :style="{ backgroundColor: budget.category.color + '20' }">
                  <component :is="getCategoryIcon(budget.category.icon)" class="h-6 w-6"
                    :style="{ color: budget.category.color }" />
                </div>
                <div>
                  <CardTitle class="text-lg">{{ budget.category.name }}</CardTitle>
                  <div class="flex items-center space-x-2 mt-1">
                    <Badge variant="outline">{{ formatPeriod(budget.period) }}</Badge>
                    <Badge v-if="!budget.is_active" variant="secondary">Inactive</Badge>
                    <Badge v-if="budget.is_over_budget" variant="destructive">Over Budget</Badge>
                  </div>
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger as-child>
                  <Button variant="ghost" size="icon">
                    <MoreVertical class="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem @click="editBudget(budget)">
                    <Pencil class="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem @click="viewTransactions(budget)">
                    <Eye class="mr-2 h-4 w-4" />
                    View Transactions
                  </DropdownMenuItem>
                  <DropdownMenuItem @click="deleteBudget(budget)" class="text-destructive">
                    <Trash2 class="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>

          <CardContent class="space-y-4">
            <!-- Budget Amount -->
            <div class="space-y-2">
              <div class="flex justify-between text-sm">
                <span class="text-muted-foreground">Spent</span>
                <span class="font-medium">₹{{ formatNumber(budget.spent_amount || 0) }} / ₹{{
                  formatNumber(budget.amount) }}</span>
              </div>
              <Progress :value="budget.percentage_used || 0"
                :class="getProgressBarClass(budget.percentage_used || 0)" />
              <div class="flex justify-between text-xs text-muted-foreground">
                <span>{{ (budget.percentage_used || 0).toFixed(1) }}% used</span>
                <span>₹{{ formatNumber(budget.remaining_amount || 0) }} remaining</span>
              </div>
            </div>

            <!-- Budget Period -->
            <div class="flex justify-between items-center text-sm pt-2 border-t">
              <div class="flex items-center text-muted-foreground">
                <Calendar class="h-4 w-4 mr-2" />
                <span>{{ formatDate(budget.start_date) }}</span>
                <ArrowRight class="h-3 w-3 mx-1" />
                <span>{{ budget.end_date ? formatDate(budget.end_date) : 'Ongoing' }}</span>
              </div>
            </div>

            <!-- Warning Message -->
            <Alert v-if="budget.percentage_used && budget.percentage_used > 80 && !budget.is_over_budget"
              variant="default" class="border-yellow-500">
              <AlertCircle class="h-4 w-4 text-yellow-600" />
              <AlertDescription class="text-yellow-600">
                You've used {{ (budget.percentage_used).toFixed(0) }}% of this budget
              </AlertDescription>
            </Alert>

            <Alert v-if="budget.is_over_budget" variant="destructive">
              <AlertCircle class="h-4 w-4" />
              <AlertDescription>
                Budget exceeded by ₹{{ formatNumber(Math.abs(budget.remaining_amount || 0)) }}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  </AuthLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from '@/components/ui/toast/use-toast';
import {
  Plus,
  Target,
  X,
  Loader2,
  MoreVertical,
  Pencil,
  Trash2,
  Eye,
  Calendar,
  ArrowRight,
  AlertCircle,
  Tag,
  Utensils,
  Car,
  ShoppingBag,
  Film,
  FileText,
  Heart,
  BookOpen,
  Home,
  User,
  Plane,
  Shield,
  TrendingUp,
  MoreHorizontal,
} from 'lucide-vue-next';
import AuthLayout from '@/layouts/AuthLayout.vue';
import BudgetForm from '@/components/budgets/BudgetForm.vue';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
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
import { budgetService, type Budget } from '@/services/budget.service';

const router = useRouter();
const { toast } = useToast();

const budgets = ref<Budget[]>([]);
const loading = ref(false);
const isDialogOpen = ref(false);
const editingBudget = ref<Budget | null>(null);

const filters = ref({
  period: 'all',
  status: 'all',
  active_only: true,
});

const activeBudgets = computed(() => {
  return budgets.value.filter((b) => b.is_active);
});

const overBudgetCount = computed(() => {
  return budgets.value.filter((b) => b.is_over_budget).length;
});

const filteredBudgets = computed(() => {
  return budgets.value.filter((budget) => {
    if (filters.value.period !== 'all' && budget.period !== filters.value.period) {
      return false;
    }
    if (filters.value.active_only && !budget.is_active) {
      return false;
    }
    if (filters.value.status === 'under' && (budget.percentage_used || 0) >= 100) {
      return false;
    }
    if (filters.value.status === 'over' && !budget.is_over_budget) {
      return false;
    }
    if (filters.value.status === 'warning' && ((budget.percentage_used || 0) < 80 || budget.is_over_budget)) {
      return false;
    }
    return true;
  });
});

const fetchBudgets = async () => {
  try {
    loading.value = true;
    const response = await budgetService.getAll();
    budgets.value = response.budgets;
  } catch (error: any) {
    toast({
      title: 'Error',
      description: error.response?.data?.message || 'Failed to fetch budgets',
      variant: 'destructive',
    });
  } finally {
    loading.value = false;
  }
};

const openCreateDialog = () => {
  editingBudget.value = null;
  isDialogOpen.value = true;
};

const handleSubmit = async (formData: any) => {
  try {
    if (editingBudget.value) {
      await budgetService.update(editingBudget.value.id, formData);
      toast({
        title: 'Success',
        description: 'Budget updated successfully',
      });
    } else {
      await budgetService.create(formData);
      toast({
        title: 'Success',
        description: 'Budget created successfully',
      });
    }
    closeDialog();
    await fetchBudgets();
  } catch (error: any) {
    toast({
      title: 'Error',
      description: error.response?.data?.message || 'Operation failed',
      variant: 'destructive',
    });
  }
};

const editBudget = (budget: Budget) => {
  editingBudget.value = budget;
  isDialogOpen.value = true;
};

const deleteBudget = async (budget: Budget) => {
  if (!confirm(`Are you sure you want to delete the budget for "${budget.category.name}"?`)) {
    return;
  }

  try {
    await budgetService.delete(budget.id);
    toast({
      title: 'Success',
      description: 'Budget deleted successfully',
    });
    await fetchBudgets();
  } catch (error: any) {
    toast({
      title: 'Error',
      description: error.response?.data?.message || 'Failed to delete budget',
      variant: 'destructive',
    });
  }
};

const viewTransactions = (budget: Budget) => {
  router.push({
    path: '/transactions',
    query: { category_id: budget.category_id },
  });
};

const closeDialog = () => {
  isDialogOpen.value = false;
  editingBudget.value = null;
};

const resetFilters = () => {
  filters.value = {
    period: 'all',
    status: 'all',
    active_only: true,
  };
};

const formatNumber = (num: number) => {
  return new Intl.NumberFormat('en-IN').format(num);
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-IN', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const formatPeriod = (period: string) => {
  return period.charAt(0).toUpperCase() + period.slice(1);
};

const getProgressBarClass = (percentage: number) => {
  if (percentage >= 100) return 'bg-red-600';
  if (percentage >= 80) return 'bg-yellow-600';
  return 'bg-green-600';
};

const getCategoryIcon = (icon: string) => {
  const icons: Record<string, any> = {
    tag: Tag,
    utensils: Utensils,
    car: Car,
    'shopping-bag': ShoppingBag,
    film: Film,
    'file-text': FileText,
    heart: Heart,
    'book-open': BookOpen,
    home: Home,
    user: User,
    plane: Plane,
    shield: Shield,
    'trending-up': TrendingUp,
    'more-horizontal': MoreHorizontal,
  };
  return icons[icon] || Tag;
};

onMounted(() => {
  fetchBudgets();
});
</script>
