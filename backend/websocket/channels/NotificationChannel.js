import { sendToUser } from '../WebSocketServer.js';
import { WS_EVENTS } from '../../config/constants.js';

export const NotificationChannel = {
  CHANNEL_NAME: 'notifications',

  sendNotification(userId, notification) {
    sendToUser(userId, WS_EVENTS.NOTIFICATION, notification);
  },
};
