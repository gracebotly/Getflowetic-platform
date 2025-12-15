import { QueryCtx, MutationCtx } from './_generated/server';

// AIProvider type definition
export interface AIModel {
  id: string;
  name: string;
  contextLength: number;
  pricing: {
    input: number;
    output: number;
  };
}

export interface AIProvider {
  id: string;
  name: string;
  models: AIModel[];
  hasApiKey: boolean;
  isValidating?: boolean;
  lastValidated?: Date;
}

export async function getUserId(ctx: QueryCtx | MutationCtx): Promise<string | null> {
  return null;
}

export const AI_PROVIDERS: AIProvider[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    models: [
      { id: 'gpt-4o', name: 'GPT-4o', contextLength: 128000, pricing: { input: 0.005, output: 0.015 } },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini', contextLength: 128000, pricing: { input: 0.00015, output: 0.0006 } },
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', contextLength: 128000, pricing: { input: 0.01, output: 0.03 } },
    ],
    hasApiKey: false,
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    models: [
      { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', contextLength: 200000, pricing: { input: 0.003, output: 0.015 } },
      { id: 'claude-3-opus', name: 'Claude 3 Opus', contextLength: 200000, pricing: { input: 0.015, output: 0.075 } },
      { id: 'claude-3-haiku', name: 'Claude 3 Haiku', contextLength: 200000, pricing: { input: 0.00025, output: 0.00125 } },
    ],
    hasApiKey: false,
  },
  {
    id: 'google',
    name: 'Google',
    models: [
      { id: 'gemini-pro', name: 'Gemini Pro', contextLength: 32768, pricing: { input: 0.0005, output: 0.0015 } },
      { id: 'gemini-pro-vision', name: 'Gemini Pro Vision', contextLength: 32768, pricing: { input: 0.0005, output: 0.0015 } },
    ],
    hasApiKey: false,
  },
  {
    id: 'groq',
    name: 'Groq',
    models: [
      { id: 'llama-3.1-70b', name: 'Llama 3.1 70B', contextLength: 32768, pricing: { input: 0.00059, output: 0.00079 } },
      { id: 'mixtral-8x7b', name: 'Mixtral 8x7B', contextLength: 32768, pricing: { input: 0.00027, output: 0.00027 } },
    ],
    hasApiKey: false,
  },
  {
    id: 'xai',
    name: 'xAI',
    models: [
      { id: 'grok-beta', name: 'Grok Beta', contextLength: 131072, pricing: { input: 0.005, output: 0.015 } },
      { id: 'grok-vision-beta', name: 'Grok Vision Beta', contextLength: 8192, pricing: { input: 0.005, output: 0.015 } },
    ],
    hasApiKey: false,
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    models: [
      { id: 'deepseek-coder', name: 'DeepSeek Coder', contextLength: 16384, pricing: { input: 0.00014, output: 0.00014 } },
      { id: 'deepseek-chat', name: 'DeepSeek Chat', contextLength: 32768, pricing: { input: 0.00014, output: 0.00014 } },
    ],
    hasApiKey: false,
  },
  {
    id: 'mistral',
    name: 'Mistral',
    models: [
      { id: 'mistral-large', name: 'Mistral Large', contextLength: 128000, pricing: { input: 0.008, output: 0.024 } },
      { id: 'mixtral-8x7b', name: 'Mixtral 8x7B', contextLength: 32768, pricing: { input: 0.0007, output: 0.0007 } },
    ],
    hasApiKey: false,
  },
  {
    id: 'cohere',
    name: 'Cohere',
    models: [
      { id: 'command-r', name: 'Command R', contextLength: 128000, pricing: { input: 0.00015, output: 0.0006 } },
      { id: 'command-r-plus', name: 'Command R+', contextLength: 128000, pricing: { input: 0.003, output: 0.015 } },
    ],
    hasApiKey: false,
  },
  {
    id: 'together',
    name: 'Together AI',
    models: [
      { id: 'llama-3.1-70b', name: 'Llama 3.1 70B', contextLength: 32768, pricing: { input: 0.00063, output: 0.00063 } },
      { id: 'mixtral-8x7b', name: 'Mixtral 8x7B', contextLength: 32768, pricing: { input: 0.00027, output: 0.00027 } },
    ],
    hasApiKey: false,
  },
  {
    id: 'perplexity',
    name: 'Perplexity',
    models: [
      { id: 'sonar', name: 'Sonar', contextLength: 127000, pricing: { input: 0.001, output: 0.001 } },
      { id: 'sonar-small', name: 'Sonar Small', contextLength: 127000, pricing: { input: 0.0001, output: 0.0001 } },
    ],
    hasApiKey: false,
  },
  {
    id: 'huggingface',
    name: 'HuggingFace',
    models: [
      { id: 'llama-3.1-70b', name: 'Llama 3.1 70B', contextLength: 32768, pricing: { input: 0.00037, output: 0.00037 } },
      { id: 'codellama-70b', name: 'Code Llama 70B', contextLength: 16384, pricing: { input: 0.00037, output: 0.00037 } },
    ],
    hasApiKey: false,
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    models: [
      { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', contextLength: 200000, pricing: { input: 0.003, output: 0.015 } },
      { id: 'openai/gpt-4o', name: 'GPT-4o', contextLength: 128000, pricing: { input: 0.005, output: 0.015 } },
    ],
    hasApiKey: false,
  },
  {
    id: 'ollama',
    name: 'Ollama (Local)',
    models: [
      { id: 'llama3.1', name: 'Llama 3.1', contextLength: 32768, pricing: { input: 0, output: 0 } },
      { id: 'codellama', name: 'Code Llama', contextLength: 16384, pricing: { input: 0, output: 0 } },
    ],
    hasApiKey: false,
  },
];

export const getDefaultProvider = (): AIProvider => {
  return AI_PROVIDERS[0];
};
