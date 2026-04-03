import { requestUrl, Notice } from 'obsidian';
import { AutoTitleSettings } from '../settings';

interface OpenAIMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

interface OpenAIChoice {
    index: number;
    message: OpenAIMessage;
    finish_reason: string;
}

interface OpenAIResponse {
    id: string;
    object: string;
    created: number;
    model: string;
    choices: OpenAIChoice[];
    usage: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
}

export class OpenAIService {
    private isInitialized = false;

    constructor(private settings: AutoTitleSettings, private isCustom = false) {}

    initialize() {
        const apiKey = this.isCustom ? this.settings.customApiKey : this.settings.openaiApiKey;
        if (apiKey) {
            this.isInitialized = true;
        } else {
            console.error('Failed to initialize OpenAI: API key not provided');
            new Notice('Failed to initialize OpenAI. Please check your API key.');
        }
    }

    async generateTitle(content: string, prompt: string): Promise<string | null> {
        const apiKey = this.isCustom ? this.settings.customApiKey : this.settings.openaiApiKey;

        if (!this.isInitialized || !apiKey) {
            return null;
        }

        const baseUrl = this.isCustom ? this.settings.customBaseUrl : 'https://api.openai.com/v1';
        const model = this.isCustom ? this.settings.customModel : 'gpt-3.5-turbo';

        try {
            const response = await requestUrl({
                url: `${baseUrl}/chat/completions`,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    model: model,
                    messages: [
                        {
                            role: 'user',
                            content: prompt + content.substring(0, 2000)
                        }
                    ],
                    max_tokens: 50,
                    temperature: 0.7,
                }),
            });

            const data: OpenAIResponse = response.json;
            return data.choices[0]?.message?.content?.trim() || null;
        } catch (error) {
            console.error('OpenAI API error:', error);
            throw error;
        }
    }

    isConfigured(): boolean {
        const apiKey = this.isCustom ? this.settings.customApiKey : this.settings.openaiApiKey;
        return Boolean(apiKey && this.isInitialized);
    }
}
