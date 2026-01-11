import * as yup from 'yup';

/**
 * Common validation schemas for reuse across forms
 */

export const emailValidation = yup
  .string()
  .required('Email is required')
  .email('Please enter a valid email address');

export const passwordValidation = yup
  .string()
  .required('Password is required')
  .min(8, 'Password must be at least 8 characters');

export const strongPasswordValidation = yup
  .string()
  .required('Password is required')
  .min(8, 'Password must be at least 8 characters')
  .matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'Password must contain at least one uppercase letter, one lowercase letter, and one number'
  );

export const nameValidation = yup
  .string()
  .required('Name is required')
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name must not exceed 100 characters');

export const phoneValidation = yup
  .string()
  .matches(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/, 'Invalid phone number');

export const urlValidation = yup
  .string()
  .url('Please enter a valid URL');

/**
 * Create password confirmation validation
 */
export function passwordConfirmation(fieldName: string = 'password') {
  return yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref(fieldName)], 'Passwords must match');
}

/**
 * Create required field validation with custom message
 */
export function required(fieldName: string) {
  return yup.string().required(`${fieldName} is required`);
}

/**
 * Create numeric validation
 */
export function numeric(fieldName: string, min?: number, max?: number) {
  let schema = yup
    .number()
    .typeError(`${fieldName} must be a number`)
    .required(`${fieldName} is required`);

  if (min !== undefined) {
    schema = schema.min(min, `${fieldName} must be at least ${min}`);
  }

  if (max !== undefined) {
    schema = schema.max(max, `${fieldName} must not exceed ${max}`);
  }

  return schema;
}

/**
 * Create date validation
 */
export function dateValidation(fieldName: string, minDate?: Date, maxDate?: Date) {
  let schema = yup
    .date()
    .typeError(`${fieldName} must be a valid date`)
    .required(`${fieldName} is required`);

  if (minDate) {
    schema = schema.min(minDate, `${fieldName} must be after ${minDate.toLocaleDateString()}`);
  }

  if (maxDate) {
    schema = schema.max(maxDate, `${fieldName} must be before ${maxDate.toLocaleDateString()}`);
  }

  return schema;
}

/**
 * Currency/Money validation
 */
export const currencyValidation = yup
  .number()
  .typeError('Amount must be a number')
  .required('Amount is required')
  .min(0, 'Amount must be positive');

/**
 * Optional field with specific format
 */
export function optionalEmail() {
  return yup.string().email('Please enter a valid email address').nullable();
}

export function optionalUrl() {
  return yup.string().url('Please enter a valid URL').nullable();
}

