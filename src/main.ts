import { Plugin, TFile, Notice } from 'obsidian';
import { AutoTitleSettings, DEFAULT_SETTINGS } from './settings';
import { OpenAIService } from './api/openai';
import { OllamaService } from './api/ollama';
import { AutoTitleSettingTab } from './ui/settings-tab';
import { TitleGenerator } from './commands/title-generator';

export default class AutoTitlePlugin extends Plugin {
    settings: AutoTitleSettings = DEFAULT_SETTINGS;
    openaiService: OpenAIService;
    ollamaService: OllamaService;
    titleGenerator: TitleGenerator;
    untitledFiles: Set<string> = new Set();

    async onload() {
        await this.loadSettings();

        // Initialize services
        this.openaiService = new OpenAIService(this.settings);
        this.ollamaService = new OllamaService(this.settings);
        this.titleGenerator = new TitleGenerator(this);

        // Initialize providers based on current settings
        if (this.settings.provider === 'openai' && this.settings.openaiApiKey) {
            this.openaiService.initialize();
        }

        if (this.settings.provider === 'ollama' && this.settings.ollamaUrl) {
            this.initializeOllama();
        }

        // Register commands
        this.registerCommands();

        // Setup auto-rename functionality
        this.setupAutoRename();

        // Add settings tab
        this.addSettingTab(new AutoTitleSettingTab(this.app, this));
    }

    onunload() {
        // Clean up tracking
        this.untitledFiles.clear();
    }

    private registerCommands() {
        // Add command to manually generate title for current file
        this.addCommand({
            id: 'generate-title',
            name: 'Generate AI title for current file',
            callback: () => {
                const activeFile = this.app.workspace.getActiveFile();
                if (activeFile) {
                    this.titleGenerator.generateTitleForFile(activeFile);
                } else {
                    new Notice('No active file to rename');
                }
            }
        });

        // Add ribbon icon
        this.addRibbonIcon('brain-circuit', 'Generate AI title', () => {
            const activeFile = this.app.workspace.getActiveFile();
            if (activeFile) {
                this.titleGenerator.generateTitleForFile(activeFile);
            } else {
                new Notice('No active file to rename');
            }
        });
    }

    private setupAutoRename() {
        if (!this.settings.autoRename) {
            return;
        }

        if (this.settings.onlyRenameUntitled) {
            this.setupUntitledTracking();
        } else {
            this.setupImmediateRename();
        }
    }

    private setupUntitledTracking() {
        // Track when files with "Untitled" are opened and rename when left
        this.registerEvent(
            this.app.workspace.on('active-leaf-change', (leaf) => {
                const activeFile = this.app.workspace.getActiveFile();

                // Check if the new active file has "Untitled" in its name
                if (activeFile && activeFile.basename.includes('Untitled')) {
                    this.untitledFiles.add(activeFile.path);
                }
            })
        );

        // Listen for when the active file changes to rename the previous file if it was "Untitled"
        this.registerEvent(
            this.app.workspace.on('active-leaf-change', (leaf) => {
                // Get all currently tracked untitled files and check if any are no longer active
                const activeFile = this.app.workspace.getActiveFile();
                const currentActivePath = activeFile?.path;

                // Check each tracked file to see if it's no longer active
                for (const filePath of this.untitledFiles) {
                    if (filePath !== currentActivePath) {
                        const file = this.app.vault.getAbstractFileByPath(filePath);
                        if (file instanceof TFile && file.basename.includes('Untitled')) {
                            // File is no longer active and still has "Untitled" - rename it
                            setTimeout(() => {
                                this.titleGenerator.generateTitleForFile(file, true);
                            }, 500); // Small delay to ensure file is fully saved
                            this.untitledFiles.delete(filePath);
                        }
                    }
                }
            })
        );

        // Also handle file deletion/rename to clean up tracking
        this.registerEvent(
            this.app.vault.on('delete', (file) => {
                if (file instanceof TFile) {
                    this.untitledFiles.delete(file.path);
                }
            })
        );

        this.registerEvent(
            this.app.vault.on('rename', (file, oldPath) => {
                if (file instanceof TFile) {
                    this.untitledFiles.delete(oldPath);
                    // If renamed file still has "Untitled" and is not active, track it
                    const activeFile = this.app.workspace.getActiveFile();
                    if (file.basename.includes('Untitled') && file.path !== activeFile?.path) {
                        this.untitledFiles.add(file.path);
                    }
                }
            })
        );
    }

    private setupImmediateRename() {
        // Original behavior - rename immediately when created
        this.registerEvent(
            this.app.vault.on('create', (file) => {
                if (file instanceof TFile) {
                    // Wait a bit for the file to be created and potentially have content
                    setTimeout(() => {
                        this.titleGenerator.generateTitleForFile(file, true);
                    }, 1000);
                }
            })
        );
    }

    private async initializeOllama() {
        try {
            const isValid = await this.ollamaService.validateConnection();
            if (isValid) {
                const models = await this.ollamaService.fetchModels();
                this.settings.availableModels = models;
                await this.saveSettings();
                console.log(`Ollama initialized with ${models.length} models available`);
            } else {
                console.warn('Failed to connect to Ollama server');
            }
        } catch (error) {
            console.error('Failed to initialize Ollama:', error);
        }
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);

        // Reinitialize services with updated settings
        this.openaiService = new OpenAIService(this.settings);
        this.ollamaService = new OllamaService(this.settings);

        // Reinitialize providers based on current settings
        if (this.settings.provider === 'openai' && this.settings.openaiApiKey) {
            this.openaiService.initialize();
        }

        if (this.settings.provider === 'ollama' && this.settings.ollamaUrl) {
            this.initializeOllama();
        }
    }
}