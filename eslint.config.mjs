import next from "eslint-config-next";

/**
 * Flat ESLint configuration.
 *
 * `eslint-config-next` ships flat-config presets (Next, React, hooks, a11y and
 * TypeScript). The rules below keep the codebase honest without fighting the
 * framework.
 */
const config = [
  ...next,
  {
    rules: {
      "@next/next/no-html-link-for-pages": "error",
      "@next/next/no-img-element": "warn",
      "no-console": ["warn", { allow: ["warn", "error"] }],
      eqeqeq: ["error", "always", { null: "ignore" }],
      "prefer-const": "error",
    },
  },
  {
    // Build scripts are command-line tools: they are expected to report progress.
    files: ["scripts/**/*.{mjs,mts}"],
    rules: { "no-console": "off" },
  },
  {
    ignores: [".next/**", "node_modules/**", "coverage/**", "public/**", "scripts/_notes/**"],
  },
];

export default config;
