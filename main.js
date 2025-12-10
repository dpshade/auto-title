"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

// src/main.ts
var main_exports = {};
__export(main_exports, {
  default: () => AutoTitlePlugin3
});
module.exports = __toCommonJS(main_exports);
var import_obsidian6 = require("obsidian");

// src/settings.ts
var DEFAULT_SETTINGS = {
  provider: "ollama",
  openaiApiKey: "",
  ollamaUrl: "http://localhost:11434",
  ollamaModel: "llama2:13b",
  availableModels: [],
  autoRename: true,
  onlyRenameUntitled: true
};

// src/api/openai.ts
var import_obsidian = require("obsidian");
var OpenAIService = class {
  constructor(settings) {
    this.settings = settings;
    __publicField(this, "isInitialized", false);
  }
  initialize() {
    if (this.settings.openaiApiKey) {
      this.isInitialized = true;
    } else {
      console.error("Failed to initialize OpenAI: API key not provided");
      new import_obsidian.Notice("Failed to initialize OpenAI. Please check your API key.");
    }
  }
  async generateTitle(content, prompt) {
    var _a, _b, _c;
    if (!this.isInitialized || !this.settings.openaiApiKey) {
      return null;
    }
    try {
      const response = await (0, import_obsidian.requestUrl)({
        url: "https://api.openai.com/v1/chat/completions",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.settings.openaiApiKey}`
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "user",
              content: prompt + content.substring(0, 2e3)
            }
          ],
          max_tokens: 50,
          temperature: 0.7
        })
      });
      const data = response.json;
      return ((_c = (_b = (_a = data.choices[0]) == null ? void 0 : _a.message) == null ? void 0 : _b.content) == null ? void 0 : _c.trim()) || null;
    } catch (error) {
      console.error("OpenAI API error:", error);
      throw error;
    }
  }
  isConfigured() {
    return Boolean(this.settings.openaiApiKey && this.isInitialized);
  }
};

// src/api/ollama.ts
var import_obsidian2 = require("obsidian");
var OllamaService = class {
  constructor(settings) {
    this.settings = settings;
  }
  async validateConnection() {
    try {
      const response = await (0, import_obsidian2.requestUrl)({
        url: `${this.settings.ollamaUrl}/api/tags`,
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      });
      return response.status >= 200 && response.status < 300;
    } catch (error) {
      console.error("Ollama connection error:", error);
      return false;
    }
  }
  async fetchModels() {
    var _a;
    try {
      const response = await (0, import_obsidian2.requestUrl)({
        url: `${this.settings.ollamaUrl}/api/tags`,
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      });
      if (response.status < 200 || response.status >= 300) {
        throw new Error(`Ollama API error: ${response.status}`);
      }
      const data = response.json;
      return ((_a = data.models) == null ? void 0 : _a.map((model) => model.name || model.model)) || [];
    } catch (error) {
      console.error("Error fetching Ollama models:", error);
      return [];
    }
  }
  async generateTitle(content, prompt) {
    try {
      const response = await (0, import_obsidian2.requestUrl)({
        url: `${this.settings.ollamaUrl}/api/chat`,
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: this.settings.ollamaModel,
          messages: [
            {
              role: "user",
              content: prompt + content.substring(0, 2e3)
            }
          ],
          stream: false,
          options: {
            temperature: 0.7,
            num_predict: 50
          }
        })
      });
      if (response.status < 200 || response.status >= 300) {
        throw new Error(`Ollama API error: ${response.status}`);
      }
      const data = response.json;
      if (data.message && data.message.content) {
        return data.message.content.trim() || null;
      }
      return null;
    } catch (error) {
      console.error("Ollama API error:", error);
      throw error;
    }
  }
  isConfigured() {
    return Boolean(this.settings.ollamaUrl);
  }
};

// src/ui/settings-tab.ts
var import_obsidian3 = require("obsidian");
var _AutoTitleSettingTab = class _AutoTitleSettingTab extends import_obsidian3.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    __publicField(this, "plugin");
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    new import_obsidian3.Setting(containerEl).setName("Configuration").setHeading();
    if (this.plugin.settings.provider === "ollama" && this.plugin.settings.ollamaUrl && !_AutoTitleSettingTab.modelsRefreshed) {
      _AutoTitleSettingTab.modelsRefreshed = true;
      void this.validateAndFetchModels();
    }
    new import_obsidian3.Setting(containerEl).setName("AI provider").setDesc("Choose which AI provider to use for title generation").addDropdown((dropdown) => dropdown.addOption("ollama", "Ollama").addOption("openai", "OpenAI").setValue(this.plugin.settings.provider).onChange(async (value) => {
      this.plugin.settings.provider = value;
      await this.plugin.saveSettings();
      this.display();
    }));
    if (this.plugin.settings.provider === "openai") {
      new import_obsidian3.Setting(containerEl).setName("OpenAI API key").setDesc("Enter your OpenAI API key to enable AI title generation").addText((text) => text.setPlaceholder("Sk-...").setValue(this.plugin.settings.openaiApiKey).onChange(async (value) => {
        this.plugin.settings.openaiApiKey = value;
        await this.plugin.saveSettings();
      }));
    }
    if (this.plugin.settings.provider === "ollama") {
      new import_obsidian3.Setting(containerEl).setName("Ollama URL").setDesc("Enter your Ollama server URL").addText((text) => text.setPlaceholder("http://100.84.149.35:11434").setValue(this.plugin.settings.ollamaUrl).onChange(async (value) => {
        this.plugin.settings.ollamaUrl = value;
        await this.plugin.saveSettings();
        _AutoTitleSettingTab.modelsRefreshed = false;
        void this.validateAndFetchModels();
      }));
      new import_obsidian3.Setting(containerEl).setName("Ollama model").setDesc("Select the model to use for title generation").addDropdown((dropdown) => {
        if (!this.plugin.settings.availableModels.includes(this.plugin.settings.ollamaModel)) {
          dropdown.addOption(this.plugin.settings.ollamaModel, this.plugin.settings.ollamaModel);
        }
        this.plugin.settings.availableModels.forEach((model) => {
          dropdown.addOption(model, model);
        });
        if (this.plugin.settings.availableModels.length === 0) {
          dropdown.addOption("", "No models found - check connection");
        }
        return dropdown.setValue(this.plugin.settings.ollamaModel).onChange(async (value) => {
          this.plugin.settings.ollamaModel = value;
          await this.plugin.saveSettings();
        });
      }).addButton((button) => button.setIcon("refresh-cw").setTooltip("Refresh models").onClick(async () => {
        await this.validateAndFetchModels();
      }));
    }
    new import_obsidian3.Setting(containerEl).setName("Auto-rename new files").setDesc("Automatically generate titles for new files").addToggle((toggle) => toggle.setValue(this.plugin.settings.autoRename).onChange(async (value) => {
      this.plugin.settings.autoRename = value;
      await this.plugin.saveSettings();
    }));
    new import_obsidian3.Setting(containerEl).setName("Only rename untitled files").setDesc('When auto-rename is enabled, only rename files that have "untitled" in their name, and only when the file is left or closed').addToggle((toggle) => toggle.setValue(this.plugin.settings.onlyRenameUntitled).onChange(async (value) => {
      this.plugin.settings.onlyRenameUntitled = value;
      await this.plugin.saveSettings();
    }));
    new import_obsidian3.Setting(containerEl).setName("Usage").setHeading();
    containerEl.createEl("p", { text: 'Use the command palette (Cmd/Ctrl+P) and search for "Generate AI title" or click the brain icon in the ribbon to generate a title for the current file.' });
    containerEl.createEl("p", { text: "When auto-rename is enabled, new files will automatically get AI-generated titles based on their content. Works with all text-based file types." });
    if (this.plugin.settings.provider === "ollama") {
      containerEl.createEl("p", { text: "Ollama provides local AI model execution with privacy and customization benefits." });
    }
    new import_obsidian3.Setting(containerEl).setName("Title generation").setHeading();
    containerEl.createEl("p", { text: "The AI uses a fixed prompt designed to generate concise 2-5 word titles that accurately describe your note content. The original file extension is preserved." });
  }
  async validateAndFetchModels() {
    const isValid = await this.plugin.ollamaService.validateConnection();
    if (isValid) {
      const models = await this.plugin.ollamaService.fetchModels();
      this.plugin.settings.availableModels = models;
      await this.plugin.saveSettings();
    }
  }
};
__publicField(_AutoTitleSettingTab, "modelsRefreshed", false);
var AutoTitleSettingTab = _AutoTitleSettingTab;

// src/commands/title-generator.ts
var import_obsidian5 = require("obsidian");

// src/utils/constants.ts
var TITLE_GENERATION_PROMPT = `Analyze the following note content and create a precise title. Identify the single most important CORE NOUN that represents what this note is about, then add 2-4 helper words that provide essential context.

Respond with ONLY a JSON object in this exact format:
{"title": "your generated title here"}

Examples:
{"title": "Project Planning Meeting"}
{"title": "Database Schema Design"}
{"title": "Python Error Handling"}

The title should be 2-5 words maximum. Do not include quotes around individual words, explanations, or multiple options.

Content to analyze:

`;

// src/utils/title-extractor.ts
var TitleExtractor = class {
  /**
   * Extract title from LLM response using multiple parsing strategies
   */
  static extractTitle(response) {
    if (!response || response.trim().length === 0) {
      return null;
    }
    const cleanResponse = response.trim();
    const jsonTitle = this.extractFromJSON(cleanResponse);
    if (jsonTitle) {
      return jsonTitle;
    }
    const codeBlockTitle = this.extractFromCodeBlock(cleanResponse);
    if (codeBlockTitle) {
      return codeBlockTitle;
    }
    const jsonPatternTitle = this.extractFromJSONPattern(cleanResponse);
    if (jsonPatternTitle) {
      return jsonPatternTitle;
    }
    const quotedTitle = this.extractFromQuotes(cleanResponse);
    if (quotedTitle) {
      return quotedTitle;
    }
    const firstLineTitle = this.extractFromFirstLine(cleanResponse);
    if (firstLineTitle) {
      return firstLineTitle;
    }
    return null;
  }
  /**
   * Try to parse as proper JSON
   */
  static extractFromJSON(response) {
    try {
      const parsed = JSON.parse(response);
      return parsed.title || null;
    } catch (e) {
      return null;
    }
  }
  /**
   * Extract JSON from code blocks (```json or ```)
   */
  static extractFromCodeBlock(response) {
    const codeBlockRegex = /```(?:json)?\s*\n?(.*?)\n?```/s;
    const match = response.match(codeBlockRegex);
    if (match && match[1]) {
      try {
        const parsed = JSON.parse(match[1].trim());
        return parsed.title || null;
      } catch (e) {
        return null;
      }
    }
    return null;
  }
  /**
   * Look for JSON-like patterns even if not properly formatted
   */
  static extractFromJSONPattern(response) {
    const jsonPatternRegex = /\{\s*["']?title["']?\s*:\s*["']([^"']+)["']\s*\}/i;
    const match = response.match(jsonPatternRegex);
    if (match && match[1]) {
      return match[1].trim();
    }
    return null;
  }
  /**
   * Extract title from quoted text
   */
  static extractFromQuotes(response) {
    const quotedRegex = /["']([^"']{2,50})["']/;
    const match = response.match(quotedRegex);
    if (match && match[1]) {
      const title = match[1].trim();
      const wordCount = title.split(/\s+/).length;
      if (wordCount >= 2 && wordCount <= 5 && title.length <= 50) {
        return title;
      }
    }
    return null;
  }
  /**
   * Use first line if it looks like a title
   */
  static extractFromFirstLine(response) {
    const firstLine = response.split("\n")[0].trim();
    const cleanLine = firstLine.replace(/^(title:\s*|answer:\s*|result:\s*)/i, "").replace(/^["']|["']$/g, "").trim();
    const wordCount = cleanLine.split(/\s+/).length;
    if (wordCount >= 2 && wordCount <= 8 && cleanLine.length <= 100 && cleanLine.length >= 5) {
      return cleanLine;
    }
    return null;
  }
  /**
   * Validate and clean extracted title
   */
  static validateAndCleanTitle(title) {
    if (!title) return null;
    const cleaned = title.replace(/["`]/g, "").replace(/[\\/:*?"<>|]/g, "-").replace(/\s+/g, " ").trim();
    const wordCount = cleaned.split(/\s+/).length;
    if (cleaned.length < 2 || cleaned.length > 100 || wordCount < 1 || wordCount > 10) {
      return null;
    }
    return cleaned;
  }
};

// src/ui/loading-toast.ts
var import_obsidian4 = require("obsidian");
var LoadingToast = class {
  constructor() {
    __publicField(this, "notice", null);
  }
  show() {
    this.hide();
    this.notice = new import_obsidian4.Notice("Generating title...", 0);
  }
  hide() {
    if (this.notice) {
      this.notice.hide();
      this.notice = null;
    }
  }
};

// src/commands/title-generator.ts
var TitleGenerator = class {
  constructor(plugin) {
    this.plugin = plugin;
  }
  async generateTitleForFile(file, isAutoRename = false) {
    var _a;
    if (this.plugin.settings.provider === "openai" && !this.plugin.openaiService.isConfigured()) {
      new import_obsidian5.Notice("OpenAI not configured. Please set your API key in settings.");
      return;
    }
    if (this.plugin.settings.provider === "ollama" && !this.plugin.ollamaService.isConfigured()) {
      new import_obsidian5.Notice("Ollama not configured. Please set your Ollama URL in settings.");
      return;
    }
    try {
      let content;
      try {
        content = await this.plugin.app.vault.read(file);
      } catch (e) {
        if (!isAutoRename) {
          new import_obsidian5.Notice("Cannot read file content - may be a binary file");
        }
        return;
      }
      if (content.trim().length < 10) {
        if (!isAutoRename) {
          new import_obsidian5.Notice("File content is too short to generate a meaningful title");
        }
        return;
      }
      if (content.length > 1e5) {
        if (!isAutoRename) {
          new import_obsidian5.Notice("File is too large for title generation");
        }
        return;
      }
      if (isAutoRename && this.plugin.settings.onlyRenameUntitled && !file.basename.startsWith("Untitled")) {
        return;
      }
      const loadingToast = new LoadingToast();
      loadingToast.show();
      let rawResponse = null;
      try {
        if (this.plugin.settings.provider === "openai") {
          rawResponse = await this.plugin.openaiService.generateTitle(content, TITLE_GENERATION_PROMPT);
        } else if (this.plugin.settings.provider === "ollama") {
          rawResponse = await this.plugin.ollamaService.generateTitle(content, TITLE_GENERATION_PROMPT);
        }
      } finally {
        loadingToast.hide();
      }
      if (!rawResponse) {
        new import_obsidian5.Notice("Failed to get response from AI service");
        return;
      }
      const extractedTitle = TitleExtractor.extractTitle(rawResponse);
      if (!extractedTitle) {
        new import_obsidian5.Notice("Failed to extract valid title from AI response");
        console.debug("Raw AI response:", rawResponse);
        return;
      }
      const cleanTitle = TitleExtractor.validateAndCleanTitle(extractedTitle);
      if (!cleanTitle) {
        new import_obsidian5.Notice("Generated title failed validation");
        return;
      }
      const dir = ((_a = file.parent) == null ? void 0 : _a.path) || "";
      const extension = file.extension;
      const newPath = dir ? `${dir}/${cleanTitle}.${extension}` : `${cleanTitle}.${extension}`;
      const existingFile = this.plugin.app.vault.getAbstractFileByPath(newPath);
      if (existingFile && existingFile !== file) {
        new import_obsidian5.Notice(`File "${cleanTitle}.${extension}" already exists`);
        return;
      }
      await this.plugin.app.fileManager.renameFile(file, newPath);
      new import_obsidian5.Notice(`File renamed to: ${cleanTitle}.${extension}`);
    } catch (error) {
      console.error("Error generating title:", error);
      new import_obsidian5.Notice(`Failed to generate title using ${this.plugin.settings.provider}. Please check your configuration and try again.`);
    }
  }
};

// src/main.ts
var AutoTitlePlugin3 = class extends import_obsidian6.Plugin {
  constructor() {
    super(...arguments);
    __publicField(this, "settings", DEFAULT_SETTINGS);
    __publicField(this, "openaiService");
    __publicField(this, "ollamaService");
    __publicField(this, "titleGenerator");
    __publicField(this, "untitledFiles", /* @__PURE__ */ new Set());
  }
  async onload() {
    await this.loadSettings();
    this.openaiService = new OpenAIService(this.settings);
    this.ollamaService = new OllamaService(this.settings);
    this.titleGenerator = new TitleGenerator(this);
    if (this.settings.provider === "openai" && this.settings.openaiApiKey) {
      this.openaiService.initialize();
    }
    if (this.settings.provider === "ollama" && this.settings.ollamaUrl) {
      void this.initializeOllama();
    }
    this.registerCommands();
    this.setupAutoRename();
    this.addSettingTab(new AutoTitleSettingTab(this.app, this));
  }
  onunload() {
    this.untitledFiles.clear();
  }
  registerCommands() {
    this.addCommand({
      id: "generate-title",
      name: "Generate AI title for current file",
      callback: () => {
        const activeFile = this.app.workspace.getActiveFile();
        if (activeFile) {
          void this.titleGenerator.generateTitleForFile(activeFile);
        } else {
          new import_obsidian6.Notice("No active file to rename");
        }
      }
    });
    this.addRibbonIcon("brain-circuit", "Generate AI title", () => {
      const activeFile = this.app.workspace.getActiveFile();
      if (activeFile) {
        void this.titleGenerator.generateTitleForFile(activeFile);
      } else {
        new import_obsidian6.Notice("No active file to rename");
      }
    });
  }
  setupAutoRename() {
    if (!this.settings.autoRename) {
      return;
    }
    if (this.settings.onlyRenameUntitled) {
      this.setupUntitledTracking();
    } else {
      this.setupImmediateRename();
    }
  }
  setupUntitledTracking() {
    this.registerEvent(
      this.app.workspace.on("active-leaf-change", () => {
        const activeFile = this.app.workspace.getActiveFile();
        if (activeFile && activeFile.basename.includes("Untitled")) {
          this.untitledFiles.add(activeFile.path);
        }
      })
    );
    this.registerEvent(
      this.app.workspace.on("active-leaf-change", () => {
        const activeFile = this.app.workspace.getActiveFile();
        const currentActivePath = activeFile == null ? void 0 : activeFile.path;
        for (const filePath of this.untitledFiles) {
          if (filePath !== currentActivePath) {
            const file = this.app.vault.getAbstractFileByPath(filePath);
            if (file instanceof import_obsidian6.TFile && file.basename.includes("Untitled")) {
              setTimeout(() => {
                void this.titleGenerator.generateTitleForFile(file, true);
              }, 500);
              this.untitledFiles.delete(filePath);
            }
          }
        }
      })
    );
    this.registerEvent(
      this.app.vault.on("delete", (file) => {
        if (file instanceof import_obsidian6.TFile) {
          this.untitledFiles.delete(file.path);
        }
      })
    );
    this.registerEvent(
      this.app.vault.on("rename", (file, oldPath) => {
        if (file instanceof import_obsidian6.TFile) {
          this.untitledFiles.delete(oldPath);
          const activeFile = this.app.workspace.getActiveFile();
          if (file.basename.includes("Untitled") && file.path !== (activeFile == null ? void 0 : activeFile.path)) {
            this.untitledFiles.add(file.path);
          }
        }
      })
    );
  }
  setupImmediateRename() {
    this.registerEvent(
      this.app.vault.on("create", (file) => {
        if (file instanceof import_obsidian6.TFile) {
          setTimeout(() => {
            void this.titleGenerator.generateTitleForFile(file, true);
          }, 1e3);
        }
      })
    );
  }
  async initializeOllama() {
    try {
      const isValid = await this.ollamaService.validateConnection();
      if (isValid) {
        const models = await this.ollamaService.fetchModels();
        this.settings.availableModels = models;
        await this.saveSettings();
        console.debug(`Ollama initialized with ${models.length} models available`);
      } else {
        console.warn("Failed to connect to Ollama server");
      }
    } catch (error) {
      console.error("Failed to initialize Ollama:", error);
    }
  }
  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }
  async saveSettings() {
    await this.saveData(this.settings);
    this.openaiService = new OpenAIService(this.settings);
    this.ollamaService = new OllamaService(this.settings);
    if (this.settings.provider === "openai" && this.settings.openaiApiKey) {
      this.openaiService.initialize();
    }
    if (this.settings.provider === "ollama" && this.settings.ollamaUrl) {
      void this.initializeOllama();
    }
  }
};
