import { App, PluginSettingTab, Setting } from 'obsidian';
import AutoTitlePlugin from '../main';
import type { Provider } from '../settings';

export class AutoTitleSettingTab extends PluginSettingTab {
    plugin: AutoTitlePlugin;
    private static modelsRefreshed = false;

    constructor(app: App, plugin: AutoTitlePlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;

        containerEl.empty();

        new Setting(containerEl).setName('Configuration').setHeading();

        // Auto-refresh models only once per session and only when URL changes
        if (this.plugin.settings.provider === 'ollama' &&
            this.plugin.settings.ollamaUrl &&
            !AutoTitleSettingTab.modelsRefreshed) {
            AutoTitleSettingTab.modelsRefreshed = true;
            void this.validateAndFetchModels();
        }

        // Provider selection
        new Setting(containerEl)
            .setName('AI provider')
            .setDesc('Choose which AI provider to use for title generation')
            .addDropdown(dropdown => dropdown
                .addOption('ollama', 'Ollama')
                .addOption('openai', 'OpenAI')
                .setValue(this.plugin.settings.provider)
                .onChange(async (value: string) => {
                    this.plugin.settings.provider = value as Provider;
                    await this.plugin.saveSettings();
                    this.display(); // Refresh display to show/hide relevant settings
                }));

        // OpenAI settings
        if (this.plugin.settings.provider === 'openai') {
            new Setting(containerEl)
                .setName('OpenAI API key')
                .setDesc('Enter your OpenAI API key to enable AI title generation')
                .addText(text => text
                    .setPlaceholder('Sk-...')
                    .setValue(this.plugin.settings.openaiApiKey)
                    .onChange(async (value) => {
                        this.plugin.settings.openaiApiKey = value;
                        await this.plugin.saveSettings();
                    }));
        }

        // Ollama settings
        if (this.plugin.settings.provider === 'ollama') {
            new Setting(containerEl)
                // eslint-disable-next-line obsidianmd/ui/sentence-case -- Ollama is a proper brand name
                .setName('Ollama URL')
                // eslint-disable-next-line obsidianmd/ui/sentence-case -- Ollama is a proper brand name
                .setDesc('Enter your Ollama server URL')
                .addText(text => text
                    .setPlaceholder('http://100.84.149.35:11434')
                    .setValue(this.plugin.settings.ollamaUrl)
                    .onChange(async (value) => {
                        this.plugin.settings.ollamaUrl = value;
                        await this.plugin.saveSettings();
                        // Reset flag and validate connection only when URL actually changes
                        AutoTitleSettingTab.modelsRefreshed = false;
                        void this.validateAndFetchModels();
                    }));

            new Setting(containerEl)
                // eslint-disable-next-line obsidianmd/ui/sentence-case -- Ollama is a proper brand name
                .setName('Ollama model')
                .setDesc('Select the model to use for title generation')
                .addDropdown(dropdown => {
                    // Add current model as option if not in available models
                    if (!this.plugin.settings.availableModels.includes(this.plugin.settings.ollamaModel)) {
                        dropdown.addOption(this.plugin.settings.ollamaModel, this.plugin.settings.ollamaModel);
                    }
                    // Add all available models
                    this.plugin.settings.availableModels.forEach(model => {
                        dropdown.addOption(model, model);
                    });

                    // Show message if no models available
                    if (this.plugin.settings.availableModels.length === 0) {
                        dropdown.addOption('', 'No models found - check connection');
                    }

                    return dropdown
                        .setValue(this.plugin.settings.ollamaModel)
                        .onChange(async (value) => {
                            this.plugin.settings.ollamaModel = value;
                            await this.plugin.saveSettings();
                        });
                })
                .addButton(button => button
                    .setIcon('refresh-cw')
                    .setTooltip('Refresh models')
                    .onClick(async () => {
                        await this.validateAndFetchModels();
                    }));
        }

        new Setting(containerEl)
            .setName('Auto-rename new files')
            .setDesc('Automatically generate titles for new files')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.autoRename)
                .onChange(async (value) => {
                    this.plugin.settings.autoRename = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Only rename untitled files')
            .setDesc('When auto-rename is enabled, only rename files that have "untitled" in their name, and only when the file is left or closed')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.onlyRenameUntitled)
                .onChange(async (value) => {
                    this.plugin.settings.onlyRenameUntitled = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl).setName('Usage').setHeading();
        containerEl.createEl('p', { text: 'Use the command palette (Cmd/Ctrl+P) and search for "Generate AI title" or click the brain icon in the ribbon to generate a title for the current file.' });
        containerEl.createEl('p', { text: 'When auto-rename is enabled, new files will automatically get AI-generated titles based on their content. Works with all text-based file types.' });

        if (this.plugin.settings.provider === 'ollama') {
            // eslint-disable-next-line obsidianmd/ui/sentence-case -- Ollama is a proper brand name
            containerEl.createEl('p', { text: 'Ollama provides local AI model execution with privacy and customization benefits.' });
        }

        new Setting(containerEl).setName('Title generation').setHeading();
        containerEl.createEl('p', { text: 'The AI uses a fixed prompt designed to generate concise 2-5 word titles that accurately describe your note content. The original file extension is preserved.' });
    }

    async validateAndFetchModels() {
        const isValid = await this.plugin.ollamaService.validateConnection();
        if (isValid) {
            const models = await this.plugin.ollamaService.fetchModels();
            this.plugin.settings.availableModels = models;
            await this.plugin.saveSettings();
            // Don't rebuild entire UI - let the dropdown stay open
        }
    }
}
