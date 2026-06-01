import { AIProvider } from './types';
import { MockProvider } from './providers/mock';
import { VercelSdkProvider } from './providers/vercelSdkProvider';

export class AIFactory {
  public static getProvider(): AIProvider {
    // Read provider details from environment variables
    const providerName = (process.env.AI_PROVIDER || 'mock').toLowerCase().trim();
    const modelName = process.env.AI_MODEL || undefined;

    switch (providerName) {
      case 'google':
      case 'gemini':
        return new VercelSdkProvider('google', modelName || 'gemini-1.5-flash');
      
      case 'anthropic':
      case 'claude':
        return new VercelSdkProvider('anthropic', modelName || 'claude-3-5-sonnet-latest');

      case 'deepseek':
        return new VercelSdkProvider('deepseek', modelName || 'deepseek-chat');

      case 'openai':
        return new VercelSdkProvider('openai', modelName || 'gpt-4o-mini');

      case 'mock':
      default:
        return new MockProvider();
    }
  }
}
