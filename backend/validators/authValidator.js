import { validateBody } from '../middleware/validator.js';

export const validateSignUp = validateBody([
  { field: 'email', type: 'string', required: true, min: 5 },
  { field: 'password', type: 'string', required: true, min: 6 },
  { field: 'fullName', type: 'string', required: true, min: 2 }
]);

export const validateSignIn = validateBody([
  { field: 'email', type: 'string', required: true },
  { field: 'password', type: 'string', required: true }
]);
