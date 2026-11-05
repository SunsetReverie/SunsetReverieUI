export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [
      2,
      'always',
      [
        // 组件
        'button',
        'icon',
        'row',
        'col',
        'input',
        'modal',
        'toast',
        'table',
        'form',
        'select',
        'tooltip',
        'tabs',
        'transition',
        'config-provider',
        // 包与领域
        'ui',
        'nuxt',
        'resolver',
        'icons',
        'theme',
        'token',
        'style',
        'build',
        'docs',
        'playground',
        'ci',
        'release',
        'deps',
      ],
    ],
    'subject-max-length': [2, 'always', 50],
    // 中文 subject 不做大小写与句号校验
    'subject-case': [0],
    'subject-full-stop': [0],
  },
}
