module.exports = {
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        tsconfigRootDir: __dirname,
    },
    plugins: ['@typescript-eslint'],
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
    ],
    rules: {
        '@typescript-eslint/no-explicit-any': 'warn',
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
    env: {
        node: true,
        es2022: true,
        jest: true,
    },
    ignorePatterns: ['dist', 'node_modules', '*.config.js', '.eslintrc.js'],
    overrides: [
        {
            files: ["tests/**/*.ts"],
            parserOptions: {
                project: ['./tsconfig.test.json'],
            },
            env: {
                jest: true,
            },
        }
    ],
};