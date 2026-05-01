/**
 * App-side re-export of error classes.
 * UI code MUST import from here — never directly from `@lesso/api-client`.
 * Future non-API errors (form validation, route guards) extend the same hierarchy.
 */
export { AppError, ApiError } from '@lesso/api-client';
