import { defineConfig } from "eslint/config";
import prettier from "eslint-config-prettier/flat";
import { createTypeScriptImportResolver } from "eslint-import-resolver-typescript";
import { importX } from "eslint-plugin-import-x";
import { configs as tseslint } from "typescript-eslint";

export default defineConfig(
  { ignores: ["dist/", "coverage/"] },

  tseslint.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        // Uses the nearest tsconfig.json for each file, so type-aware rules see the same types as tsc.
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  importX.flatConfigs.recommended,
  importX.flatConfigs.typescript,
  {
    settings: {
      // Resolves `#/*` and `.js` -> `.ts` imports the same way TypeScript does.
      "import-x/resolver-next": [
        createTypeScriptImportResolver({
          conditionNames: ["template-source", "types", "import", "node"],
        }),
      ],
    },
    rules: {
      // Import from src/ through the `#/` alias only, so imports read the same from any file
      // and don't break when files move.
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              regex: "^\\.{1,2}(/|$)",
              message: "Use the `#/` alias instead of a relative path (e.g. `#/config.js`).",
            },
          ],
        },
      ],
      "import-x/order": [
        "error",
        {
          groups: ["builtin", "external", "internal", "type"],
          pathGroups: [{ pattern: "#/**", group: "internal" }],
          "newlines-between": "always",
          alphabetize: { order: "asc", caseInsensitive: true },
        },
      ],
    },
  },

  // Must stay last: turns off rules that conflict with Prettier's formatting.
  prettier,
);
