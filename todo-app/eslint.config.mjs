import globals from "globals";
import pluginJs from "@eslint/js";

export default [
  {
    files: ["**/*.js"],
    languageOptions: {
      sourceType: "commonjs",
      globals: {
        ...globals.browser, // Include browser globals
        ...globals.node,    // Include Node.js globals
      },
    },
    plugins: {
      // Add any additional plugins you are using
    },
    rules: {
      // Add any custom rules you want to enforce
    },
  },
  pluginJs.configs.recommended,
];
