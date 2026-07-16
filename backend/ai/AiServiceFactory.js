import { AraivenProvider } from './providers/AraivenProvider.js';

export class AiServiceFactory {
  static create(providerName = 'araiven') {
    switch (providerName.toLowerCase()) {
      case 'araiven':
        return new AraivenProvider();
      default:
        throw new Error(`AI provider "${providerName}" is not supported`);
    }
  }

  static getSupportedProviders() {
    return ['araiven'];
  }
}
