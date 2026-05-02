import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import security from 'eslint-plugin-security';
import noSecrets from 'eslint-plugin-no-secrets';

export default tseslint.config(
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.turbo/**',
      '**/coverage/**',
      '**/playwright-report/**',
      '**/test-results/**',
      '**/generated/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  security.configs.recommended,
  {
    files: ['**/*.{ts,tsx,js}'],
    plugins: { 'no-secrets': noSecrets },
    rules: {
      'no-secrets/no-secrets': ['error', { tolerance: 4.5 }],
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    plugins: { react, 'react-hooks': reactHooks },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: { window: 'readonly', document: 'readonly', console: 'readonly' },
    },
    settings: { react: { version: 'detect' } },
    rules: {
      'react/jsx-uses-react': 'off',
      'react/react-in-jsx-scope': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },
  {
    files: ['**/*.test.{ts,tsx}', '**/test/**/*'],
    rules: {
      'no-secrets/no-secrets': 'off',
      'security/detect-object-injection': 'off',
    },
  },
  {
    // Repository pattern uses controlled indices from findIndex — false positives.
    files: ['packages/mock-server/src/repositories/**/*'],
    rules: {
      'security/detect-object-injection': 'off',
    },
  },
  {
    // AI stubs index template arrays via deterministic hashIndex output bound
    // by `% modulo` — never external input.
    files: ['packages/mock-server/src/ai/**/*'],
    rules: {
      'security/detect-object-injection': 'off',
    },
  },
  {
    // Build-time Node scripts: read repo-controlled paths + locale dicts.
    // No user input reaches these — fs/object-injection rules are noise.
    files: ['apps/*/scripts/**/*.{js,mjs,cjs}'],
    languageOptions: {
      globals: { console: 'readonly', process: 'readonly' },
    },
    rules: {
      'security/detect-non-literal-fs-filename': 'off',
      'security/detect-object-injection': 'off',
    },
  },
);
