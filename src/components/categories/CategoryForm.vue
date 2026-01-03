<template>
    <form @submit.prevent="handleSubmit" class="space-y-4">
        <div class="grid gap-4 md:grid-cols-2">
            <div class="space-y-2">
                <Label for="name">Category Name *</Label>
                <Input id="name" v-model="form.name" placeholder="e.g., Food & Dining" required />
            </div>

            <div class="space-y-2">
                <Label for="type">Type *</Label>
                <Select v-model="form.type" required>
                    <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="income">Income</SelectItem>
                        <SelectItem value="expense">Expense</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div class="space-y-2">
                <Label for="parent_id">Parent Category</Label>
                <Select v-model="form.parent_id">
                    <SelectTrigger>
                        <SelectValue placeholder="None (Top-level category)" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        <SelectItem v-for="parentCat in parentCategories" :key="parentCat.id"
                            :value="parentCat.id.toString()">
                            {{ parentCat.name }}
                        </SelectItem>
                    </SelectContent>
                </Select>
                <p class="text-xs text-muted-foreground">
                    Leave empty for a main category, or select a parent to create a subcategory
                </p>
            </div>

            <div class="space-y-2">
                <Label for="order">Display Order</Label>
                <Input id="order" v-model.number="form.order" type="number" min="0" placeholder="0" />
            </div>

            <div class="space-y-2">
                <Label for="color">Color</Label>
                <div class="flex space-x-2">
                    <Input id="color" v-model="form.color" type="color" class="w-16 h-10" />
                    <Input v-model="form.color" placeholder="#3B82F6" class="flex-1" />
                </div>
            </div>

            <div class="space-y-2">
                <Label for="icon">Icon</Label>
                <Select v-model="form.icon">
                    <SelectTrigger>
                        <SelectValue placeholder="Select icon" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem v-for="iconOption in iconOptions" :key="iconOption.value" :value="iconOption.value">
                            <div class="flex items-center">
                                <component :is="iconOption.icon" class="mr-2 h-4 w-4" />
                                {{ iconOption.label }}
                            </div>
                        </SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>

        <div class="space-y-2">
            <Label for="description">Description</Label>
            <Textarea id="description" v-model="form.description" placeholder="Brief description of this category"
                rows="3" />
        </div>

        <div v-if="category" class="flex items-center space-x-2">
            <Checkbox id="is_active" v-model:checked="form.is_active" />
            <Label for="is_active">Active</Label>
        </div>

        <div class="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" @click="$emit('cancel')">
                Cancel
            </Button>
            <Button type="submit" :disabled="submitting">
                <Loader2 v-if="submitting" class="mr-2 h-4 w-4 animate-spin" />
                {{ category ? 'Update' : 'Create' }} Category
            </Button>
        </div>
    </form>
</template>

<script setup lang="ts">
import { reactive, computed, watch, ref } from 'vue';
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
    Briefcase,
    Laptop,
    Building,
    DollarSign,
    Coffee,
    Zap,
    Smartphone,
    Wifi,
    Droplet,
    Flame,
} from 'lucide-vue-next';
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
import type { Category } from '@/services/category.service';

const props = defineProps<{
    category?: Category | null;
    categories: Category[];
}>();

const emit = defineEmits<{
    submit: [data: any];
    cancel: [];
}>();

const submitting = ref(false);

const form = reactive({
    name: '',
    type: 'expense' as 'income' | 'expense',
    parent_id: '',
    color: '#3B82F6',
    icon: 'tag',
    order: 0,
    description: '',
    is_active: true,
});

const parentCategories = computed(() => {
    return props.categories.filter(
        (cat) =>
            cat.type === form.type &&
            !cat.parent_id &&
            (!props.category || cat.id !== props.category.id)
    );
});

const iconOptions = [
    { value: 'tag', label: 'Tag', icon: Tag },
    { value: 'utensils', label: 'Utensils', icon: Utensils },
    { value: 'coffee', label: 'Coffee', icon: Coffee },
    { value: 'car', label: 'Car', icon: Car },
    { value: 'shopping-bag', label: 'Shopping Bag', icon: ShoppingBag },
    { value: 'film', label: 'Film', icon: Film },
    { value: 'file-text', label: 'File', icon: FileText },
    { value: 'heart', label: 'Heart', icon: Heart },
    { value: 'book-open', label: 'Book', icon: BookOpen },
    { value: 'home', label: 'Home', icon: Home },
    { value: 'user', label: 'User', icon: User },
    { value: 'plane', label: 'Plane', icon: Plane },
    { value: 'shield', label: 'Shield', icon: Shield },
    { value: 'trending-up', label: 'Trending', icon: TrendingUp },
    { value: 'briefcase', label: 'Briefcase', icon: Briefcase },
    { value: 'laptop', label: 'Laptop', icon: Laptop },
    { value: 'store', label: 'Store', icon: Building },
    { value: 'dollar-sign', label: 'Dollar', icon: DollarSign },
    { value: 'zap', label: 'Electricity', icon: Zap },
    { value: 'smartphone', label: 'Phone', icon: Smartphone },
    { value: 'wifi', label: 'Wifi', icon: Wifi },
    { value: 'droplet', label: 'Water', icon: Droplet },
    { value: 'flame', label: 'Gas', icon: Flame },
    { value: 'more-horizontal', label: 'More', icon: MoreHorizontal },
];

watch(
    () => props.category,
    (category) => {
        if (category) {
            Object.assign(form, {
                name: category.name,
                type: category.type,
                parent_id: category.parent_id?.toString() || '',
                color: category.color,
                icon: category.icon,
                order: category.order,
                description: category.description || '',
                is_active: category.is_active,
            });
        }
    },
    { immediate: true }
);

const handleSubmit = async () => {
    submitting.value = true;
    try {
        const data: any = {
            name: form.name,
            type: form.type,
            color: form.color,
            icon: form.icon,
            order: form.order,
            description: form.description || null,
        };

        if (form.parent_id) {
            data.parent_id = parseInt(form.parent_id);
        }

        if (props.category) {
            data.is_active = form.is_active;
        }

        emit('submit', data);
    } finally {
        submitting.value = false;
    }
};
</script>