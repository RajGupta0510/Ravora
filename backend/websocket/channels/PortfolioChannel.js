import { sendToUser } from '../WebSocketServer.js';
import { WS_EVENTS } from '../../config/constants.js';

export const PortfolioChannel = {
  CHANNEL_NAME: 'portfolio',

  sendUpdate(userId, portfolioData) {
    sendToUser(userId, WS_EVENTS.PORTFOLIO_UPDATE, portfolioData);
  },
};
