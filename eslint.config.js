import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import pluginVue from 'eslint-plugin-vue'
import prettier from 'eslint-config-prettier'
import globals from 'globals'

export default tseslint.config(
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      '**/coverage/**',
      '**/.nuxt/**',
      '**/.output/**',
      '**/components.d.ts',
      // Playwright 运行产物（trace 里的 js 会被当成源码检查）
      '**/test-results/**',
      '**/playwright-report/**',
      'docs/**',
    ],
  },

  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginVue.configs['flat/recommended'],

  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: {
        // .vue 内的 <script lang="ts"> 交给 typescript-eslint 解析
        parser: tseslint.parser,
        extraFileExtensions: ['.vue'],
        sourceType: 'module',
      },
    },
  },

  {
    files: ['**/*.{js,mjs,ts,vue}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      // 组件名必须 PascalCase（第二章命名规范）
      'vue/component-definition-name-casing': ['error', 'PascalCase'],
      // 组件必须有显式 name，便于 devtools 与按需注册
      'vue/require-name-property': 'error',
      'vue/multi-word-component-names': 'off',
      'vue/attributes-order': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },

  {
    // 构建脚本需要输出日志
    files: ['scripts/**/*.mjs', 'internal/**/scripts/**/*.ts'],
    rules: {
      'no-console': 'off',
    },
  },

  {
    // TS / Vue 文件交给编译器做未定义检查，no-undef 会误伤 Nuxt 自动导入与类型导入
    files: ['**/*.ts', '**/*.vue'],
    rules: {
      'no-undef': 'off',
    },
  },

  {
    // 测试文件里常有多个内联辅助组件，组件命名与单文件单组件规则不适用
    files: ['**/__tests__/**/*.{ts,vue}'],
    rules: {
      'vue/one-component-per-file': 'off',
      'vue/require-name-property': 'off',
    },
  },

  prettier,
)
