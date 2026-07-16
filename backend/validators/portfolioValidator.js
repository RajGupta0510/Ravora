import { validateBody } from '../middleware/validator.js';

export const validateAddAsset = validateBody([
  { field: 'asset_symbol', type: 'string', required: true },
  { field: 'allocation_pct', type: 'number', required: true, min: 0, max: 100 },
  { field: 'balance_amount', type: 'number', required: true, min: 0 },
  { field: 'average_entry_price', type: 'number', required: true, min: 0 },
  { field: 'position_type', type: 'string', required: false, enum: ['long', 'short'] },
  { field: 'leverage', type: 'number', required: false, min: 1, max: 100 }
]);
