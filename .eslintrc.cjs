/** @type {import("eslint").Linter.Config} */
const config = {
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: true,
  },
  plugins: ["@typescript-eslint"],
  extends: [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended-type-checked",
    "plugin:@typescript-eslint/stylistic-type-checked",
  ],
  rules: {
    // Relaxed or disabled rules
    "@typescript-eslint/array-type": "off",
    "@typescript-eslint/consistent-type-definitions": "off",
    "@typescript-eslint/consistent-type-imports": "off",
    "@typescript-eslint/no-unused-vars": [
      "warn",
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
      },
    ],
    "@typescript-eslint/require-await": "off",
    "@typescript-eslint/no-misused-promises": "off",

    // Disable potential problematic rules
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/ban-types": "off",
    "@typescript-eslint/strict-boolean-expressions": "off",

    // Relax stylistic rules
    "@typescript-eslint/member-delimiter-style": "off",
    "@typescript-eslint/naming-convention": "off",
    "@typescript-eslint/no-inferrable-types": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
  },
};

module.exports = config;
