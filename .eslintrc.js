module.exports = {
  env: {
    es2021: true,
    node: true
  },
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: 'standard-with-typescript',
  overrides: [
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname
  },
  ignorePatterns: ['.eslintrc.js'],
  rules: {
    "@typescript-eslint/no-misused-promises": "off",
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/strict-boolean-expressions': 'off'
  }
}
