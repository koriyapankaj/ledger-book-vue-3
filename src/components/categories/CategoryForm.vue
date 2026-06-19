<template>
    <form @submit="onSubmit" class="space-y-4">
        <div class="grid gap-4 md:grid-cols-2">
            <FormField name="name" v-slot="{ field, errorMessage }">
                <Label for="name" :class="{ 'text-destructive': errorMessage }">Category Name <span
                        class="text-red-500">*</span></Label>
                <Input id="name" :model-value="field.value" @update:model-value="field.onChange"
                    placeholder="e.g., Food & Dining" :class="{ 'border-destructive': errorMessage }" />
            </FormField>

            <FormField name="type" v-slot="{ field, errorMessage }">
                <Label for="type" :class="{ 'text-destructive': errorMessage }">Type <span
                        class="text-red-500">*</span></Label>
                <Select :model-value="field.value" @update:model-value="(value) => onTypeChange(value, field)">
                    <SelectTrigger :class="{ 'border-destructive': errorMessage }">
                        <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="income">Income</SelectItem>
                        <SelectItem value="expense">Expense</SelectItem>
                    </SelectContent>
                </Select>
            </FormField>

            <FormField name="parent_id" v-slot="{ field, errorMessage }">
                <Label for="parent_id" :class="{ 'text-destructive': errorMessage }">Parent Category</Label>
                <Select :model-value="field.value ?? NONE_VALUE"
                    @update:model-value="(value) => field.onChange(value === NONE_VALUE ? null : value)">
                    <SelectTrigger :class="{ 'border-destructive': errorMessage }">
                        <SelectValue placeholder="None (Top-level category)" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem :value="NONE_VALUE">None</SelectItem>
                        <SelectItem v-for="parentCat in parentCategories" :key="parentCat.id"
                            :value="parentCat.id.toString()">
                            {{ parentCat.name }}
                        </SelectItem>
                    </SelectContent>
                </Select>
                <p class="text-xs text-muted-foreground">
                    Leave empty for a main category, or select a parent to create a subcategory
                </p>
            </FormField>

            <FormField name="order" v-slot="{ field, errorMessage }">
                <Label for="order" :class="{ 'text-destructive': errorMessage }">Display Order</Label>
                <Input id="order" :model-value="field.value" @update:model-value="field.onChange" type="number" min="0"
                    placeholder="0" :class="{ 'border-destructive': errorMessage }" />
            </FormField>

            <FormField name="color" v-slot="{ field, errorMessage }">
                <Label for="color" :class="{ 'text-destructive': errorMessage }">Color</Label>
                <div class="flex space-x-2">
                    <Input id="color_picker" :model-value="field.value" @update:model-value="field.onChange"
                        type="color" class="w-16 h-10" />
                    <Input :model-value="field.value" @update:model-value="field.onChange" placeholder="#3B82F6"
                        class="flex-1 font-mono uppercase" maxlength="7"
                        :class="{ 'border-destructive': errorMessage }" />
                </div>
            </FormField>

            <FormField name="icon" v-slot="{ field }">
                <Label for="icon">Icon</Label>
                <Select :model-value="field.value" @update:model-value="field.onChange">
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
            </FormField>
        </div>

        <FormField name="description" v-slot="{ field, errorMessage }">
            <Label for="description" :class="{ 'text-destructive': errorMessage }">Description</Label>
            <Textarea id="description" :model-value="field.value" @update:model-value="field.onChange"
                placeholder="Brief description of this category" rows="3"
                :class="{ 'border-destructive': errorMessage }" />
        </FormField>

        <FormField v-if="category" name="is_active" v-slot="{ field }">
            <div class="flex items-center space-x-2">
                <Checkbox id="is_active" :model-value="field.value === true"
                    @update:model-value="(value) => field.onChange(value === true)" />
                <Label for="is_active">Active</Label>
            </div>
        </FormField>

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
import { computed, watch, ref } from 'vue';
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/yup';
import * as yup from 'yup';
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
import { FormField } from '@/components/ui/form';
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

// Sentinel used by the reka-ui Select to represent "no parent" (it cannot use an empty string value).
const NONE_VALUE = '__none__';

const formSchema = toTypedSchema(yup.object({
    name: yup.string().required('Category name is required').max(255, 'Name must be 255 characters or less'),
    type: yup.string().oneOf(['income', 'expense'], 'Type must be income or expense').required('Category type is required'),
    parent_id: yup.string().nullable().optional(),
    color: yup.string().matches(/^#([0-9A-Fa-f]{3}){1,2}$/, 'Enter a valid hex color (e.g. #3B82F6)').default('#3B82F6'),
    icon: yup.string().default('tag'),
    order: yup.number()
        .transform((value, originalValue) => (String(originalValue).trim() === '' ? 0 : value))
        .typeError('Order must be a number')
        .min(0, 'Order must be 0 or more')
        .default(0),
    description: yup.string().nullable().max(1000, 'Description must be 1000 characters or less').optional(),
    is_active: yup.boolean().default(true),
}));

const defaultValues = {
    name: '',
    type: 'expense' as 'income' | 'expense',
    parent_id: null as string | null,
    color: '#3B82F6',
    icon: 'tag',
    order: 0,
    description: '',
    is_active: true,
};

const { handleSubmit, resetForm, values, setFieldValue } = useForm({
    validationSchema: formSchema,
    initialValues: defaultValues,
});

const parentCategories = computed(() => {
    return props.categories.filter(
        (cat) =>
            cat.type === values.type &&
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

// Changing the type makes a previously selected parent (of the other type) invalid, so clear it.
// This only runs on user interaction, not when loading an existing category.
const onTypeChange = (value: any, field: { onChange: (v: any) => void }) => {
    field.onChange(value);
    setFieldValue('parent_id', null);
};

watch(
    () => props.category,
    (category) => {
        if (category) {
            resetForm({
                values: {
                    name: category.name,
                    type: category.type,
                    parent_id: category.parent_id?.toString() ?? null,
                    color: category.color || '#3B82F6',
                    icon: category.icon || 'tag',
                    order: category.order ?? 0,
                    description: category.description || '',
                    is_active: category.is_active,
                },
            });
            return;
        }

        resetForm({ values: defaultValues });
    },
    { immediate: true }
);

const onSubmit = handleSubmit(async (formValues) => {
    if (submitting.value) return;

    submitting.value = true;
    try {
        const data: any = {
            name: formValues.name,
            type: formValues.type,
            color: formValues.color,
            icon: formValues.icon,
            order: formValues.order,
            description: formValues.description || null,
        };

        if (formValues.parent_id !== null && formValues.parent_id !== undefined && formValues.parent_id !== '') {
            data.parent_id = parseInt(formValues.parent_id as string);
        } else {
            data.parent_id = null;
        }

        if (props.category) {
            data.is_active = formValues.is_active;
        }

        emit('submit', data);
    } finally {
        submitting.value = false;
    }
});
</script>
