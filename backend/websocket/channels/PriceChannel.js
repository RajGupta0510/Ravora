/**
 * Price Channel — broadcasts live price updates to subscribed clients.
 */

import { broadcastToChannel } from '../WebSocketServer.js';
import { WS_EVENTS } from '../../config/constants.js';

export const PriceChannel = {
  CHANNEL_NAME: 'prices',

  /**
   * Broadcast price updates to all subscribed clients.
   * @param {Array<{symbol: string, price: number, change24h: number}>} tickers
   */
  broadcast(tickers) {
    broadcastToChannel(this.CHANNEL_NAME, WS_EVENTS.PRICE_UPDATE, { tickers, timestamp: Date.now() });
  },
};
