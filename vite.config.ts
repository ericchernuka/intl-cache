import { defineConfig } from "vite-plus";

export default defineConfig({
  fmt: {},
  lint: {
    categories: {
      correctness: "error",
      pedantic: "error",
      perf: "error",
      restriction: "error",
      style: "error",
      suspicious: "error",
    },
    env: {
      browser: true,
      node: true,
    },
    ignorePatterns: ["dist", "coverage"],
    jsPlugins: [
      {
        name: "vite-plus",
        specifier: "vite-plus/oxlint-plugin",
      },
    ],
    options: {
      typeAware: true,
      typeCheck: true,
    },
    overrides: [
      {
        files: ["**/*.test.ts"],
        rules: {
          // Test fixtures intentionally use unordered keys, magic numbers, and long describe blocks
          "max-lines-per-function": "off",
          "max-statements": "off",
          "no-magic-numbers": "off",
          "sort-keys": "off",
        },
      },
    ],
    plugins: ["typescript", "unicorn", "oxc"],
    rules: {
      // Function declarations are this library's idiom
      "func-style": "off",
      // The public API is built on optional parameters whose absent value is undefined
      "no-undefined": "off",
      // Separate const declarations read better than combined ones
      "one-var": "off",
      // Declaration order is free; member lists stay sorted
      "sort-imports": ["error", { ignoreDeclarationSort: true }],
      // ReadonlyDeep-style wrappers would diverge from Intl's own signatures
      "typescript/prefer-readonly-parameter-types": "off",
      "vite-plus/prefer-vite-plus-imports": "error",
    },
  },
  pack: {
    dts: true,
    entry: ["src/index.ts"],
    format: ["esm"],
  },
  test: {
    coverage: {
      exclude: ["src/**/*.test.ts"],
      include: ["src/**/*.ts"],
      provider: "v8",
      reporter: ["text", "html"],
      thresholds: {
        branches: 100,
        functions: 100,
        lines: 100,
        statements: 100,
      },
    },
  },
});
