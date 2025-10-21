// @ts-check
import tseslint from 'typescript-eslint';
import eslint from '@eslint/js';
import eslintReactNative from 'eslint-plugin-react-native';
import { fixupPluginRules } from '@eslint/compat';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

export default tseslint.config(
  {
    ignores: [
      '**/node_modules/',
      '**/lib/',
      '**/example/',
      '**/scripts/',
      '**/report-scripts/',
      '.prettierrc.js',
      '**/*.mjs',
      '**/babel.config.js',
      'index.js',
      '**/jest.config.js',
    ],
  },
  eslint.configs.recommended,
  {
    plugins: {
      '@typescript-eslint': tseslint.plugin,
    },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        projectService: true,
      },
    },
    files: ['**/src/**/*.ts', '**/src/**/*.tsx'],
    rules: {
      '@typescript-eslint/no-shadow': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-undef': 'off',
      'no-unused-vars': 'off',
      'no-async-promise-executor': 'off',
    },
  },
  {
    name: 'eslint-plugin-react-native',
    plugins: {
      'react-native': fixupPluginRules({
        // @ts-ignore
        rules: eslintReactNative.rules,
      }),
    },
    rules: {
      ...eslintReactNative.configs.all.rules,
    },
  },
  eslintPluginPrettierRecommended
);
