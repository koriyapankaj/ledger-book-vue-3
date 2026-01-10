<template>
  <AuthLayout>
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-3xl font-bold break-words">Contacts</h1>
          <p class="text-muted-foreground">Track people you lend to or borrow from</p>
        </div>
        <Dialog v-model:open="isDialogOpen">
          <DialogTrigger as-child>
            <Button class="w-full sm:w-auto">
              <Plus class="mr-2 h-4 w-4" />
              Add Contact
            </Button>
          </DialogTrigger>
          <DialogContent class="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{{ editingContact ? 'Edit Contact' : 'Create New Contact' }}</DialogTitle>
              <DialogDescription>
                {{ editingContact ? 'Update contact details' : 'Add a new contact for debt tracking' }}
              </DialogDescription>
            </DialogHeader>
            <ContactForm :contact="editingContact" @submit="handleSubmit" @cancel="closeDialog" />
          </DialogContent>
        </Dialog>
      </div>

      <!-- Summary Cards -->
      <div class="grid gap-4 md:grid-cols-4">
        <!-- Loading Skeletons -->
        <template v-if="loading">
          <Card v-for="i in 4" :key="i">
            <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton class="h-4 w-28" />
              <Skeleton class="h-4 w-4 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton class="h-8 w-20" />
            </CardContent>
          </Card>
        </template>

        <!-- Actual Cards -->
        <template v-else>
          <Card>
            <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle class="text-sm font-medium">Total Contacts</CardTitle>
              <Users class="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div class="text-2xl font-bold">
                {{ summary?.contacts_count || 0 }}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle class="text-sm font-medium">They Owe You</CardTitle>
              <TrendingUp class="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div class="text-2xl font-bold text-green-600">
                ₹{{ formatNumber(summary?.total_owed_to_you || 0) }}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle class="text-sm font-medium">You Owe Them</CardTitle>
              <TrendingDown class="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div class="text-2xl font-bold text-red-600">
                ₹{{ formatNumber(summary?.total_you_owe || 0) }}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle class="text-sm font-medium">Net Position</CardTitle>
              <Wallet class="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div class="text-2xl font-bold"
                :class="(summary?.net_position || 0) >= 0 ? 'text-green-600' : 'text-red-600'">
                ₹{{ formatNumber(summary?.net_position || 0) }}
              </div>
            </CardContent>
          </Card>
        </template>
      </div>

      <!-- Filters -->
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="flex flex-wrap gap-4">
            <Select v-model="filters.status">
              <SelectTrigger class="w-[180px]">
                <SelectValue placeholder="Balance Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Contacts</SelectItem>
                <SelectItem value="owes_you">Owes You</SelectItem>
                <SelectItem value="you_owe">You Owe</SelectItem>
                <SelectItem value="settled">Settled</SelectItem>
              </SelectContent>
            </Select>

            <Input v-model="filters.search" placeholder="Search contacts..." class="max-w-sm" />

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

      <!-- Contacts List -->
      <div v-if="loading" class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card v-for="i in 6" :key="i" class="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div class="flex items-start justify-between">
              <div class="flex items-center space-x-3">
                <Skeleton class="h-10 w-10 rounded-full" />
                <div class="space-y-2">
                  <Skeleton class="h-5 w-32" />
                  <div class="flex items-center space-x-2">
                    <Skeleton class="h-5 w-20 rounded-full" />
                  </div>
                </div>
              </div>
              <Skeleton class="h-8 w-8 rounded-md" />
            </div>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="space-y-2">
              <Skeleton class="h-4 w-full" />
              <Skeleton class="h-4 w-3/4" />
            </div>
            <div class="flex justify-between items-center pt-2 border-t">
              <Skeleton class="h-4 w-20" />
              <Skeleton class="h-6 w-24" />
            </div>
            <Skeleton class="h-9 w-full rounded-md" />
          </CardContent>
        </Card>
      </div>

      <div v-else-if="filteredContacts.length === 0" class="text-center py-8">
        <p class="text-muted-foreground">No contacts found</p>
      </div>

      <div v-else class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card v-for="contact in filteredContacts" :key="contact.id" class="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div class="flex items-start justify-between">
              <div class="flex items-center space-x-3">
                <Avatar>
                  <AvatarFallback>
                    {{ getInitials(contact.name) }}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle class="text-lg">{{ contact.name }}</CardTitle>
                  <div class="flex items-center space-x-2 mt-1">
                    <Badge :variant="getBalanceBadgeVariant(contact.balance_status)">
                      {{ getBalanceStatusText(contact.balance_status) }}
                    </Badge>
                    <Badge v-if="!contact.is_active" variant="secondary">Inactive</Badge>
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
                  <DropdownMenuItem @click="editContact(contact)">
                    <Pencil class="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem @click="viewTransactions(contact)">
                    <Eye class="mr-2 h-4 w-4" />
                    View Transactions
                  </DropdownMenuItem>
                  <DropdownMenuItem @click="deleteContact(contact)" class="text-destructive"
                    :disabled="contact.balance !== 0">
                    <Trash2 class="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>

          <CardContent class="space-y-3">
            <!-- Balance Display -->
            <div class="flex justify-between items-center p-3 rounded-lg bg-muted">
              <span class="text-sm text-muted-foreground">Balance:</span>
              <span class="text-xl font-bold" :class="getBalanceClass(contact.balance)">
                {{ getBalanceText(contact.balance) }}
              </span>
            </div>

            <!-- Contact Info -->
            <div class="space-y-2 text-sm">
              <div v-if="contact.email" class="flex items-center space-x-2 text-muted-foreground">
                <Mail class="h-4 w-4" />
                <span>{{ contact.email }}</span>
              </div>
              <div v-if="contact.phone" class="flex items-center space-x-2 text-muted-foreground">
                <Phone class="h-4 w-4" />
                <span>{{ contact.phone }}</span>
              </div>
              <div v-if="contact.notes" class="flex items-start space-x-2 text-muted-foreground">
                <FileText class="h-4 w-4 mt-0.5" />
                <span class="text-xs">{{ contact.notes }}</span>
              </div>
            </div>

            <!-- Quick Actions -->
            <div v-if="contact.balance !== 0" class="pt-2 border-t">
              <Button v-if="contact.balance > 0" variant="outline" size="sm" class="w-full"
                @click="recordRepayment(contact, 'in')">
                <ArrowDownCircle class="mr-2 h-4 w-4" />
                Record Repayment
              </Button>
              <Button v-else variant="outline" size="sm" class="w-full" @click="recordRepayment(contact, 'out')">
                <ArrowUpCircle class="mr-2 h-4 w-4" />
                Pay Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </AuthLayout>
