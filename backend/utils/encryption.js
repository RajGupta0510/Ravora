/**
 * Ravora Backend V1 — Encryption Utilities
 * For encrypting/decrypting exchange API keys at rest.
 */

import crypto from 'crypto';
import env from '../config/environment.js';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const TAG_LENGTH = 16;

/**
 * Derives a 32-byte key from the configured encryption key.
 */
function getKey() {
  return crypto.scryptSync(env.ENCRYPTION_KEY, 'ravora_salt', 32);
}

/**
 * Encrypts a plaintext string.
 * @param {string} plaintext
 * @returns {string} Encrypted string (iv:tag:ciphertext in hex)
 */
export function encrypt(plaintext) {
  const key = getKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const tag = cipher.getAuthTag();

  return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted}`;
}

/**
 * Decrypts an encrypted string.
 * @param {string} encryptedText - Format: iv:tag:ciphertext (hex)
 * @returns {string} Decrypted plaintext
 */
export function decrypt(encryptedText) {
  const key = getKey();
  const parts = encryptedText.split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted text format');
  }

  const iv = Buffer.from(parts[0], 'hex');
  const tag = Buffer.from(parts[1], 'hex');
  const ciphertext = parts[2];

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}
