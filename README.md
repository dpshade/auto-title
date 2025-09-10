# Auto Title - Obsidian Plugin

An Obsidian plugin that automatically generates meaningful titles for your notes and files using AI providers like OpenAI's GPT models or Perplexity's reasoning models.

## Features

- 🤖 **Multiple AI Providers**: Choose between OpenAI or Perplexity for title generation
- 📄 **All File Types**: Works with all text-based files (.md, .txt, .json, .css, .js, etc.)
- ⚡ **Auto-Rename**: Automatically renames new files when they're created (optional)
- 🎯 **Manual Generation**: Generate titles on-demand for existing files
- 🎯 **Fixed Prompt**: Uses an optimized prompt to generate concise 2-5 word titles
- 🔒 **Extension Preservation**: Maintains original file extensions when renaming
- 🌐 **Configurable URLs**: Set custom API endpoints for different providers
- 🎨 **Clean Interface**: Simple settings panel and ribbon icon for easy access

## Supported AI Providers

### OpenAI
- Uses GPT-3.5-turbo model by default
- Requires OpenAI API key
- Standard chat completions endpoint

### Perplexity
- Uses llama-3.1-sonar-small-128k-online model
- Requires Perplexity API key
- Enhanced search capabilities and reasoning for contextually aware titles
- Configurable base URL (default: https://api.perplexity.ai)

## Installation

### From GitHub Releases
1. Download the latest release from the [releases page](https://github.com/yourusername/auto-title/releases)
2. Extract the files to your vault's `.obsidian/plugins/auto-title/` folder
3. Enable the plugin in Obsidian's Community Plugins settings

### Manual Installation
1. Clone this repository to your vault's `.obsidian/plugins/` folder
2. Run `bun install` to install dependencies
3. Run `bun run build` to build the plugin
4. Enable the plugin in Obsidian's settings

## Setup

### OpenAI Setup
1. Get an OpenAI API key from [OpenAI's website](https://platform.openai.com/api-keys)
2. Open Obsidian Settings → Community Plugins → Auto Title
3. Select "OpenAI" as your AI Provider
4. Enter your OpenAI API key

### Perplexity Setup
1. Get a Perplexity API key from [Perplexity's website](https://docs.perplexity.ai/)
2. Open Obsidian Settings → Community Plugins → Auto Title
3. Select "Perplexity" as your AI Provider
4. Enter your Perplexity API key
5. Optionally configure the base URL (default: https://api.perplexity.ai)

### Additional Configuration
- **Auto-rename new files**: Enable/disable automatic renaming

## Usage

### Automatic Renaming
When enabled, the plugin will automatically generate titles for new files based on their content. It waits for the file to have some content before generating a title. Works with all text-based file types.

**Safety Features:**
- Automatically skips binary files
- Handles files up to 100KB in size
- Preserves original file extensions
- Graceful error handling for unreadable files

### Manual Title Generation
- **Command Palette**: Press `Cmd/Ctrl + P` and search for "Generate AI title for current file"
- **Ribbon Icon**: Click the brain icon in the left ribbon
- **Right-click menu**: Use the context menu option (if available)

## Configuration

### Settings

- **AI Provider**: Choose between OpenAI or Perplexity
- **OpenAI API Key**: Your OpenAI API key (when using OpenAI)
- **Perplexity API Key**: Your Perplexity API key (when using Perplexity)
- **Perplexity Base URL**: Custom API endpoint for Perplexity (optional)
- **Auto-rename new files**: Automatically generate titles for newly created files

### Title Generation Prompt
The plugin uses a fixed, optimized prompt to ensure consistent results:
```
You must analyze the following note content and return ONLY a few words (2-5 words maximum) that accurately describe what this note is about. Do not include quotes, explanations, or any other text. Return only the title words:
```

This prompt is not customizable to ensure reliable, concise title generation across all use cases.

## Development

### Prerequisites
- [Bun](https://bun.sh/) (recommended) or Node.js
- TypeScript

### Build Commands
```bash
# Build plugin to dist/ directory
bun run build

# Set Obsidian vault path for auto-deployment
bun run set-vault-path "/path/to/your/vault"

# After setting vault path, build command will auto-deploy
bun run build
```

### Build System
The build system compiles the plugin and copies necessary files to the `dist/` directory:
- `main.js` (compiled from main.ts)
- `manifest.json`
- `styles.css`
- `versions.json`

If you set a vault path using `bun run set-vault-path`, the build command will automatically deploy the plugin to your Obsidian vault's plugin directory.

### Project Structure
```
auto-title/
├── main.ts          # Main plugin file
├── manifest.json    # Plugin manifest
├── package.json     # Dependencies and scripts
├── styles.css       # Plugin styles
├── versions.json    # Version compatibility
├── build.js         # Build script
├── dist/            # Built plugin files (generated)
└── README.md        # Documentation
```

## API Usage & Costs

### OpenAI
This plugin uses OpenAI's API, which incurs costs based on usage:
- **Model**: GPT-3.5-Turbo (default)
- **Token Usage**: ~50-100 tokens per title generation
- **Estimated Cost**: $0.001-0.002 per title generation

For current pricing, see [OpenAI's pricing page](https://openai.com/pricing).

### Perplexity
This plugin can use Perplexity's API:
- **Model**: llama-3.1-sonar-small-128k-online
- **Token Usage**: ~50-100 tokens per title generation
- **Features**: Enhanced search capabilities and reasoning

For current pricing, see [Perplexity's pricing page](https://docs.perplexity.ai/).

## Privacy & Security

- Your API keys are stored locally in Obsidian's settings
- Note content is sent to the selected AI provider's servers for title generation
- Only the first 2000 characters of each file are sent to preserve context
- Binary files are automatically skipped for safety
- No data is stored or logged by this plugin
- **OpenAI**: Data handling per OpenAI's privacy policy
- **Perplexity**: Zero day retention policy, no data used for training

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Support

- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/yourusername/auto-title/issues)
- 💡 **Feature Requests**: [GitHub Discussions](https://github.com/yourusername/auto-title/discussions)
- 📖 **Documentation**: [Wiki](https://github.com/yourusername/auto-title/wiki)

## Changelog

### v1.0.0
- Initial release
- OpenAI integration for AI-powered title generation
- Perplexity integration with enhanced search capabilities
- Auto-rename functionality for new files
- Manual title generation command
- Customizable prompts and provider selection
- Settings panel with dynamic configuration
# auto-title
