import { validateBody } from '../middleware/validator.js';

export const validateUpdateSettings = validateBody([
  { field: 'auto_hedge_enabled', type: 'boolean', required: false },
  { field: 'notifications_enabled', type: 'boolean', required: false },
  { field: 'execution_mode', type: 'string', required: false, enum: ['advisory', 'semi_auto', 'auto'] },
  { field: 'theme', type: 'string', required: false, enum: ['dark', 'light'] }
]);
