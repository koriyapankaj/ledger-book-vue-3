<template>
  <aside
    class="hidden md:flex fixed left-0 top-16 h-[calc(100vh-4rem)] border-r bg-background transition-all duration-300 z-40 flex-col"
    :class="sidebarStore.isCollapsed ? 'w-16' : 'w-64'">

    <div class="flex items-center justify-end p-4">
      <Button variant="ghost" size="icon" @click="sidebarStore.toggle()">
        <ChevronLeft v-if="!sidebarStore.isCollapsed" class="h-4 w-4" />
        <ChevronRight v-else class="h-4 w-4" />
      </Button>
    </div>

    <nav class="flex-1 space-y-1 px-2">
      <router-link v-for="item in navigation" :key="item.name" :to="item.path" v-slot="{ isActive }">
        <div
          class="flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors cursor-pointer"
          :class="[
            isActive
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
          ]">
          <component :is="item.icon" class="h-5 w-5 flex-shrink-0" />
          <span v-if="!sidebarStore.isCollapsed">{{ item.name }}</span>
        </div>
      </router-link>
    </nav>

    <div v-if="!sidebarStore.isCollapsed && authStore.user" class="border-t p-4 space-y-2">
      <p class="text-xs font-semibold text-muted-foreground">FINANCIAL SUMMARY</p>
      <div class="space-y-1 text-sm">
        <div class="flex justify-between">
          <span class="text-muted-foreground">Assets:</span>
          <span class="font-medium text-green-600">
            ₹{{ formatNumber(authStore.user.financial_summary.total_assets) }}
          </span>
        </div>
        <div class="flex justify-between">
          <span class="text-muted-foreground">Liabilities:</span>
          <span class="font-medium text-red-600">
            ₹{{ formatNumber(authStore.user.financial_summary.total_liabilities) }}
          </span>
        </div>
        <Separator class="my-2" />
        <div class="flex justify-between">
          <span class="font-medium">Net Worth:</span>
          <span class="font-bold text-primary">
            ₹{{ formatNumber(authStore.user.financial_summary.net_worth) }}
          </span>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import {
  LayoutDashboard,
  Wallet,
  ArrowLeftRight,
  Tags,
  Users,
  ChevronLeft,
  ChevronRight,
  Target,
} from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAuthStore } from '@/stores/auth';
import { useSidebarStore } from '@/stores/sidebar';

const authStore = useAuthStore();
const sidebarStore = useSidebarStore();

const navigation = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Accounts', path: '/accounts', icon: Wallet },
  { name: 'Transactions', path: '/transactions', icon: ArrowLeftRight },
  { name: 'Categories', path: '/categories', icon: Tags },
  { name: 'Contacts', path: '/contacts', icon: Users },
  { name: 'Budgets', path: '/budgets', icon: Target },
];

const formatNumber = (num: number) => {
  return new Intl.NumberFormat('en-IN').format(num);
};
</script>
