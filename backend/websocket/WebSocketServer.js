/**
 * Ravora Backend V1 — WebSocket Server
 * Manages client connections, authentication, and message routing.
 */

import { WebSocketServer as WsServer } from 'ws';
import { WS_EVENTS } from '../config/constants.js';
import { AuthService } from '../services/AuthService.js';
import { logger } from '../utils/logger.js';

let wss = null;
const clients = new Map(); // userId -> Set<ws>

/**
 * Initialize the WebSocket server on an existing HTTP server.
 */
export function initializeWebSocket(httpServer) {
  wss = new WsServer({ server: httpServer, path: '/ws' });

  wss.on('connection', async (ws, req) => {
    // Extract token from query params: ws://host/ws?token=xxx
    const url = new URL(req.url, `http://${req.headers.host}`);
    const token = url.searchParams.get('token');

    if (!token) {
      ws.close(4001, 'Authentication required');
      return;
    }

    try {
      const user = await AuthService.getUserFromToken(token);
      if (!user) {
        ws.close(4001, 'Invalid token');
        return;
      }

      ws.userId = user.id;
      ws.isAlive = true;
      ws.subscriptions = new Set();

      // Track connection
      if (!clients.has(user.id)) clients.set(user.id, new Set());
      clients.get(user.id).add(ws);

      logger.info('WebSocket', `Client connected: ${user.id}`);

      ws.on('message', (raw) => {
        try {
          const message = JSON.parse(raw.toString());
          handleMessage(ws, message);
        } catch (err) {
          ws.send(JSON.stringify({ event: WS_EVENTS.ERROR, data: { message: 'Invalid message format' } }));
        }
      });

      ws.on('pong', () => { ws.isAlive = true; });

      ws.on('close', () => {
        const userClients = clients.get(ws.userId);
        if (userClients) {
          userClients.delete(ws);
          if (userClients.size === 0) clients.delete(ws.userId);
        }
        logger.info('WebSocket', `Client disconnected: ${ws.userId}`);
      });

      // Send welcome message
      ws.send(JSON.stringify({ event: 'connected', data: { userId: user.id, message: 'Connected to Ravora WebSocket' } }));

    } catch (err) {
      logger.error('WebSocket', 'Connection error', { error: err.message });
      ws.close(4002, 'Authentication failed');
    }
  });

  // Heartbeat: detect broken connections
  const heartbeat = setInterval(() => {
    wss.clients.forEach(ws => {
      if (!ws.isAlive) return ws.terminate();
      ws.isAlive = false;
      ws.ping();
    });
  }, 30_000);

  wss.on('close', () => clearInterval(heartbeat));

  logger.info('WebSocket', '✓ WebSocket server ready on /ws');
  return wss;
}

/**
 * Handle incoming client messages (subscribe/unsubscribe).
 */
function handleMessage(ws, message) {
  const { event, data } = message;

  switch (event) {
    case WS_EVENTS.SUBSCRIBE:
      if (data?.channel) {
        ws.subscriptions.add(data.channel);
        ws.send(JSON.stringify({ event: 'subscribed', data: { channel: data.channel } }));
      }
      break;

    case WS_EVENTS.UNSUBSCRIBE:
      if (data?.channel) {
        ws.subscriptions.delete(data.channel);
        ws.send(JSON.stringify({ event: 'unsubscribed', data: { channel: data.channel } }));
      }
      break;

    default:
      ws.send(JSON.stringify({ event: WS_EVENTS.ERROR, data: { message: `Unknown event: ${event}` } }));
  }
}

/**
 * Broadcast a message to all clients subscribed to a channel.
 */
export function broadcastToChannel(channel, event, data) {
  if (!wss) return;

  wss.clients.forEach(ws => {
    if (ws.readyState === 1 && ws.subscriptions?.has(channel)) {
      ws.send(JSON.stringify({ event, data }));
    }
  });
}

/**
 * Send a message to a specific user (all their connections).
 */
export function sendToUser(userId, event, data) {
  const userClients = clients.get(userId);
  if (!userClients) return;

  const message = JSON.stringify({ event, data });
  userClients.forEach(ws => {
    if (ws.readyState === 1) ws.send(message);
  });
}

/**
 * Get the count of connected clients.
 */
export function getConnectedCount() {
  return wss ? wss.clients.size : 0;
}