</template>
<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from '@/components/ui/toast/use-toast';
import {
  Plus,
  Users,
  TrendingUp,
  TrendingDown,
  Wallet,
  X,
  MoreVertical,
  Pencil,
  Trash2,
  Eye,
  Mail,
  Phone,
  FileText,
  ArrowDownCircle,
  ArrowUpCircle,
} from 'lucide-vue-next';
import AuthLayout from '@/layouts/AuthLayout.vue';
import ContactForm from '@/components/contacts/ContactForm.vue';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
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
  contactService,
  type Contact,
  type ContactSummary,
} from '@/services/contact.service';

const router = useRouter();
const { toast } = useToast();

const contacts = ref<Contact[]>([]);
const summary = ref<ContactSummary | null>(null);
const loading = ref(false);
const isDialogOpen = ref(false);
const editingContact = ref<Contact | null>(null);

const filters = ref({
  status: 'all',
  search: '',
  active_only: true,
});

const filteredContacts = computed(() => {
  return contacts.value.filter((contact) => {
    if (filters.value.status !== 'all' && contact.balance_status !== filters.value.status) {
      return false;
    }
    if (filters.value.active_only && !contact.is_active) {
      return false;
    }
    if (filters.value.search) {
      const search = filters.value.search.toLowerCase();
      return (
        contact.name.toLowerCase().includes(search) ||
        contact.email?.toLowerCase().includes(search) ||
        contact.phone?.toLowerCase().includes(search)
      );
    }
    return true;
  });
});

