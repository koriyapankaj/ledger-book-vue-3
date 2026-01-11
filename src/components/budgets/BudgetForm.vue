<template>
    <form @submit.prevent="handleSubmit" class="space-y-4">
        <div class="grid gap-4 md:grid-cols-2">
            <!-- Category Selection -->
            <div class="space-y-2 md:col-span-2">
                <Label for="category_id">Category *</Label>
                <Select
                    :model-value="form.category_id"
                    @update:model-value="handleCategoryChange"
                    required
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                        <div v-for="category in expenseCategories" :key="category.id">
                            <!-- Parent Category -->
                            <SelectItem :value="category.id.toString()" class="font-semibold">
                                <div class="flex items-center justify-between w-full">
                                    <div class="flex items-center">
                                        <component :is="getCategoryIcon(category.icon)" class="mr-2 h-4 w-4" />
                                        {{ category.name }}
                                    </div>
                                    <Badge v-if="category.has_children" variant="outline" class="ml-2 text-xs">
                                        Has subcategories
                                    </Badge>
                                </div>
                            </SelectItem>
                            <!-- Child Categories -->
                            <SelectItem
                                v-for="child in category.children"
                                :key="child.id"
                                :value="child.id.toString()"
                                class="pl-8"
                            >
                                {{ child.name }}
                            </SelectItem>
                        </div>
                    </SelectContent>
                </Select>
                <p class="text-xs text-muted-foreground">
                    Select the expense category you want to set a budget for
                </p>
            </div>

            <!-- Include Subcategories Checkbox (Only for parent categories with children) -->
            <div v-if="selectedCategoryHasChildren" class="md:col-span-2 space-y-2">
                <div class="flex items-start space-x-3 p-4 rounded-lg border-2 border-dashed bg-muted/50 hover:bg-muted/80 transition-colors">
                    <Checkbox
                        id="include_subcategories"
                        :checked="form.include_subcategories"
                        @update:checked="form.include_subcategories = $event"
                        class="mt-1"
                    />
                    <div class="flex-1 space-y-1.5">
                        <Label for="include_subcategories" class="text-sm font-medium cursor-pointer flex items-center">
                            <Layers class="w-4 h-4 mr-2" />
                            Include subcategory expenses
                        </Label>
                        <p class="text-xs text-muted-foreground leading-relaxed">
                            When enabled, expenses from all subcategories will count toward this budget.
                        </p>
                        <div v-if="form.include_subcategories && subcategoryNames" class="mt-2 pt-2 border-t">
                            <p class="text-xs font-medium text-foreground mb-1">Included subcategories:</p>
                            <div class="flex flex-wrap gap-1">
                                <Badge
                                    v-for="(name, index) in subcategoryNamesList"
                                    :key="index"
                                    variant="secondary"
                                    class="text-xs"
                                >
                                    {{ name }}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Amount -->
            <div class="space-y-2">
                <Label for="amount">Budget Amount *</Label>
                <div class="relative">
                    <span class="absolute left-3 top-2.5 text-muted-foreground">₹</span>
                    <Input
                        id="amount"
                        v-model.number="form.amount"
                        type="number"
                        step="0.01"
                        min="0.01"
                        class="pl-8"
                        placeholder="0.00"
                        required
                    />
                </div>
            </div>

            <!-- Period -->
            <div class="space-y-2">
                <Label for="period">Period *</Label>
                <Select
                    :model-value="form.period"
                    @update:model-value="(value) => form.period = value as 'daily' | 'weekly' | 'monthly' | 'yearly'"
                    required
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <!-- Start Date -->
            <div class="space-y-2">
                <Label for="start_date">Start Date *</Label>
                <Input id="start_date" v-model="form.start_date" type="date" required />
            </div>

            <!-- End Date -->
            <div class="space-y-2">
                <Label for="end_date">End Date</Label>
                <Input id="end_date" v-model="form.end_date" type="date" :min="form.start_date" />
                <p class="text-xs text-muted-foreground">
                    Leave empty for recurring budget
                </p>
            </div>
        </div>

        <!-- Active Checkbox (only when editing) -->
        <div v-if="budget" class="flex items-center space-x-2">
            <Checkbox id="is_active" :checked="form.is_active" @update:checked="form.is_active = $event" />
            <Label for="is_active">Active</Label>
        </div>

        <!-- Budget Preview -->
        <Card class="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardHeader>
                <CardTitle class="text-sm flex items-center">
                    <Eye class="w-4 h-4 mr-2" />
                    Budget Summary
                </CardTitle>
            </CardHeader>
            <CardContent class="space-y-3 text-sm">
                <div class="flex justify-between items-start">
                    <span class="text-muted-foreground">Category:</span>
                    <div class="text-right">
                        <span class="font-medium">{{ getSelectedCategoryName() }}</span>
                        <div v-if="form.include_subcategories && subcategoryNames" class="mt-1">
                            <Badge variant="outline" class="text-xs">
                                + {{ subcategoryCount }} subcategories
                            </Badge>
                        </div>
                    </div>
                </div>

                <div v-if="form.include_subcategories && subcategoryNames" class="flex justify-between items-start">
                    <span class="text-muted-foreground text-xs">Includes:</span>
                    <span class="font-medium text-xs text-right max-w-[200px]">{{ subcategoryNames }}</span>
                </div>

                <Separator />

                <div class="flex justify-between items-center">
                    <span class="text-muted-foreground">Budget Amount:</span>
                    <span class="font-bold text-xl text-primary">₹{{ formatNumber(form.amount || 0) }}</span>
                </div>

                <div class="flex justify-between">
                    <span class="text-muted-foreground">Period:</span>
                    <span class="font-medium">{{ formatPeriod(form.period) }}</span>
                </div>

                <div class="flex justify-between">
                    <span class="text-muted-foreground">Duration:</span>
                    <span class="font-medium text-xs">
                        {{ form.start_date }}
                        <span v-if="form.end_date"> to {{ form.end_date }}</span>
                        <span v-else class="text-muted-foreground"> (recurring)</span>
                    </span>
                </div>

                <Separator />

                <Alert class="border-yellow-500/50 bg-yellow-500/10">
                    <AlertCircle class="h-4 w-4 text-yellow-600" />
                    <AlertDescription class="text-xs text-yellow-600">
                        You'll receive notifications at 80% and 100% of this budget
                    </AlertDescription>
                </Alert>
            </CardContent>
        </Card>

        <!-- Action Buttons -->
        <div class="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" @click="$emit('cancel')" :disabled="submitting">
                Cancel
            </Button>
            <Button type="submit" :disabled="submitting || !isFormValid">
                <Loader2 v-if="submitting" class="mr-2 h-4 w-4 animate-spin" />
                {{ budget ? 'Update' : 'Create' }} Budget
            </Button>
        </div>
    </form>