// Account Form Validation Schema
export const accountFormSchema = yup.object({
  name: yup
    .string()
    .required('Account name is required')
    .min(2, 'Account name must be at least 2 characters')
    .max(255, 'Account name must not exceed 255 characters'),

  type: yup
    .string()
    .required('Account type is required')
    .oneOf(['asset', 'liability'], 'Invalid account type'),

  subtype: yup
    .string()
    .required('Account subtype is required')
    .oneOf(
      ['cash', 'bank_account', 'digital_wallet', 'credit_card', 'loan'],
      'Invalid account subtype'
    ),

  balance: yup
    .number()
    .transform((value, originalValue) => (originalValue === '' ? undefined : value))
    .nullable()
    .min(0, 'Balance cannot be negative')
    .typeError('Balance must be a number'),

  credit_limit: yup
    .number()
    .transform((value, originalValue) => (originalValue === '' ? undefined : value))
    .nullable()
    .when('subtype', {
      is: 'credit_card',
      then: (schema) => schema.min(0, 'Credit limit cannot be negative'),
    })
    .typeError('Credit limit must be a number'),

  account_number: yup
    .string()
    .nullable()
    .max(50, 'Account number must not exceed 50 characters'),

  bank_name: yup
    .string()
    .nullable()
    .max(255, 'Bank name must not exceed 255 characters'),

  color: yup
    .string()
    .matches(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format (must be hex color like #3B82F6)')
    .required('Color is required'),

  notes: yup
    .string()
    .nullable()
    .max(1000, 'Notes must not exceed 1000 characters'),

  include_in_total: yup
    .boolean()
    .required()
    .default(true),
});

// Category Form Validation Schema
export const categoryFormSchema = yup.object({
  name: yup
    .string()
    .required('Category name is required')
    .min(2, 'Category name must be at least 2 characters')
    .max(255, 'Category name must not exceed 255 characters'),

  type: yup
    .string()
    .required('Category type is required')
    .oneOf(['income', 'expense'], 'Invalid category type'),

  parent_id: yup
    .number()
    .nullable()
    .transform((value, originalValue) => (originalValue === '' ? null : value)),

  color: yup
    .string()
    .matches(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format')
    .required('Color is required'),

  icon: yup
    .string()
    .required('Icon is required'),

  order: yup
    .number()
    .min(0, 'Order must be 0 or greater')
    .default(0),

  description: yup
    .string()
    .nullable()
    .max(1000, 'Description must not exceed 1000 characters'),
});

// Contact Form Validation Schema
export const contactFormSchema = yup.object({
  name: yup
    .string()
    .required('Contact name is required')
    .min(2, 'Contact name must be at least 2 characters')
    .max(255, 'Contact name must not exceed 255 characters'),

  email: yup
    .string()
    .nullable()
    .email('Invalid email address')
    .max(255, 'Email must not exceed 255 characters'),

  phone: yup
    .string()
    .nullable()
    .max(20, 'Phone number must not exceed 20 characters'),

  notes: yup
    .string()
    .nullable()
    .max(1000, 'Notes must not exceed 1000 characters'),
});

// Transaction Form Validation Schema
export const transactionFormSchema = yup.object({
  type: yup
    .string()
    .required('Transaction type is required')
    .oneOf(
      ['income', 'expense', 'transfer', 'lent', 'borrowed', 'repayment_in', 'repayment_out'],
      'Invalid transaction type'
    ),

  amount: yup
    .number()
    .required('Amount is required')
    .min(0.01, 'Amount must be greater than 0')
    .typeError('Amount must be a number'),

  account_id: yup
    .number()
    .required('Please select an account')
    .typeError('Please select an account'),

  to_account_id: yup
    .number()
    .nullable()
    .when('type', {
      is: 'transfer',
      then: (schema) => schema.required('Destination account is required for transfers'),
    })
    .typeError('Please select a destination account'),

  category_id: yup
    .number()
    .nullable()
    .when('type', {
      is: (val: string) => ['income', 'expense'].includes(val),
      then: (schema) => schema.required('Category is required for income/expense transactions'),
    })
    .typeError('Please select a category'),

  contact_id: yup
    .number()
    .nullable()
    .when('type', {
      is: (val: string) => ['lent', 'borrowed', 'repayment_in', 'repayment_out'].includes(val),
      then: (schema) => schema.required('Contact is required for debt transactions'),
    })
    .typeError('Please select a contact'),

  transaction_date: yup
    .date()
    .required('Transaction date is required')
    .typeError('Invalid date'),

  title: yup
    .string()
    .nullable()
    .max(255, 'Title must not exceed 255 characters'),

  description: yup
    .string()
    .nullable()
    .max(1000, 'Description must not exceed 1000 characters'),

  reference_number: yup
    .string()
    .nullable()
    .max(100, 'Reference number must not exceed 100 characters'),
});

// Budget Form Validation Schema
export const budgetFormSchema = yup.object({
  category_id: yup
    .number()
    .required('Please select a category')
    .typeError('Please select a category'),

  amount: yup
    .number()
    .required('Budget amount is required')
    .min(0.01, 'Budget amount must be greater than 0')
    .typeError('Budget amount must be a number'),

  period: yup
    .string()
    .required('Budget period is required')
    .oneOf(['daily', 'weekly', 'monthly', 'yearly'], 'Invalid budget period'),

  start_date: yup
    .date()
    .required('Start date is required')
    .typeError('Invalid start date'),

  end_date: yup
    .date()
    .nullable()
    .min(yup.ref('start_date'), 'End date must be after start date')
    .typeError('Invalid end date'),

  include_subcategories: yup
    .boolean()
    .default(false),
});
