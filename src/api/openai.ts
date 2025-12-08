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

    constructor(private settings: AutoTitleSettings) {}

    initialize() {
        if (this.settings.openaiApiKey) {
            this.isInitialized = true;
        } else {
            console.error('Failed to initialize OpenAI: API key not provided');
            new Notice('failed to initialize Openai. Please check your API key.');
        }
    }

    async generateTitle(content: string, prompt: string): Promise<string | null> {
        if (!this.isInitialized || !this.settings.openaiApiKey) {
            return null;
        }

        try {
            const response = await requestUrl({
                url: 'https://api.openai.com/v1/chat/completions',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.settings.openaiApiKey}`,
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo',
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
        return Boolean(this.settings.openaiApiKey && this.isInitialized);
    }
}
