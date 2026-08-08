import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Shared helpers for the schema drift guard tests. Keep the canonical
 * migrations (supabase/migrations/*.sql) and the standalone setup scripts
 * (supabase/*_schema.sql) in sync — the tests fail if either side drifts.
 */

/** Read a file relative to the repo root (vitest runs from the project root). */
export function readSql(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), 'utf8');
}

/** Column names declared in a `CREATE TABLE IF NOT EXISTS <table>` block. */
export function createColumns(sql: string, table: string): string[] {
  const start = sql.indexOf(`CREATE TABLE IF NOT EXISTS ${table}`);
  if (start < 0) return [];
  const end = sql.indexOf(');', start);
  return sql
    .slice(start, end)
    .split('\n')
    .filter((line) => /^\s{2}[a-z_]+\s/.test(line))
    .map((line) => line.trim().split(/\s+/)[0]);
}

/** Normalized `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` statements. */
export function alterPatches(sql: string): string[] {
  return sql
    .split('\n')
    .filter(
      (line) =>
        line.trim().startsWith('ALTER TABLE') &&
        line.includes('ADD COLUMN IF NOT EXISTS')
    )
    .map((line) => line.trim());
}

/** Policy names defined in the file, sorted for comparison. */
export function policyNames(sql: string): string[] {
  return [...sql.matchAll(/CREATE POLICY "([^"]+)"/g)]
    .map((match) => match[1])
    .sort();
}

/** Map of policy name -> table it is defined ON. */
export function policyTables(sql: string): Record<string, string> {
  return Object.fromEntries(
    [...sql.matchAll(/CREATE POLICY "([^"]+)"\s+ON\s+(\w+)/g)].map(
      (match) => [match[1], match[2]]
    )
  );
}

/** Full `CREATE INDEX IF NOT EXISTS ... ON <table>` statements for a table. */
export function indexStatements(sql: string, table: string): string[] {
  return [...sql.matchAll(/CREATE INDEX IF NOT EXISTS (\w+) ON (\w+)/g)]
    .filter((match) => match[2] === table)
    .map((match) => match[0]);
}
