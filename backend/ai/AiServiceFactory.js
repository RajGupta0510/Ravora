import { OpenAIProvider } from './providers/OpenAIProvider.js';
import { AnthropicProvider } from './providers/AnthropicProvider.js';
import { GeminiProvider } from './providers/GeminiProvider.js';
import { MockAIProvider } from './providers/MockAIProvider.js';

export class AiServiceFactory {
  /**
   * Instantiates the active configured provider.
   * Defaults to Gemini for production-ready operations.
   */
  static create(providerName = '') {
    const activeProvider = providerName || process.env.AI_PROVIDER || 'gemini';
    
    switch (activeProvider.toLowerCase()) {
      case 'openai':
        return new OpenAIProvider();
      case 'anthropic':
        return new AnthropicProvider();
      case 'gemini':
        return new GeminiProvider();
      case 'mock':
        // Redirect mock requests to Gemini-backed class to remove mock logic
        return new MockAIProvider();
      default:
        return new GeminiProvider();
    }
  }

  static getSupportedProviders() {
    return ['openai', 'anthropic', 'gemini'];
  }
}
export default AiServiceFactory;
