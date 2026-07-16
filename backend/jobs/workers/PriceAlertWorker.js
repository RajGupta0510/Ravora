/**
 * Price Alert Worker — checks if any active price alerts have been triggered.
 */

import { logger } from '../../utils/logger.js';

export async function priceAlertWorker() {
  try {
    // Placeholder — future implementation:
    // 1. Query all active price alerts
    // 2. Compare target_price against current cached price
    // 3. If triggered: mark as triggered, send notification
    logger.debug('PriceAlertWorker', 'Price alert check tick (placeholder)');
  } catch (err) {
    logger.error('PriceAlertWorker', 'Failed to check price alerts', { error: err.message });
  }
}
