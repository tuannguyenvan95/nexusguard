import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Hardhat config, deployment scripts and contract tests are CommonJS
    // tooling outside the Next.js app — the TS rules (e.g. no-require-imports)
    // don't apply to them.
    "hardhat.config.js",
    "scripts/**",
    "test/**",
    "test-tx.js",
    // One-off root-level debug scripts (DB checks, API fetches) — CommonJS
    // scratch tooling, not part of the Next.js app. Enumerated explicitly so
    // linting stays precise (no broad *.js ignore that would also cover any
    // future .js files under src/).
    "fetch.js",
    "fetch2.js",
    "fetch3.js",
    "fetch_js.js",
    "check_db.js",
    "check_db_undef.js",
    "check_schema.js",
    "check_supabase.js",
  ]),
]);

export default eslintConfig;
