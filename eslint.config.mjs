import { defineConfig, globalIgnores } from "eslint/config";
import nx from "@nx/eslint-plugin";
import { fixupConfigRules } from "@eslint/compat";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default defineConfig([globalIgnores(["**/*", "**/node_modules", "**/_generated"]), {
    plugins: {
        "@nx": nx,
    },
}, {
    files: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"],

    rules: {
        "@nx/enforce-module-boundaries": ["error", {
            enforceBuildableLibDependency: true,
            allow: [],

            depConstraints: [{
                sourceTag: "*",
                onlyDependOnLibsWithTags: ["*"],
            }],
        }],
    },
}, {
    files: ["**/*.ts", "**/*.tsx"],
    extends: compat.extends("plugin:@nx/typescript"),

    rules: {
        "@typescript-eslint/no-extra-semi": "error",
        "no-extra-semi": "off",
    },
}, {
    files: ["**/*.js", "**/*.jsx"],
    extends: compat.extends("plugin:@nx/javascript"),

    rules: {
        "@typescript-eslint/no-extra-semi": "error",
        "no-extra-semi": "off",
    },
}, {
    files: ["**/*.jsx", "**/*.tsx"],

    extends: fixupConfigRules(
        compat.extends("plugin:react/recommended", "plugin:react-hooks/recommended"),
    ),

    rules: {
        "react-hooks/rules-of-hooks": "error",
        "react-hooks/exhaustive-deps": "warn",
    },
}, {
    files: ["**/*.ts", "**/*.tsx"],

    rules: {
        "@typescript-eslint/no-unused-vars": "warn",
    },
}]);