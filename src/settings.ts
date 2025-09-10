export type Provider = 'openai' | 'ollama';

export interface AutoTitleSettings {
    provider: Provider;
    openaiApiKey: string;
    ollamaUrl: string;
    ollamaModel: string;
    availableModels: string[];
    autoRename: boolean;
    onlyRenameUntitled: boolean;
}

export const DEFAULT_SETTINGS: AutoTitleSettings = {
    provider: 'ollama',
    openaiApiKey: '',
    ollamaUrl: 'http://localhost:11434',
    ollamaModel: 'llama2:13b',
    availableModels: [],
    autoRename: true,
    onlyRenameUntitled: true,
}