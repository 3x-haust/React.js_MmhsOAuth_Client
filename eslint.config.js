import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import prettier from 'eslint-plugin-prettier'
import importPlugin from 'eslint-plugin-import'
import boundaries from 'eslint-plugin-boundaries'
import prettierConfig from 'eslint-config-prettier'

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      prettierConfig,
    ],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      prettier,
      import: importPlugin,
      boundaries,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      'prettier/prettier': 'error',
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          pathGroups: [
            {
              pattern: '{app,pages,widgets,features,entities,shared}/**',
              group: 'internal',
              position: 'after'
            }
          ],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true
          }
        }
      ],
      'boundaries/element-types': [
        'error',
        {
          default: 'disallow',
          rules: [
            {
              from: 'app',
              allow: ['pages', 'widgets', 'features', 'entities', 'shared']
            },
            {
              from: 'pages',
              allow: ['widgets', 'features', 'entities', 'shared']
            },
            {
              from: 'widgets',
              allow: ['features', 'entities', 'shared']
            },
            {
              from: 'features',
              allow: ['entities', 'shared']
            },
            {
              from: 'entities',
              allow: ['shared']
            },
            {
              from: 'shared',
              allow: ['shared']
            }
          ]
        }
      ]
    },
    settings: {
      'boundaries/elements': [
        {
          type: 'app',
          pattern: 'app/**'
        },
        {
          type: 'pages',
          pattern: 'pages/**'
        },
        {
          type: 'widgets',
          pattern: 'widgets/**'
        },
        {
          type: 'features',
          pattern: 'features/**'
        },
        {
          type: 'entities',
          pattern: 'entities/**'
        },
        {
          type: 'shared',
          pattern: 'shared/**'
        }
      ]
    }
  },
)
