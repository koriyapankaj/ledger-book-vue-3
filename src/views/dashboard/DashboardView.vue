<template>
  <AuthLayout>
    <div class="space-y-6">
      <div>
        <h1 class="text-3xl font-bold">Dashboard</h1>
        <p class="text-muted-foreground">
          <Skeleton v-if="isLoading" class="h-4 w-48" />
          <span v-else>Welcome back, {{ authStore.user?.name }}!</span>
        </p>
      </div>

      <!-- Financial Summary Cards -->
      <div class="grid gap-4 md:grid-cols-3">
        <!-- Loading Skeletons -->
        <template v-if="isLoading">
          <Card v-for="i in 3" :key="i">
            <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton class="h-4 w-24" />
              <Skeleton class="h-4 w-4 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton class="h-8 w-32 mb-2" />
              <Skeleton class="h-3 w-24" />
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
                ₹{{ formatNumber(authStore.user?.financial_summary.total_assets || 0) }}
              </div>
              <p class="text-xs text-muted-foreground">
                Money you have
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle class="text-sm font-medium">Total Liabilities</CardTitle>
              <TrendingDown class="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div class="text-2xl font-bold text-red-600">
                ₹{{ formatNumber(authStore.user?.financial_summary.total_liabilities || 0) }}
              </div>
              <p class="text-xs text-muted-foreground">
                Money you owe
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle class="text-sm font-medium">Net Worth</CardTitle>
              <Wallet class="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div class="text-2xl font-bold text-primary">
                ₹{{ formatNumber(authStore.user?.financial_summary.net_worth || 0) }}
              </div>
              <p class="text-xs text-muted-foreground">
                Your total wealth
              </p>
            </CardContent>
          </Card>
        </template>
      </div>

      <!-- Quick Actions -->
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Manage your finances</CardDescription>
        </CardHeader>
        <CardContent class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <!-- Loading Skeletons -->
          <template v-if="isLoading">
            <Skeleton v-for="i in 4" :key="i" class="h-20 w-full rounded-md" />
          </template>

          <!-- Actual Buttons -->
          <template v-else>
            <Button @click="router.push('/transactions')" class="h-20">
              <div class="flex flex-col items-center space-y-2">
                <Plus class="h-6 w-6" />
                <span>Add Transaction</span>
              </div>
            </Button>

            <Button @click="router.push('/accounts')" variant="outline" class="h-20">
              <div class="flex flex-col items-center space-y-2">
                <Wallet class="h-6 w-6" />
                <span>Manage Accounts</span>
              </div>
            </Button>

            <Button @click="router.push('/categories')" variant="outline" class="h-20">
              <div class="flex flex-col items-center space-y-2">
                <Tags class="h-6 w-6" />
                <span>Categories</span>
              </div>
            </Button>

            <Button @click="router.push('/contacts')" variant="outline" class="h-20">
              <div class="flex flex-col items-center space-y-2">
                <Users class="h-6 w-6" />
                <span>Contacts</span>
              </div>
            </Button>
          </template>
        </CardContent>
      </Card>
    </div>
  </AuthLayout>
</template>
<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Plus,
  Tags,
  Users
} from 'lucide-vue-next';
import AuthLayout from '@/layouts/AuthLayout.vue';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();
const isLoading = ref(true);

const formatNumber = (num: number) => {
  return new Intl.NumberFormat('en-IN').format(num);
};

onMounted(async () => {
  // Fetch fresh user data from API
  if (authStore.isAuthenticated) {
    await authStore.fetchUser();
  }
  isLoading.value = false;
});

// Watch for auth store loading state
watch(() => authStore.loading, (newVal) => {
  isLoading.value = newVal;
});
</script>
