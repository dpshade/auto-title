import tsparser from "@typescript-eslint/parser";
import { defineConfig } from "eslint/config";
import obsidianmd from "eslint-plugin-obsidianmd";

export default defineConfig([
  {
    ignores: ["build.js", "main.js", "dist/**"],
  },
  ...obsidianmd.configs.recommended,
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: tsparser,
      parserOptions: { project: "./tsconfig.json" },
      globals: {
        console: "readonly",
        setTimeout: "readonly",
      },
    },
    rules: {
      // Override any rules if needed
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "obsidianmd/ui/sentence-case": ["error", {
        brands: ["OpenAI", "Ollama"],
        acronyms: ["API", "URL", "AI"]
      }],
    },
  },
]);