const globals = require("globals");
const tsParser = require("@typescript-eslint/parser");
const typescriptEslint = require("@typescript-eslint/eslint-plugin");
const playwright = require("eslint-plugin-playwright");
const js = require("@eslint/js");
const eslintConfigPrettier = require("eslint-config-prettier");

module.exports = [
    // Global ignores
    {
        ignores: [
            "**/node_modules/",
            "**/dist/",
            "**/test-results/",
            "**/allure-results/",
            "**/allure-report/",
            "**/playwright-report/",
            "**/coverage/",
        ],
    },
    // Base ESLint recommended config
    js.configs.recommended,
    // Main configuration
    {
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
            },
            parser: tsParser,
            ecmaVersion: 2022,
            sourceType: "module",
            parserOptions: {},
        },
        plugins: {
            "@typescript-eslint": typescriptEslint,
            playwright,
        },
        rules: {
            ...typescriptEslint.configs.recommended.rules,
            ...playwright.configs.recommended.rules,
            "@typescript-eslint/no-unused-vars": ["warn", {
                "argsIgnorePattern": "^_",
            }],
            "@typescript-eslint/no-explicit-any": "warn",
            "@typescript-eslint/explicit-function-return-type": "off",
            "@typescript-eslint/no-non-null-assertion": "warn",
            "no-console": "warn",
            "no-debugger": "error",
            "no-case-declarations": "off",
            "prefer-const": "error",
            "no-var": "error",
            "object-shorthand": "error",
            "prefer-arrow-callback": "error",
            "prefer-template": "error",
            "template-curly-spacing": "error",
            "no-multiple-empty-lines": ["error", {
                max: 2,
                maxEOF: 1,
            }],
            "eol-last": ["error", "always"],
            "playwright/missing-playwright-await": "error",
            "playwright/no-conditional-in-test": "warn",
            "playwright/no-element-handle": "error",
            "playwright/no-eval": "error",
            "playwright/no-focused-test": "error",
            "playwright/no-force-option": "warn",
            "playwright/no-page-pause": "warn",
            "playwright/no-restricted-matchers": "off",
            "playwright/no-skipped-test": "warn",
            "playwright/no-useless-await": "error",
            "playwright/no-wait-for-timeout": "warn",
            "playwright/prefer-web-first-assertions": "error",
            "playwright/require-top-level-describe": "error",
            "playwright/valid-expect": "error",
        },
    },
    // Config and setup files overrides
    {
        files: ["**/*.config.js", "**/*.config.ts", "**/.eslintrc.js"],
        rules: {
            "@typescript-eslint/no-var-requires": "off",
            "no-console": "off",
        },
    },
    // Test files overrides
    {
        files: ["tests/**/*.ts", "**/*.spec.ts", "**/*.test.ts"],
        rules: {
            "@typescript-eslint/no-explicit-any": "off",
            "no-console": "off",
            "@typescript-eslint/no-non-null-assertion": "off",
        },
    },
    // Page object files overrides
    {
        files: ["src/pages/**/*.ts"],
        rules: {
            "no-console": "off",
            "@typescript-eslint/no-unused-vars": "off",
        },
    },
    // Prettier config (must be last)
    eslintConfigPrettier,
];
