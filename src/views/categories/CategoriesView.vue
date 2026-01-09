<template>
  <AuthLayout>
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-3xl font-bold break-words">Categories</h1>
          <p class="text-muted-foreground">Organize your income and expenses</p>
        </div>
        <Dialog v-model:open="isDialogOpen">
          <DialogTrigger as-child>
            <Button class="w-full sm:w-auto">
              <Plus class="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent class="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{{ editingCategory ? 'Edit Category' : 'Create New Category' }}</DialogTitle>
              <DialogDescription>
                {{ editingCategory ? 'Update category details' : 'Add a new category' }}
              </DialogDescription>
            </DialogHeader>
            <CategoryForm :category="editingCategory" :categories="categories" @submit="handleSubmit"
              @cancel="closeDialog" />
          </DialogContent>
        </Dialog>
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
                <SelectValue placeholder="Category Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>

            <div class="flex items-center space-x-2">
              <Checkbox id="parent_only" v-model:checked="filters.parent_only" />
              <Label for="parent_only">Parent categories only</Label>
            </div>

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

      <!-- Categories Tabs -->
      <Tabs v-model="activeTab" class="w-full">
        <TabsList class="grid w-full grid-cols-2">
          <TabsTrigger value="income">
            <TrendingUp class="mr-2 h-4 w-4" />
            Income Categories
          </TabsTrigger>
          <TabsTrigger value="expense">
            <TrendingDown class="mr-2 h-4 w-4" />
            Expense Categories
          </TabsTrigger>
        </TabsList>

        <TabsContent value="income" class="space-y-4">
          <div v-if="loading" class="flex justify-center py-8">
            <Loader2 class="h-8 w-8 animate-spin" />
          </div>
          <div v-else-if="incomeCategories.length === 0" class="text-center py-8">
            <p class="text-muted-foreground">No income categories found</p>
          </div>
          <div v-else class="space-y-4">
            <CategoryCard v-for="category in incomeCategories" :key="category.id" :category="category"
              @edit="editCategory" @delete="deleteCategory" />
          </div>
        </TabsContent>

        <TabsContent value="expense" class="space-y-4">
          <div v-if="loading" class="flex justify-center py-8">
            <Loader2 class="h-8 w-8 animate-spin" />
          </div>
          <div v-else-if="expenseCategories.length === 0" class="text-center py-8">
            <p class="text-muted-foreground">No expense categories found</p>
          </div>
          <div v-else class="space-y-4">
            <CategoryCard v-for="category in expenseCategories" :key="category.id" :category="category"
              @edit="editCategory" @delete="deleteCategory" />
          </div>
        </TabsContent>
      </Tabs>
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
  X,
  Loader2,
} from 'lucide-vue-next';
import AuthLayout from '@/layouts/AuthLayout.vue';
import CategoryForm from '@/components/categories/CategoryForm.vue';
import CategoryCard from '@/components/categories/CategoryCard.vue';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { categoryService, type Category } from '@/services/category.service';

const { toast } = useToast();

const categories = ref<Category[]>([]);
const loading = ref(false);
const isDialogOpen = ref(false);
const editingCategory = ref<Category | null>(null);
const activeTab = ref('expense');

const filters = ref({
  type: 'all',
  parent_only: false,
  active_only: true,
});

const incomeCategories = computed(() => {
  return filterCategories(categories.value.filter((c) => c.type === 'income'));
});

const expenseCategories = computed(() => {
  return filterCategories(categories.value.filter((c) => c.type === 'expense'));
});

const filterCategories = (cats: Category[]) => {
  return cats.filter((category) => {
    if (filters.value.parent_only && category.parent_id) {
      return false;
    }
    if (filters.value.active_only && !category.is_active) {
      return false;
    }
    return true;
  });
};

const fetchCategories = async () => {
  try {
    loading.value = true;
    const response = await categoryService.getAll();
    categories.value = response.categories;
  } catch (error: any) {
    toast({
      title: 'Error',
      description: error.response?.data?.message || 'Failed to fetch categories',
      variant: 'destructive',
    });
  } finally {
    loading.value = false;
  }
};

const handleSubmit = async (formData: any) => {
  try {
    if (editingCategory.value) {
      await categoryService.update(editingCategory.value.id, formData);
      toast({
        title: 'Success',
        description: 'Category updated successfully',
      });
    } else {
      await categoryService.create(formData);
      toast({
        title: 'Success',
        description: 'Category created successfully',
      });
    }
    closeDialog();
    await fetchCategories();
  } catch (error: any) {
    toast({
      title: 'Error',
      description: error.response?.data?.message || 'Operation failed',
      variant: 'destructive',
    });
  }
};

const editCategory = (category: Category) => {
  editingCategory.value = category;
  isDialogOpen.value = true;
};

const deleteCategory = async (category: Category) => {
  if (!confirm(`Are you sure you want to delete "${category.name}"?`)) {
    return;
  }

  try {
    await categoryService.delete(category.id);
    toast({
      title: 'Success',
      description: 'Category deleted successfully',
    });
    await fetchCategories();
  } catch (error: any) {
    toast({
      title: 'Error',
      description: error.response?.data?.message || 'Failed to delete category',
      variant: 'destructive',
    });
  }
};

const closeDialog = () => {
  isDialogOpen.value = false;
  editingCategory.value = null;
};

const resetFilters = () => {
  filters.value = {
    type: 'all',
    parent_only: false,
    active_only: true,
  };
};

onMounted(() => {
  fetchCategories();
});

watch(isDialogOpen, (newValue) => {
  if (!newValue) {
    editingCategory.value = null;
  }
});
</script>
