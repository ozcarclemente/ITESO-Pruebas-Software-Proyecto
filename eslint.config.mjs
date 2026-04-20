import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";

export default defineConfig([
    {
        ignores: ["**/coverage/**", "**/dist/**", "**/node_modules/**"],
    },
    js.configs.recommended,
    {
        files: ["frontend/**/*.{js,jsx}"],
        languageOptions: {
            globals: globals.browser,
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
            },
            sourceType: "module",
        },
    },
    {
        files: ["backend/**/*.{js,cjs}"],
        languageOptions: {
            globals: globals.node,
            sourceType: "commonjs",
        },
        rules: {
            "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
        },
    },
    {
        files: ["backend/migrations/**/*.js", "backend/seeders/**/*.js"],
        rules: {
            "no-unused-vars": ["error", { argsIgnorePattern: "^Sequelize$" }],
        },
    },
    {
        files: ["**/*.{test,spec}.{js,jsx}"],
        languageOptions: {
            globals: globals.jest,
        },
    },
    {
        files: ["frontend/vite.config.js"],
        languageOptions: {
            globals: globals.node,
        },
    },
    {
        files: ["eslint.config.mjs"],
        languageOptions: {
            globals: globals.node,
        },
    },
]);
