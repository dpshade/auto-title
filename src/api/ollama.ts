import { AutoTitleSettings } from '../settings';
import { OllamaResponse, OllamaModel } from '../types';

export class OllamaService {
    constructor(private settings: AutoTitleSettings) {}

    async validateConnection(): Promise<boolean> {
        try {
            const response = await fetch(`${this.settings.ollamaUrl}/api/tags`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            return response.ok;
        } catch (error) {
            console.error('Ollama connection error:', error);
            return false;
        }
    }

    async fetchModels(): Promise<string[]> {
        try {
            const response = await fetch(`${this.settings.ollamaUrl}/api/tags`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            // Handle response format: use either 'name' or 'model' field
            return data.models?.map((model: any) => model.name || model.model) || [];
        } catch (error) {
            console.error('Error fetching Ollama models:', error);
            return [];
        }
    }

    async generateTitle(content: string, prompt: string): Promise<string | null> {
        try {
            const response = await fetch(`${this.settings.ollamaUrl}/api/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: this.settings.ollamaModel,
                    messages: [
                        {
                            role: 'user',
                            content: prompt + content.substring(0, 2000)
                        }
                    ],
                    stream: false,
                    options: {
                        temperature: 0.7,
                        num_predict: 50,
                    }
                }),
            });

            if (!response.ok) {
                throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
            }

            const data: OllamaResponse = await response.json();

            if (data.message && data.message.content) {
                return data.message.content.trim() || null;
            }

            return null;
        } catch (error) {
            console.error('Ollama API error:', error);
            throw error;
        }
    }

    isConfigured(): boolean {
        return Boolean(this.settings.ollamaUrl);
    }
}