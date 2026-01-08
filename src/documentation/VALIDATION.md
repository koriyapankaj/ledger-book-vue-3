# Form Validation Guide

This project uses **vee-validate** with **yup** for comprehensive form validation.

## Quick Start

### Basic Form with Validation

```vue
<template>
  <Form @submit="handleSubmit" :validation-schema="schema">
    <FormField name="email" label="Email">
      <template #default="{ field, errorMessage }">
        <Input v-bind="field" type="email" />
      </template>
    </FormField>
    
    <Button type="submit">Submit</Button>
  </Form>
</template>

<script setup lang="ts">
import { Form } from 'vee-validate';
import * as yup from 'yup';
import { FormField } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const schema = yup.object({
  email: yup.string().required('Email is required').email('Invalid email'),
});

const handleSubmit = (values) => {
  console.log(values);
};
</script>
```

## Components

### FormField Component

A wrapper component that integrates vee-validate with shadcn-vue inputs.

**Props:**
- `name` (required): Field name for validation
- `label` (optional): Label text
- `hideError` (optional): Hide error messages

**Slot Props:**
- `field`: Field binding object (use with `v-bind`)
- `errorMessage`: Current validation error message

### Example Usage

```vue
<FormField name="email" label="Email Address">
  <template #default="{ field, errorMessage }">
    <Input 
      v-bind="field" 
      type="email" 
      :class="{ 'border-destructive': errorMessage }"
    />
  </template>
</FormField>
```

## Validation Schemas

### Using Pre-built Validators

Import common validation patterns from `@/utils/validation`:

```typescript
import { 
  emailValidation, 
  strongPasswordValidation, 
  passwordConfirmation 
} from '@/utils/validation';

const schema = yup.object({
  email: emailValidation,
  password: strongPasswordValidation,
  password_confirmation: passwordConfirmation('password'),
});
```

### Available Pre-built Validators

- `emailValidation`: Basic email validation
- `passwordValidation`: Min 8 characters
- `strongPasswordValidation`: Min 8 chars + uppercase + lowercase + number
- `nameValidation`: 2-100 characters
- `phoneValidation`: Phone number format
- `urlValidation`: URL format
- `currencyValidation`: Positive numbers
- `passwordConfirmation(fieldName)`: Match password field
- `numeric(fieldName, min?, max?)`: Number with optional range
- `dateValidation(fieldName, minDate?, maxDate?)`: Date with optional range

## Server-Side Error Handling

The auth store automatically handles Laravel validation errors:

```typescript
// Auth store handles both client and server errors
await authStore.login(credentials);

// Server validation errors are available at:
authStore.validationErrors // { field: ['error message'] }
authStore.error // General error message
```

### Displaying Server Errors in Forms

```vue
<FormField name="email" label="Email">
  <template #default="{ field, errorMessage }">
    <Input 
      v-bind="field"
      :class="{ 
        'border-destructive': errorMessage || authStore.validationErrors.email 
      }"
    />
    <!-- Show server error if exists -->
    <p v-if="authStore.validationErrors.email" class="text-sm text-destructive">
      {{ authStore.validationErrors.email[0] }}
    </p>
  </template>
</FormField>

<!-- Show general error for non-validation errors -->
<Alert v-if="authStore.error && !Object.keys(authStore.validationErrors).length" 
       variant="destructive">
  <AlertDescription>{{ authStore.error }}</AlertDescription>
</Alert>
```

## Error Handling Utilities

### useFormError Composable

For custom forms outside the auth context:

```typescript
import { useFormError } from '@/composables/useFormError';

const { error, validationErrors, handleError, clearErrors, getFieldError } = useFormError();

async function submit() {
  try {
    await api.post('/endpoint', data);
  } catch (err) {
    handleError(err); // Automatically parses API errors
  }
}

// Check field error
const emailError = getFieldError('email');
```

### Error Utility Functions

```typescript
import { 
  getErrorMessage, 
  getValidationErrors, 
  isValidationError 
} from '@/utils/errors';

try {
  await api.post('/endpoint', data);
} catch (err) {
  if (isValidationError(err)) {
    const errors = getValidationErrors(err);
    // Handle validation errors
  } else {
    const message = getErrorMessage(err);
    // Handle general error
  }
}
```

## Custom Validation Rules

### Simple Custom Rule

```typescript
const schema = yup.object({
  username: yup
    .string()
    .required('Username is required')
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must not exceed 20 characters')
    .matches(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
});
```

### Async Validation (e.g., check if email exists)

```typescript
const schema = yup.object({
  email: yup
    .string()
    .required('Email is required')
    .email('Invalid email')
    .test('unique', 'Email already exists', async (value) => {
      if (!value) return true;
      const { data } = await api.get(`/check-email?email=${value}`);
      return data.available;
    }),
});
```

### Conditional Validation

```typescript
const schema = yup.object({
  hasCompany: yup.boolean(),
  companyName: yup.string().when('hasCompany', {
    is: true,
    then: (schema) => schema.required('Company name is required'),
    otherwise: (schema) => schema.notRequired(),
  }),
});
```

## Best Practices

1. **Clear errors on mount**: Always clear previous errors when a form loads
   ```typescript
   onMounted(() => {
     authStore.clearErrors();
   });
   ```

2. **Show appropriate errors**: Show client-side validation errors first, fall back to server errors
   
3. **User-friendly messages**: Write clear, actionable error messages
   
4. **Real-time validation**: vee-validate validates on blur by default
   
5. **Disable submit on loading**: Prevent multiple submissions
   ```vue
   <Button type="submit" :disabled="isLoading">Submit</Button>
   ```

6. **Handle both validation and general errors**: Distinguish between 422 validation errors and other API errors

## Complete Example: Login Form

See `src/views/auth/LoginView.vue` for a complete working example with:
- Client-side validation with yup
- Server-side error handling
- Loading states
- Error display
- Form field integration

## API Error Format

Expected Laravel error response format:

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "email": ["The email field is required."],
    "password": ["The password must be at least 8 characters."]
  }
}
```
