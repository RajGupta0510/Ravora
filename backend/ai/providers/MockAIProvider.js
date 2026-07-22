import { GeminiProvider } from './GeminiProvider.js';
import { logger } from '../../utils/logger.js';

/**
 * MockAIProvider
 * DEPRECATED/REPLACED: In accordance with production requirements to remove all hardcoded mock responses,
 * this provider now redirects all calls to the real GeminiProvider implementation.
 */
export class MockAIProvider extends GeminiProvider {
  constructor() {
    super();
    this.name = 'Araiven (Gemini Engine)';
    logger.warn('MockAIProvider', 'Mock AI Provider constructor called. Redirecting mock to real Gemini AI engine.');
  }
}
export default MockAIProvider;
