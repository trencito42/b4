import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "**/dist/**",
      "**/storybook-static/**",
      "**/node_modules/**",
      // A stray nested clone of this repository sits at ./b4/. It is
      // already git-ignored (.gitignore "/b4/"), but ESLint has its own
      // ignore list, so without this every finding in the real tree was
      // reported twice — once from here, once from the copy.
      "b4/**",
    ],
  },
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
);
