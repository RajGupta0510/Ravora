import { AraivenProvider } from './providers/AraivenProvider.js';
import { OpenAIProvider } from './providers/OpenAIProvider.js';
import { AnthropicProvider } from './providers/AnthropicProvider.js';
import { GeminiProvider } from './providers/GeminiProvider.js';
import { MockAIProvider } from './providers/MockAIProvider.js';

export class AiServiceFactory {
  static create(providerName = '') {
    const activeProvider = providerName || process.env.AI_PROVIDER || 'mock';
    
    switch (activeProvider.toLowerCase()) {
      case 'openai':
        return new OpenAIProvider();
      case 'anthropic':
        return new AnthropicProvider();
      case 'gemini':
        return new GeminiProvider();
      case 'araiven':
        return new AraivenProvider(); // Skeleton fallback
      case 'mock':
      default:
        return new MockAIProvider();
    }
  }

  static getSupportedProviders() {
    return ['openai', 'anthropic', 'gemini', 'araiven', 'mock'];
  }
}
