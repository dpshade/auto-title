#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const DIST_DIR = 'dist';
const PLUGIN_FILES = ['main.js', 'manifest.json', 'styles.css', 'versions.json'];

// Get vault path from config file
const configPath = path.join(__dirname, '.obsidian-vault-path');
let VAULT_PATH = null;
if (fs.existsSync(configPath)) {
    VAULT_PATH = fs.readFileSync(configPath, 'utf8').trim();
}

function ensureDir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

function copyFile(src, dest) {
    if (fs.existsSync(src)) {
        fs.copyFileSync(src, dest);
        return true;
    }
    return false;
}

function build() {
    console.log('🚀 Building Auto Title plugin...');

    // Step 1: Compile TypeScript
    try {
        execSync('esbuild src/main.ts --bundle --platform=node --target=es2018 --format=esm --outfile=main.js --external:obsidian --external:electron', { stdio: 'pipe' });
        console.log('✅ TypeScript compiled');
    } catch (error) {
        console.error('❌ TypeScript compilation failed');
        process.exit(1);
    }

    // Step 2: Create dist directory and copy files
    ensureDir(DIST_DIR);

    PLUGIN_FILES.forEach(file => {
        const src = path.join(__dirname, file);
        const dest = path.join(__dirname, DIST_DIR, file);
        copyFile(src, dest);
    });

    console.log(`✅ Plugin built in ${DIST_DIR}/`);

    // Step 3: Deploy to vault if configured
    if (VAULT_PATH) {
        const pluginDir = path.join(VAULT_PATH, '.obsidian', 'plugins', 'auto-title');
        ensureDir(pluginDir);

        PLUGIN_FILES.forEach(file => {
            const src = path.join(__dirname, DIST_DIR, file);
            const dest = path.join(pluginDir, file);
            copyFile(src, dest);
        });

        console.log(`🚀 Deployed to vault: ${pluginDir}`);
    } else {
        console.log('💡 Set vault path: echo "/path/to/vault" > .obsidian-vault-path');
    }
}

// Handle vault path setting
if (process.argv[2] === 'set-vault-path') {
    const vaultPath = process.argv[3];
    if (!vaultPath) {
        console.error('❌ Usage: bun run set-vault-path "/path/to/vault"');
        process.exit(1);
    }

    fs.writeFileSync(configPath, vaultPath);
    console.log(`✅ Vault path saved: ${vaultPath}`);
} else {
    build();
} 