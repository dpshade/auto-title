# Auto Title - Obsidian Plugin
<!-- trigger rescan -->

An Obsidian plugin that automatically generates meaningful titles for your notes and files using AI providers like Ollama's local language models or OpenAI's GPT models.

## Features

**Multiple AI Providers**: Choose between Ollama (local, private, free) or OpenAI (cloud-based) for title generation. The plugin works with all text-based file types and can automatically rename new files when they're created or generate titles on-demand for existing files. All original file extensions are preserved during renaming.

## Supported AI Providers

**Ollama** supports various local language models (llama2, llama3, phi, etc.) and runs locally on your machine for privacy. No API key required and completely offline. Configurable endpoint URL defaults to http://localhost:11434.

**OpenAI** uses GPT-3.5-turbo model by default, requires an OpenAI API key, and uses the standard chat completions endpoint.

## Installation

Download the latest release from the [releases page](https://github.com/dpshade/auto-title/releases) and extract the files to your vault's `.obsidian/plugins/auto-title/` folder. Enable the plugin in Obsidian's Community Plugins settings.

For manual installation, clone this repository to your vault's `.obsidian/plugins/` folder, run `bun install` to install dependencies, then `bun run build` to build the plugin. Enable the plugin in Obsidian's settings.

## Setup

**For Ollama**: Install Ollama from [Ollama's website](https://ollama.ai/), start it locally, pull a language model with `ollama pull llama2`, then configure the plugin to use "Ollama" as your AI Provider and select your desired model.

**For OpenAI**: Get an OpenAI API key from [OpenAI's platform](https://platform.openai.com/api-keys), then configure the plugin to use "OpenAI" as your AI Provider and enter your API key.

## Usage

**Automatic Renaming**: When enabled, the plugin generates titles for new files based on their content after waiting for the file to have some content. Works with all text-based file types up to 100KB.

**Manual Title Generation**: Use the Command Palette (search for "Generate AI title for current file"), click the ribbon icon, or use the right-click context menu.

## Configuration

The plugin uses a fixed, optimized prompt to ensure consistent results: "You must analyze the following note content and return ONLY a few words (2-5 words maximum) that accurately describe what this note is about. Do not include quotes, explanations, or any other text. Return only the title words:"

Configure your AI provider, API keys, server URLs, and auto-rename preferences in the plugin settings.

## API Usage & Costs

**Ollama** is completely FREE and runs entirely on your local machine with complete privacy. No data is sent to external servers. Requires local Ollama installation and sufficient system resources.

**OpenAI** incurs costs based on usage (~50-100 tokens per title generation, estimated $0.001-0.002 per title generation). See [OpenAI's pricing page](https://openai.com/pricing) for current rates.

## Privacy & Security

API keys are stored locally in Obsidian's settings. Note content is sent to your selected AI provider's servers for title generation (OpenAI) or processed locally (Ollama). Only the first 2000 characters of each file are sent to preserve context. Binary files are automatically skipped for safety. No data is stored or logged by this plugin.

## Development

**Build Commands**:
```bash
bun run build                                    # Build to dist/ directory
bun run set-vault-path "/path/to/your/vault"    # Set auto-deployment path
```

The build system compiles the plugin and copies necessary files (main.js, manifest.json, styles.css, versions.json) to the `dist/` directory. After setting a vault path, the build command automatically deploys to your Obsidian vault's plugin directory.

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Support

Report bugs and request features at [GitHub Issues](https://github.com/dpshade/auto-title/issues).

## Changelog

**v1.0.0** - Initial release with Ollama and OpenAI integration, auto-rename functionality for new files, manual title generation command, customizable provider selection, and settings panel with dynamic configuration.