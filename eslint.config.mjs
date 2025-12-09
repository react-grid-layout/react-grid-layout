import js from "@eslint/js";
import globals from "globals";
import babelParser from "@babel/eslint-parser";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import unicornPlugin from "eslint-plugin-unicorn";
import tseslint from "typescript-eslint";

export default [
  // Global ignores (replaces .eslintignore)
  {
    ignores: [
      "node_modules/**/*",
      "build/**/*",
      "dist/**/*",
      "coverage/**/*",
      "examples/*.js" // built files
    ]
  },

  // Base recommended config
  js.configs.recommended,

  // Unicorn recommended (flat config)
  unicornPlugin.configs["flat/recommended"],

  // Main config for all JS/JSX files
  {
    files: ["**/*.js", "**/*.jsx"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      parser: babelParser,
      parserOptions: {
        requireConfigFile: false,
        babelOptions: {
          presets: ["@babel/preset-react"]
        }
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021
      }
    },
    plugins: {
      react: reactPlugin,
      "react-hooks": reactHooksPlugin
    },
    settings: {
      react: {
        version: "detect"
      }
    },
    rules: {
      // ESLint core rules
      "no-console": "off",
      "no-use-before-define": ["error", "nofunc"],
      "no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^(e|_.*)$",
          vars: "local",
          varsIgnorePattern: "(debug|^_)"
        }
      ],
      "prefer-const": "error",

      // React rules
      ...reactPlugin.configs.recommended.rules,
      "react/jsx-boolean-value": ["error", "always"],
      "react/no-unknown-property": ["error", { ignore: ["unselectable"] }],

      // Unicorn rule overrides (on top of recommended)
      "unicorn/better-regex": "warn",
      "unicorn/expiring-todo-comments": "error",
      "unicorn/no-abusive-eslint-disable": "error",
      // Turn off overly strict unicorn rules
      "unicorn/filename-case": "off",
      "unicorn/prevent-abbreviations": "off",
      "unicorn/no-null": "off",
      "unicorn/no-array-for-each": "off",
      "unicorn/prefer-module": "off",
      "unicorn/prefer-top-level-await": "off",
      "unicorn/no-array-callback-reference": "off",
      "unicorn/consistent-function-scoping": "off",
      "unicorn/prefer-global-this": "off", // Don't enforce globalThis over window/global
      "unicorn/no-nested-ternary": "off",
      "unicorn/prefer-ternary": "off",
      "unicorn/no-new-array": "off",
      "unicorn/new-for-builtins": "off",
      "unicorn/prefer-spread": "off",
      "unicorn/no-array-reduce": "off",
      "unicorn/prefer-includes": "off",
      "unicorn/prefer-math-min-max": "off",
      "unicorn/catch-error-name": "off",
      "unicorn/prefer-optional-catch-binding": "off",
      "unicorn/no-negated-condition": "off",
      "unicorn/no-array-reverse": "off",
      "unicorn/no-array-sort": "off",
      "unicorn/no-for-loop": "off",
      "unicorn/prefer-type-error": "off",
      "unicorn/no-typeof-undefined": "off",
      "unicorn/prefer-structured-clone": "off",
      "unicorn/prefer-node-protocol": "off",
      "unicorn/no-anonymous-default-export": "off",
      "unicorn/prefer-query-selector": "off",
      "unicorn/no-object-as-default-parameter": "off",
      "unicorn/prefer-at": "off",
      "unicorn/no-useless-spread": "off"
    }
  },

  // Test files config (add jest globals)
  {
    files: ["test/**/*.js", "test/**/*.jsx"],
    languageOptions: {
      globals: {
        ...globals.jest
      }
    },
    rules: {
      "react/prop-types": "off"
    }
  },

  // TypeScript files configuration
  ...tseslint.configs.recommended.map(config => ({
    ...config,
    files: ["**/*.ts", "**/*.tsx"]
  })),

  // TypeScript-specific settings and rule overrides
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021
      }
    },
    plugins: {
      react: reactPlugin,
      "react-hooks": reactHooksPlugin
    },
    settings: {
      react: {
        version: "detect"
      }
    },
    rules: {
      // React rules for TSX
      ...reactPlugin.configs.recommended.rules,
      "react/jsx-boolean-value": ["error", "always"],
      "react/no-unknown-property": ["error", { ignore: ["unselectable"] }],
      "react/prop-types": "off", // TypeScript handles prop validation

      // React hooks rules
      ...reactHooksPlugin.configs.recommended.rules,
      // Disable React Compiler rules (not using React Compiler yet)
      "react-hooks/refs": "off",
      "react-hooks/preserve-manual-memoization": "off",
      "react-hooks/set-state-in-effect": "off",

      // TypeScript-specific overrides
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^(e|_.*)$",
          varsIgnorePattern: "(debug|^_)"
        }
      ],
      "@typescript-eslint/no-explicit-any": "off", // Allow any for now
      "@typescript-eslint/ban-ts-comment": "off", // Allow @ts-ignore when needed
      "@typescript-eslint/no-empty-object-type": "off", // Allow empty interfaces

      // Unicorn rule overrides (same as JS)
      "unicorn/filename-case": "off",
      "unicorn/prevent-abbreviations": "off",
      "unicorn/no-null": "off",
      "unicorn/no-array-for-each": "off",
      "unicorn/prefer-module": "off",
      "unicorn/prefer-top-level-await": "off",
      "unicorn/no-array-callback-reference": "off",
      "unicorn/consistent-function-scoping": "off",
      "unicorn/prefer-global-this": "off",
      "unicorn/no-nested-ternary": "off",
      "unicorn/prefer-ternary": "off",
      "unicorn/no-new-array": "off",
      "unicorn/new-for-builtins": "off",
      "unicorn/prefer-spread": "off",
      "unicorn/no-array-reduce": "off",
      "unicorn/prefer-includes": "off",
      "unicorn/prefer-math-min-max": "off",
      "unicorn/catch-error-name": "off",
      "unicorn/prefer-optional-catch-binding": "off",
      "unicorn/no-negated-condition": "off",
      "unicorn/no-array-reverse": "off",
      "unicorn/no-array-sort": "off",
      "unicorn/no-for-loop": "off",
      "unicorn/prefer-type-error": "off",
      "unicorn/no-typeof-undefined": "off",
      "unicorn/prefer-structured-clone": "off",
      "unicorn/prefer-node-protocol": "off",
      "unicorn/no-anonymous-default-export": "off",
      "unicorn/prefer-query-selector": "off",
      "unicorn/no-object-as-default-parameter": "off",
      "unicorn/prefer-at": "off",
      "unicorn/no-useless-spread": "off"
    }
  },

  // TypeScript test files config
  {
    files: ["test/**/*.ts", "test/**/*.tsx"],
    languageOptions: {
      globals: {
        ...globals.jest
      }
    },
    rules: {
      "react/prop-types": "off"
    }
  }
];
