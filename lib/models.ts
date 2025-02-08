export type Provider = 'groq' | 'openai' | 'anthropic' | 'deepseek';

export interface ModelConfig {
  provider: Provider;
  modelId: string;
  displayName: string;
}

export const models: Record<string, ModelConfig> = {
  'llama-70b': {
    provider: 'groq',
    modelId: 'llama-3.3-70b-versatile',
    displayName: 'Llama 70B',
  },
  'deepseek-70b': {
    provider: 'groq',
    modelId: 'deepseek-r1-distill-llama-70b-specdec',
    displayName: 'Deepseek 70B',
  },
  'gpt4-turbo': {
    provider: 'openai',
    modelId: 'gpt-4o',
    displayName: 'GPT-4 Turbo',
  },
  'gpt4-mini': {
    provider: 'openai',
    modelId: 'gpt-4o-mini',
    displayName: 'GPT-4 Mini',
  },
};

export const DEFAULT_MODEL_KEY = 'llama-70b';

export function getModelConfig(selectedKey: string | undefined): ModelConfig {
  if (!selectedKey || !(selectedKey in models)) {
    console.warn(
      `Model key "${selectedKey}" is invalid. Falling back to default: "${DEFAULT_MODEL_KEY}".`
    );
    return models[DEFAULT_MODEL_KEY];
  }
  return models[selectedKey];
}

// Helper function to get models by provider
export function getModelsByProvider(provider: Provider): Record<string, ModelConfig> {
  return Object.entries(models).reduce((acc, [key, config]) => {
    if (config.provider === provider) {
      acc[key] = config;
    }
    return acc;
  }, {} as Record<string, ModelConfig>);
}

// Helper function to get all available providers
export function getAvailableProviders(): Provider[] {
  return Array.from(new Set(Object.values(models).map(config => config.provider)));
} 