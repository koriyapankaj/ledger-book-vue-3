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
