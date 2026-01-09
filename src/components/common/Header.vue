<template>
  <header
    class="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
    <div class="container flex h-16 items-center justify-between px-4">
      <div class="flex items-center space-x-4">

        <Sheet v-model:open="isMobileMenuOpen">
          <SheetTrigger as-child>
            <Button variant="ghost" size="icon" class="md:hidden mr-2">
              <Menu class="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" class="w-[280px] sm:w-[350px] pr-6">
            <div class="flex flex-col h-full py-4">
              <div class="px-2 mb-6">
                <h2 class="text-lg font-bold flex items-center gap-2">
                  <Wallet class="h-6 w-6 text-primary" />
                  Ledger Book
                </h2>
              </div>
              <nav class="flex-1 space-y-1">
                <router-link v-for="item in navigation" :key="item.name" :to="item.path" v-slot="{ isActive }"
                  @click="isMobileMenuOpen = false">
                  <div class="flex items-center space-x-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors"
                    :class="[
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                    ]">
                    <component :is="item.icon" class="h-5 w-5" />
                    <span>{{ item.name }}</span>
                  </div>
                </router-link>
              </nav>
            </div>
          </SheetContent>
        </Sheet>

        <router-link to="/dashboard" class="flex items-center space-x-2">
          <Wallet class="h-6 w-6 text-primary hidden md:block" />
          <span class="text-xl font-bold hidden md:inline">Ledger Book</span>
        </router-link>
      </div>

      <div class="flex items-center space-x-4">
        <!-- Theme Toggle -->
        <Button variant="ghost" size="icon" @click="themeStore.toggleTheme()">
          <Sun v-if="themeStore.theme === 'dark'" class="h-5 w-5" />
          <Moon v-else class="h-5 w-5" />
        </Button>

        <!-- User Menu -->
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button variant="ghost" class="relative h-10 w-10 rounded-full">
              <Avatar>
                <AvatarFallback>
                  {{ userInitials }}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" class="w-56">
            <DropdownMenuLabel>
              <div class="flex flex-col space-y-1">
                <p class="text-sm font-medium">{{ authStore.user?.name }}</p>
                <p class="text-xs text-muted-foreground">{{ authStore.user?.email }}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem @click="router.push('/dashboard')">
              <LayoutDashboard class="mr-2 h-4 w-4" />
              Dashboard
            </DropdownMenuItem>
            <DropdownMenuItem @click="router.push('/accounts')">
              <CreditCard class="mr-2 h-4 w-4" />
              Accounts
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem @click="handleLogout">
              <LogOut class="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  Wallet,
  Sun,
  Moon,
  LogOut,
  LayoutDashboard,
  CreditCard,
  Menu,
  ArrowLeftRight,
  Tags,
  Users,
  Target
} from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useAuthStore } from '@/stores/auth';
import { useThemeStore } from '@/stores/theme';

const router = useRouter();
const authStore = useAuthStore();
const themeStore = useThemeStore();
const isMobileMenuOpen = ref(false);

const navigation = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Accounts', path: '/accounts', icon: Wallet },
  { name: 'Transactions', path: '/transactions', icon: ArrowLeftRight },
  { name: 'Categories', path: '/categories', icon: Tags },
  { name: 'Contacts', path: '/contacts', icon: Users },
  { name: 'Budgets', path: '/budgets', icon: Target },
];

const userInitials = computed(() => {
  const name = authStore.user?.name || '';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
});

const handleLogout = () => {
  authStore.logout();
};
</script>
