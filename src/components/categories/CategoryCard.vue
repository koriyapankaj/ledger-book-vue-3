<template>
    <Card>
        <CardHeader>
            <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                    <div class="p-3 rounded-lg" :style="{ backgroundColor: category.color + '20' }">
                        <component :is="getCategoryIcon(category.icon)" class="h-6 w-6"
                            :style="{ color: category.color }" />
                    </div>
                    <div>
                        <CardTitle class="flex items-center space-x-2">
                            <span>{{ category.name }}</span>
                            <Badge v-if="!category.is_active" variant="secondary">Inactive</Badge>
                        </CardTitle>
                        <p v-if="category.description" class="text-sm text-muted-foreground mt-1">
                            {{ category.description }}
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
                        <DropdownMenuItem @click="$emit('edit', category)">
                            <Pencil class="mr-2 h-4 w-4" />
                            Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem @click="$emit('delete', category)" class="text-destructive">
                            <Trash2 class="mr-2 h-4 w-4" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </CardHeader>

        <!-- Subcategories -->
        <CardContent v-if="category.children && category.children.length > 0">
            <div class="space-y-2">
                <p class="text-sm font-medium text-muted-foreground">Subcategories:</p>
                <div class="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                    <div v-for="child in category.children" :key="child.id"
                        class="flex items-center space-x-2 p-2 rounded-md border bg-card hover:bg-accent cursor-pointer transition-colors"
                        @click="$emit('edit', child)">
                        <div class="p-1.5 rounded" :style="{ backgroundColor: child.color + '20' }">
                            <component :is="getCategoryIcon(child.icon)" class="h-4 w-4"
                                :style="{ color: child.color }" />
                        </div>
                        <span class="text-sm">{{ child.name }}</span>
                        <Badge v-if="!child.is_active" variant="secondary" class="ml-auto text-xs">
                            Inactive
                        </Badge>
                    </div>
                </div>
            </div>
        </CardContent>
    </Card>
</template>

<script setup lang="ts">
import {
    MoreVertical,
    Pencil,
    Trash2,
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
    DollarSign,
    Building,
} from 'lucide-vue-next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Category } from '@/services/category.service';

defineProps<{
    category: Category;
}>();

defineEmits<{
    edit: [category: Category];
    delete: [category: Category];
}>();

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
        briefcase: Briefcase,
        laptop: Laptop,
        store: Building,
        'dollar-sign': DollarSign,
    };
    return icons[icon] || Tag;
};
</script>