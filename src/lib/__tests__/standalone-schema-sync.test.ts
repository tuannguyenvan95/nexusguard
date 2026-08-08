import { describe, it, expect } from 'vitest';
import {
  readSql,
  createColumns,
  policyNames,
  policyTables,
  indexStatements,
} from './sql-drift-helpers';

/**
 * Keeps the standalone setup scripts (supabase/*_schema.sql) in sync with the
 * canonical migrations (001_initial_schema.sql + 002_treasury_insert_policy.sql).
 *
 * Each script must reproduce the exact tables, policies, and indexes of the
 * migrations it covers — no more, no less — so anyone who pastes a script
 * into a fresh Supabase project gets the same schema as `supabase db push`.
 */
const MIGRATION_001 = readSql('supabase/migrations/001_initial_schema.sql');
const MIGRATION_002 = readSql('supabase/migrations/002_treasury_insert_policy.sql');
const MIGRATIONS = `${MIGRATION_001}\n${MIGRATION_002}`;

/** Script file -> the tables it must reproduce (from the migrations). */
const SCRIPTS: Record<string, string[]> = {
  'supabase/teams_schema.sql': ['teams', 'team_members'],
  'supabase/jobs_schema.sql': ['teams', 'jobs'],
  'supabase/treasury_transactions_schema.sql': [
    'teams',
    'team_members',
    'treasury_transactions',
  ],
  'supabase/agent_actions_schema.sql': ['teams', 'jobs', 'agents', 'agent_actions'],
};

describe('standalone schema scripts stay in sync with migrations', () => {
  const migrationPolicyTables = policyTables(MIGRATIONS);

  for (const [file, coveredTables] of Object.entries(SCRIPTS)) {
    describe(file, () => {
      const script = readSql(file);

      it('exists', () => {
        expect(script.length).toBeGreaterThan(0);
      });

      it('reproduces every covered table with identical columns', () => {
        for (const table of coveredTables) {
          expect(createColumns(script, table), `'${table}' columns differ from migration 001`).toEqual(
            createColumns(MIGRATION_001, table)
          );
        }
      });

      it('does not define tables outside its coverage', () => {
        const defined = [...script.matchAll(/CREATE TABLE IF NOT EXISTS (\w+)/g)].map(
          (m) => m[1]
        );
        for (const table of defined) {
          expect(coveredTables, `script defines unexpected table '${table}'`).toContain(table);
        }
      });

      it('reproduces the migration RLS policies for covered tables', () => {
        const scriptPolicies = policyNames(script);

        for (const policy of scriptPolicies) {
          expect(
            Object.keys(migrationPolicyTables),
            `policy '${policy}' is not defined in the migrations`
          ).toContain(policy);
        }

        for (const table of coveredTables) {
          for (const [policy, policyTable] of Object.entries(migrationPolicyTables)) {
            if (policyTable !== table) continue;
            expect(scriptPolicies, `missing migration policy '${policy}' for '${table}'`).toContain(
              policy
            );
          }
        }
      });

      it('reproduces the migration indexes for covered tables', () => {
        for (const table of coveredTables) {
          for (const statement of indexStatements(MIGRATION_001, table)) {
            expect(script, `missing index statement '${statement}' (on '${table}')`).toContain(
              statement
            );
          }
        }
      });

      it('reloads the PostgREST schema cache', () => {
        expect(script).toContain(`NOTIFY pgrst, 'reload schema'`);
      });
    });
  }

  it('treasury_transactions script includes the migration-002 insert policy', () => {
    const script = readSql('supabase/treasury_transactions_schema.sql');
    expect(MIGRATION_002).toContain('Members can insert treasury transactions');
    expect(script).toContain('Members can insert treasury transactions');
  });

  it('agent_actions script includes the default agents seed', () => {
    const script = readSql('supabase/agent_actions_schema.sql');
    expect(MIGRATION_001).toContain(`ON CONFLICT (agent_type) DO NOTHING`);
    expect(script).toContain(`ON CONFLICT (agent_type) DO NOTHING`);
  });
});
