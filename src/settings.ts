export type Provider = 'openai' | 'ollama' | 'custom';

export interface AutoTitleSettings {
    provider: Provider;
    openaiApiKey: string;
    ollamaUrl: string;
    ollamaModel: string;
    availableModels: string[];
    autoRename: boolean;
    onlyRenameUntitled: boolean;
    customBaseUrl: string;
    customApiKey: string;
    customModel: string;
    autoRenameOnOpen: boolean;
    autoRenameThreshold: number;
}

export const DEFAULT_SETTINGS: AutoTitleSettings = {
    provider: 'ollama',
    openaiApiKey: '',
    ollamaUrl: 'http://localhost:11434',
    ollamaModel: 'llama2:13b',
    availableModels: [],
    autoRename: true,
    onlyRenameUntitled: true,
    customBaseUrl: 'https://api.xiaomimimo.com/v1',
    customApiKey: '',
    customModel: 'mimo-v2-flash',
    autoRenameOnOpen: false,
    autoRenameThreshold: 1000,
}
