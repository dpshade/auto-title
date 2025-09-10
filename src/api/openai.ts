import OpenAI from 'openai';
import { Notice } from 'obsidian';
import { AutoTitleSettings } from '../settings';

export class OpenAIService {
    private openai: OpenAI | null = null;

    constructor(private settings: AutoTitleSettings) {}

    initialize() {
        try {
            this.openai = new OpenAI({
                apiKey: this.settings.openaiApiKey,
            });
        } catch (error) {
            console.error('Failed to initialize OpenAI:', error);
            new Notice('Failed to initialize OpenAI. Please check your API key.');
        }
    }

    async generateTitle(content: string, prompt: string): Promise<string | null> {
        if (!this.openai) {
            return null;
        }

        try {
            const response = await this.openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'user',
                        content: prompt + content.substring(0, 2000)
                    }
                ],
                max_tokens: 50,
                temperature: 0.7,
            });

            return response.choices[0]?.message?.content?.trim() || null;
        } catch (error) {
            console.error('OpenAI API error:', error);
            throw error;
        }
    }

    isConfigured(): boolean {
        return Boolean(this.settings.openaiApiKey && this.openai);
    }
}