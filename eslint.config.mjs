// @ts-check
import tseslint from 'typescript-eslint';
import eslint from '@eslint/js';
import eslintReactNative from 'eslint-plugin-react-native';
import { fixupPluginRules } from '@eslint/compat';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

export default tseslint.config(
    {
        ignores: ["**/node_modules/", "**/libs/**", "**/packages/example/**", "**/scripts/"],
        files: ["**/packages/sdk/src/**/*.ts", "**/packages/sdk/src/**/*.tsx"],
        extends: [eslint.configs.recommended],
        plugins: {
            '@typescript-eslint': tseslint.plugin,
        },
        languageOptions: {
            parser: tseslint.parser,
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
        rules: {
            '@typescript-eslint/no-shadow': 'error',
            'no-undef': 'off',
            '@typescript-eslint/no-unused-vars': ['error', { "argsIgnorePattern": "^_" }],
            'no-unused-vars': 'off',
            'no-async-promise-executor': 'off'
        },
    },
    {
        name: 'eslint-plugin-react-native',
        plugins: {
            'react-native': fixupPluginRules({
                rules: eslintReactNative.rules,
            }),
        },
        rules: {
            ...eslintReactNative.configs.all.rules,
        },
    },
    eslintPluginPrettierRecommended
);