</template>

<script setup lang="ts">
import { reactive, computed, watch, onMounted, ref } from 'vue';
import {
    Loader2,
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
    Layers,
    Eye,
    AlertCircle,
} from 'lucide-vue-next';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { AcceptableValue } from 'reka-ui';
import type { Budget } from '@/services/budget.service';
import { categoryService, type Category } from '@/services/category.service';

const props = defineProps<{
    budget?: Budget | null;
}>();

const emit = defineEmits<{
    submit: [data: any];
    cancel: [];
}>();

const submitting = ref(false);
const categories = ref<Category[]>([]);

const today = new Date().toISOString().split('T')[0];

const form = reactive({
    category_id: '',
    amount: 0,
    period: 'monthly' as 'daily' | 'weekly' | 'monthly' | 'yearly',
    start_date: today,
    end_date: '',
    include_subcategories: false,
    is_active: true,
});

const expenseCategories = computed(() => {
    return categories.value.filter((cat) => cat.type === 'expense' && !cat.parent_id);
});

const selectedCategory = computed(() => {
    if (!form.category_id) return null;

    // Check parent categories
    const parent = categories.value.find((c) => c.id.toString() === form.category_id);
    if (parent) return parent;

    // Check child categories
    for (const category of categories.value) {
        if (category.children) {
            const child = category.children.find((c) => c.id.toString() === form.category_id);
            if (child) return child;
        }
    }

    return null;
});

const selectedCategoryHasChildren = computed(() => {
    if (!selectedCategory.value) return false;
    // Only show checkbox for parent categories that have children
    return selectedCategory.value.has_children && !selectedCategory.value.parent_id;
});

const subcategoryNames = computed(() => {
    if (!selectedCategory.value || !selectedCategory.value.children) return '';
    return selectedCategory.value.children.map((c) => c.name).join(', ');
});

const subcategoryNamesList = computed(() => {
    if (!selectedCategory.value || !selectedCategory.value.children) return [];
    return selectedCategory.value.children.map((c) => c.name);
});

const subcategoryCount = computed(() => {
    if (!selectedCategory.value || !selectedCategory.value.children) return 0;
    return selectedCategory.value.children.length;
});

const isFormValid = computed(() => {
    return form.category_id && form.amount > 0 && form.period && form.start_date;
});

const fetchCategories = async () => {
    try {
        const response = await categoryService.getAll({ type: 'expense', active_only: true });
        categories.value = response.categories;
    } catch (error) {
        console.error('Failed to fetch categories', error);
    }
};

// FIX: Updated type signature to accept AcceptableValue from reka-ui
const handleCategoryChange = (value: AcceptableValue) => {
    const stringValue = value !== null && value !== undefined ? String(value) : '';
    form.category_id = stringValue;

    // Reset include_subcategories when changing category
    const category = categories.value.find((c) => c.id.toString() === stringValue);

    // If it's a child category or parent without children, disable subcategories checkbox
    if (!category || !category.has_children || category.parent_id) {
        form.include_subcategories = false;
    }
};

const getSelectedCategoryName = () => {
    const category = categories.value.find((c) => c.id.toString() === form.category_id);
    if (category) return category.name;

    for (const parent of categories.value) {
        if (parent.children) {
            const child = parent.children.find((c) => c.id.toString() === form.category_id);
            if (child) return child.name;
        }
    }

    return 'Not selected';
};

const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-IN').format(num);
};

const formatPeriod = (period: string) => {
    return period.charAt(0).toUpperCase() + period.slice(1);
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

watch(
    () => props.budget,
    (budget) => {
        if (budget) {
            form.category_id = budget.category_id.toString();
            form.amount = budget.amount;
            form.period = budget.period;
            form.start_date = budget.start_date;
            form.end_date = budget.end_date || '';
            form.include_subcategories = budget.include_subcategories || false;
            form.is_active = budget.is_active;
        } else {
            // Reset form for new budget
            form.category_id = '';
            form.amount = 0;
            form.period = 'monthly';
            form.start_date = today;
            form.end_date = '';
            form.include_subcategories = false;
            form.is_active = true;
        }
    },
    { immediate: true }
);

const handleSubmit = async () => {
    if (!isFormValid.value) return;

    submitting.value = true;
    try {
        const data: any = {
            category_id: parseInt(form.category_id),
            amount: form.amount,
            period: form.period,
            start_date: form.start_date,
            end_date: form.end_date || null,
            include_subcategories: Boolean(form.include_subcategories),
        };

        if (props.budget) {
            data.is_active = form.is_active;
        }

        emit('submit', data);
    } finally {
        submitting.value = false;
    }
};

onMounted(() => {
    fetchCategories();
});
</script>