const fetchContacts = async () => {
  try {
    loading.value = true;
    const response = await contactService.getAll();
    contacts.value = response.contacts;
  } catch (error: any) {
    toast({
      title: 'Error',
      description: error.response?.data?.message || 'Failed to fetch contacts',
      variant: 'destructive',
    });
  } finally {
    loading.value = false;
  }
};

const fetchSummary = async () => {
  try {
    const response = await contactService.getSummary();
    summary.value = response.summary;
  } catch (error) {
    console.error('Failed to fetch summary', error);
  }
};

const handleSubmit = async (formData: any) => {
  try {
    if (editingContact.value) {
      await contactService.update(editingContact.value.id, formData);
      toast({
        title: 'Success',
        description: 'Contact updated successfully',
      });
    } else {
      await contactService.create(formData);
      toast({
        title: 'Success',
        description: 'Contact created successfully',
      });
    }
    closeDialog();
    await fetchContacts();
    await fetchSummary();
  } catch (error: any) {
    toast({
      title: 'Error',
      description: error.response?.data?.message || 'Operation failed',
      variant: 'destructive',
    });
  }
};

const editContact = (contact: Contact) => {
  editingContact.value = contact;
  isDialogOpen.value = true;
};

const deleteContact = async (contact: Contact) => {
  if (contact.balance !== 0) {
    toast({
      title: 'Cannot Delete',
      description: 'Cannot delete contact with unsettled balance',
      variant: 'destructive',
    });
    return;
  }

  if (!confirm(`Are you sure you want to delete "${contact.name}"?`)) {
    return;
  }

  try {
    await contactService.delete(contact.id);
    toast({
      title: 'Success',
      description: 'Contact deleted successfully',
    });
    await fetchContacts();
    await fetchSummary();
  } catch (error: any) {
    toast({
      title: 'Error',
      description: error.response?.data?.message || 'Failed to delete contact',
      variant: 'destructive',
    });
  }
};

const viewTransactions = (contact: Contact) => {
  router.push({
    path: '/transactions',
    query: { contact_id: contact.id },
  });
};

const recordRepayment = (contact: Contact, type: 'in' | 'out') => {
  // Navigate to transactions page with pre-filled data
  router.push({
    path: '/transactions',
    query: {
      new: 'true',
      type: type === 'in' ? 'repayment_in' : 'repayment_out',
      contact_id: contact.id,
      amount: Math.abs(contact.balance),
    },
  });
};

const closeDialog = () => {
  isDialogOpen.value = false;
  editingContact.value = null;
};

const resetFilters = () => {
  filters.value = {
    status: 'all',
    search: '',
    active_only: true,
  };
};

const formatNumber = (num: number) => {
  return new Intl.NumberFormat('en-IN').format(num);
};

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const getBalanceClass = (balance: number) => {
  if (balance > 0) return 'text-green-600';
  if (balance < 0) return 'text-red-600';
  return 'text-muted-foreground';
};

const getBalanceText = (balance: number) => {
  if (balance > 0) return `+₹${formatNumber(balance)}`;
  if (balance < 0) return `-₹${formatNumber(Math.abs(balance))}`;
  return '₹0';
};

const getBalanceStatusText = (status: string) => {
  const texts: Record<string, string> = {
    owes_you: 'Owes You',
    you_owe: 'You Owe',
    settled: 'Settled',
  };
  return texts[status] || status;
};

const getBalanceBadgeVariant = (status: string) => {
  if (status === 'owes_you') return 'default';
  if (status === 'you_owe') return 'destructive';
  return 'secondary';
};

onMounted(() => {
  fetchContacts();
  fetchSummary();
});

watch(isDialogOpen, (newValue) => {
  if (!newValue) {
    editingContact.value = null;
  }
});
</script>
