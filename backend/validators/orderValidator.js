import { validateBody } from '../middleware/validator.js';

export const validateCreateOrder = validateBody([
  { field: 'exchange', type: 'string', required: true },
  { field: 'symbol', type: 'string', required: true },
  { field: 'type', type: 'string', required: true, enum: ['market', 'limit', 'stop_loss', 'take_profit'] },
  { field: 'side', type: 'string', required: true, enum: ['buy', 'sell'] },
  { field: 'quantity', type: 'number', required: true, min: 0.00001 },
  { field: 'price', type: 'number', required: false, min: 0 }
]);
