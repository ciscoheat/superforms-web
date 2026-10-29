import js from '@eslint/js';
import prettier from 'eslint-config-prettier/flat';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';
import ts from 'typescript-eslint';
import { defineConfig, globalIgnores } from 'eslint/config';
import svelteConfig from './svelte.config.js';

export default defineConfig(
  globalIgnores([
    '**/.*',
    '**/.DS_Store',
    'build/',
    '.svelte-kit/',
    '.vercel/',
    'package/',
    '.env',
    '.env.*',
    '!.env.example',
    '**/pnpm-lock.yaml',
    '**/package-lock.json',
    '**/yarn.lock'
  ]),
  js.configs.recommended,
  ts.configs.recommended,
  svelte.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node
      },
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        extraFileExtensions: ['.svelte']
      }
    }
  },
  {
    files: ['**/*.svelte'],
    languageOptions: {
      parserOptions: {
        parser: ts.parser,
        svelteConfig
      }
    }
  },
  prettier
);
