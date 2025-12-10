import { TFile, Notice } from 'obsidian';
import AutoTitlePlugin from '../main';
import { TITLE_GENERATION_PROMPT } from '../utils/constants';
import { TitleExtractor } from '../utils/title-extractor';
import { LoadingToast } from '../ui/loading-toast';

export class TitleGenerator {
    constructor(private plugin: AutoTitlePlugin) {}

    async generateTitleForFile(file: TFile, isAutoRename: boolean = false) {
        // Check if API is configured
        if (this.plugin.settings.provider === 'openai' && !this.plugin.openaiService.isConfigured()) {
            new Notice('OpenAI not configured. Please set your API key in settings.');
            return;
        }

        if (this.plugin.settings.provider === 'ollama' && !this.plugin.ollamaService.isConfigured()) {
            new Notice('Ollama not configured. Please set your Ollama URL in settings.');
            return;
        }

        try {
            // Read file content - this may fail for binary files
            let content: string;
            try {
                content = await this.plugin.app.vault.read(file);
            } catch {
                if (!isAutoRename) {
                    new Notice('Cannot read file content - may be a binary file');
                }
                return;
            }

            // Skip if file is empty or very short
            if (content.trim().length < 10) {
                if (!isAutoRename) {
                    new Notice('File content is too short to generate a meaningful title');
                }
                return;
            }

            // Skip if file is very large (over 100KB of text)
            if (content.length > 100000) {
                if (!isAutoRename) {
                    new Notice('File is too large for title generation');
                }
                return;
            }

            // Skip if file already has a custom name (not default "Untitled")
            if (isAutoRename && this.plugin.settings.onlyRenameUntitled && !file.basename.startsWith('Untitled')) {
                return;
            }

            // Show simple loading toast
            const loadingToast = new LoadingToast();
            loadingToast.show();

            let rawResponse: string | null = null;

            try {
                if (this.plugin.settings.provider === 'openai') {
                    rawResponse = await this.plugin.openaiService.generateTitle(content, TITLE_GENERATION_PROMPT);
                } else if (this.plugin.settings.provider === 'ollama') {
                    rawResponse = await this.plugin.ollamaService.generateTitle(content, TITLE_GENERATION_PROMPT);
                }
            } finally {
                // Always hide loading toast
                loadingToast.hide();
            }

            if (!rawResponse) {
                new Notice('Failed to get response from AI service');
                return;
            }

            // Extract title using improved parsing
            const extractedTitle = TitleExtractor.extractTitle(rawResponse);
            if (!extractedTitle) {
                new Notice('Failed to extract valid title from AI response');
                console.debug('Raw AI response:', rawResponse);
                return;
            }

            // Validate and clean the title
            const cleanTitle = TitleExtractor.validateAndCleanTitle(extractedTitle);
            if (!cleanTitle) {
                new Notice('Generated title failed validation');
                return;
            }

            // Create new file path, preserving the original extension
            const dir = file.parent?.path || '';
            const extension = file.extension;
            const newPath = dir ? `${dir}/${cleanTitle}.${extension}` : `${cleanTitle}.${extension}`;

            // Check if file with this name already exists
            const existingFile = this.plugin.app.vault.getAbstractFileByPath(newPath);
            if (existingFile && existingFile !== file) {
                new Notice(`File "${cleanTitle}.${extension}" already exists`);
                return;
            }

            // Rename the file
            await this.plugin.app.fileManager.renameFile(file, newPath);
            new Notice(`File renamed to: ${cleanTitle}.${extension}`);

        } catch (error) {
            console.error('Error generating title:', error);
            new Notice(`Failed to generate title using ${this.plugin.settings.provider}. Please check your configuration and try again.`);
        }
    }
}