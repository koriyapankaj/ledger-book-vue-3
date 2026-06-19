<template>
  <div class="w-full">
    <div v-if="!clientId"
      class="rounded-md border border-dashed p-3 text-center text-xs text-muted-foreground">
      Google sign-in is not configured.
    </div>
    <div v-else ref="buttonContainer" class="flex justify-center"></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { GOOGLE_CLIENT_ID } from '@/utils/constants';
import { loadGoogleIdentityScript } from '@/utils/google';

const props = withDefaults(
  defineProps<{
    text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
  }>(),
  {
    text: 'continue_with',
  }
);

const emit = defineEmits<{
  credential: [idToken: string];
  error: [message: string];
}>();

const clientId = GOOGLE_CLIENT_ID;
const buttonContainer = ref<HTMLElement | null>(null);

const renderButton = () => {
  const google = window.google;
  if (!google?.accounts?.id || !buttonContainer.value) {
    return;
  }

  google.accounts.id.initialize({
    client_id: clientId,
    callback: (response: { credential?: string }) => {
      if (response?.credential) {
        emit('credential', response.credential);
      } else {
        emit('error', 'No credential returned from Google.');
      }
    },
  });

  buttonContainer.value.innerHTML = '';
  google.accounts.id.renderButton(buttonContainer.value, {
    type: 'standard',
    theme: 'outline',
    size: 'large',
    text: props.text,
    shape: 'rectangular',
    logo_alignment: 'left',
    width: buttonContainer.value.offsetWidth || 320,
  });
};

onMounted(async () => {
  if (!clientId) {
    return;
  }

  try {
    await loadGoogleIdentityScript();
    renderButton();
  } catch (e: any) {
    emit('error', e?.message || 'Failed to initialize Google sign-in.');
  }
});
</script>
