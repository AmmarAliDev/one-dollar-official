/** @type {import("prettier").Config} */
const prettierConfig = {
  printWidth: 100,
  semi: true,
  singleQuote: false,
  trailingComma: "all",
  plugins: ["prettier-plugin-tailwindcss"],
};

export default prettierConfig;
