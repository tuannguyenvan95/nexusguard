import { describe, it, expect } from 'vitest';
import {
  readSql,
  createColumns,
  alterPatches,
  policyNames,
} from './sql-drift-helpers';

/**
 * Guards against schema/code drift on the `nexus_jobs` table.
 *
 * The table was originally created by hand in the Supabase dashboard, so
 * columns added later (`deadline`, `milestones`) were missing from the live
 * database and broke job creation at runtime. This test keeps the migration,
 * the standalone setup script, and the app's expectations in sync: if any of
 * them drifts, CI fails here instead of at runtime.
 */
const MIGRATION_PATH = 'supabase/migrations/003_nexus_jobs.sql';
const SCRIPT_PATH = 'supabase/nexus_jobs_schema.sql';

/**
 * Every column the app reads or writes on `nexus_jobs`. Keep in sync with:
 * - the create form  (src/app/dashboard/jobs/create/page.tsx)
 * - the job detail   (src/app/dashboard/jobs/[id]/page.tsx)
 * - the jobs API     (src/app/api/jobs/[id]/route.ts)
 */
const APP_COLUMNS = [
  'id',
  'title',
  'amount',
  'status',
  'provider',
  'date',
  'deadline',
  'agent',
  'description',
  'requirements',
  'payouttype',
  'maxwinners',
  'milestones',
  'applicant',
  'deliverables',
  'payout_txs',
  'ai_reports',
  'created_at',
];

/** Columns added after the table was hand-created — the migration must patch
 * them onto existing tables with `ALTER ... ADD COLUMN IF NOT EXISTS`. */
const LATER_COLUMNS = ['deadline', 'milestones'];

const migrationSql = readSql(MIGRATION_PATH);
const scriptSql = readSql(SCRIPT_PATH);

describe('nexus_jobs schema drift guard', () => {
  it('migration 003 exists', () => {
    expect(migrationSql.length).toBeGreaterThan(0);
  });

  it('declares every column the app reads or writes', () => {
    const start = migrationSql.indexOf('CREATE TABLE IF NOT EXISTS nexus_jobs');
    const end = migrationSql.indexOf(');', start);
    expect(start).toBeGreaterThanOrEqual(0);
    const createBlock = migrationSql.slice(start, end);

    for (const column of APP_COLUMNS) {
      expect(createBlock, `missing '${column}' in CREATE TABLE nexus_jobs`).toContain(
        `\n  ${column} `
      );
    }
  });

  it('patches later-added columns onto hand-created tables', () => {
    for (const column of LATER_COLUMNS) {
      expect(
        migrationSql,
        `missing ALTER ... ADD COLUMN IF NOT EXISTS ${column} (needed to repair hand-created tables)`
      ).toContain(`ADD COLUMN IF NOT EXISTS ${column} `);
    }
  });

  it('reloads the PostgREST schema cache after patching', () => {
    expect(migrationSql).toContain(`NOTIFY pgrst, 'reload schema'`);
  });
});

describe('standalone script stays in sync with migration 003', () => {
  it('standalone script exists', () => {
    expect(scriptSql.length).toBeGreaterThan(0);
  });

  it('declares the same nexus_jobs columns as the migration', () => {
    expect(createColumns(scriptSql, 'nexus_jobs')).toEqual(
      createColumns(migrationSql, 'nexus_jobs')
    );
  });

  it('includes the same ALTER patch statements as the migration', () => {
    expect(alterPatches(scriptSql)).toEqual(alterPatches(migrationSql));
  });

  it('defines the same RLS policies as the migration', () => {
    expect(policyNames(scriptSql)).toEqual(policyNames(migrationSql));
  });

  it('reloads the PostgREST schema cache', () => {
    expect(scriptSql).toContain(`NOTIFY pgrst, 'reload schema'`);
  });
});
