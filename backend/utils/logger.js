/**
 * Ravora Backend V1 — Structured Logger
 * Lightweight structured logging (no external dependencies).
 */

const LOG_LEVELS = { debug: 0, info: 1, warn: 2, error: 3 };
const currentLevel = LOG_LEVELS[process.env.LOG_LEVEL || 'info'] || LOG_LEVELS.info;

function formatTimestamp() {
  return new Date().toISOString();
}

function log(level, context, message, data = null) {
  if (LOG_LEVELS[level] < currentLevel) return;

  const entry = {
    timestamp: formatTimestamp(),
    level: level.toUpperCase(),
    context,
    message,
    ...(data ? { data } : {}),
  };

  const prefix = `[${entry.timestamp}] [${entry.level}] [${entry.context}]`;

  if (level === 'error') {
    console.error(`${prefix} ${message}`, data || '');
  } else if (level === 'warn') {
    console.warn(`${prefix} ${message}`, data || '');
  } else {
    console.log(`${prefix} ${message}`, data || '');
  }
}

export const logger = {
  debug: (context, message, data) => log('debug', context, message, data),
  info: (context, message, data) => log('info', context, message, data),
  warn: (context, message, data) => log('warn', context, message, data),
  error: (context, message, data) => log('error', context, message, data),
};
