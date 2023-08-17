/** @type {import("eslint").Linter.Config} */
const config = {
  root: true,
  plugins: ['simple-import-sort', '@typescript-eslint'],
  extends: [
    'next/core-web-vitals',
    'plugin:@typescript-eslint/strict',
    'plugin:@typescript-eslint/stylistic',
    'plugin:tailwindcss/recommended',
  ],
  rules: {
    'import/newline-after-import': 'error',
    'simple-import-sort/imports': 'error',
    'simple-import-sort/exports': 'error',
  },
};

module.exports = config;
