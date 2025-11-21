
import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import prettier from 'eslint-config-prettier';

export default [
  {
    ...js.configs.recommended,
    ignores: [
      'node_modules/',
      'dist/**',
      'dist-lib/**',
      '.env',
      '*.config.js',
      '*.config.ts',
      '*.config.cjs',
      '*.config.mjs',
      '*.config.json',
      '*.d.ts',
      'vite.config.*',
      'postcss.config.*',
      'tailwind.config.*',
      'eslint.config.js',
      'package.json',
      'tsconfig.json',
    ],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { browser: true, node: true },
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      react,
      'react-hooks': reactHooks,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-module-boundary-types': 'off',
    },
    settings: {
      react: { version: 'detect' },
    },
  },
  prettier,
];
