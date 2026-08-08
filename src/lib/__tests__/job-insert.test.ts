import { describe, it, expect, vi } from 'vitest';
import {
  insertNexusJob,
  isMissingColumnError,
  extractMissingColumn,
  type JobInsertClient,
  type DbErrorLike,
} from '@/lib/jobs';

const FULL_JOB: Record<string, unknown> = {
  id: 'job_1',
  title: 'Frontend Dashboard Upgrade',
  amount: '2500 USDC',
  status: 'Funded',
  provider: '{"address":"0x12...34"}',
  date: '2026-10-24',
  deadline: '2026-10-24',
  agent: 'Swarm: Escrow, Validator',
  description: 'Some task',
  requirements: ['Proof of Work'],
  payouttype: 'winner_takes_all',
  maxwinners: '1',
  milestones: '[]',
};

/** Build a fake supabase client whose insert resolves each queued result in order. */
function mockSupabase(results: Array<{ error: DbErrorLike | null }>) {
  const insert = vi.fn();
  let call = 0;
  insert.mockImplementation(async () => {
    const result = results[Math.min(call, results.length - 1)];
    call += 1;
    return result;
  });
  const from = vi.fn(() => ({ insert }));
  const supabase: JobInsertClient = { from };
  return { supabase, insert, from };
}

/** Return the payload of the nth insert call. */
function payloadOf(insert: ReturnType<typeof vi.fn>, call: number): Record<string, unknown> {
  return insert.mock.calls[call][0][0] as Record<string, unknown>;
}

describe('insertNexusJob', () => {
  it('inserts the full payload and returns success on the first attempt', async () => {
    const { supabase, insert } = mockSupabase([{ error: null }]);

    const result = await insertNexusJob(supabase, FULL_JOB);

    expect(result.error).toBeNull();
    expect(result.fallbackUsed).toBe(false);
    expect(insert).toHaveBeenCalledTimes(1);
    expect(insert).toHaveBeenCalledWith([FULL_JOB]);
    expect(supabase.from).toHaveBeenCalledWith('nexus_jobs');
  });

  it('retries without the deadline column when the schema is missing it', async () => {
    const missingColumnError = { error: { message: 'column nexus_jobs.deadline does not exist' } };
    const { supabase, insert } = mockSupabase([missingColumnError, { error: null }]);

    const result = await insertNexusJob(supabase, FULL_JOB);

    expect(result.error).toBeNull();
    expect(result.fallbackUsed).toBe(true);
    expect(insert).toHaveBeenCalledTimes(2);
    expect(payloadOf(insert, 1)).not.toHaveProperty('deadline');
    expect(payloadOf(insert, 1)).toHaveProperty('title');
  });

  it('recognizes the PostgREST schema-cache wording too', async () => {
    const cacheError = {
      error: { message: "Could not find the 'deadline' column of 'nexus_jobs' in the schema cache" },
    };
    const { supabase, insert } = mockSupabase([cacheError, { error: null }]);

    const result = await insertNexusJob(supabase, FULL_JOB);

    expect(result.error).toBeNull();
    expect(result.fallbackUsed).toBe(true);
    expect(insert).toHaveBeenCalledTimes(2);
    expect(payloadOf(insert, 1)).not.toHaveProperty('deadline');
  });

  it('keeps retrying when multiple columns are missing, stripping one per attempt', async () => {
    const { supabase, insert } = mockSupabase([
      { error: { message: 'column nexus_jobs.deadline does not exist' } },
      { error: { message: 'column nexus_jobs.maxwinners does not exist' } },
      { error: null },
    ]);

    const result = await insertNexusJob(supabase, FULL_JOB);

    expect(result.error).toBeNull();
    expect(result.fallbackUsed).toBe(true);
    expect(insert).toHaveBeenCalledTimes(3);
    expect(payloadOf(insert, 1)).not.toHaveProperty('deadline');
    expect(payloadOf(insert, 2)).not.toHaveProperty('deadline');
    expect(payloadOf(insert, 2)).not.toHaveProperty('maxwinners');
  });

  it('does not retry on non-schema errors (e.g. constraint violation)', async () => {
    const realError = { error: { message: 'duplicate key value violates unique constraint' } };
    const { supabase, insert } = mockSupabase([realError]);

    const result = await insertNexusJob(supabase, FULL_JOB);

    expect(result.error?.message).toContain('duplicate key');
    expect(result.fallbackUsed).toBe(false);
    expect(insert).toHaveBeenCalledTimes(1);
  });

  it('surfaces the error when the retry also fails', async () => {
    const missingColumnError = { error: { message: 'column nexus_jobs.deadline does not exist' } };
    const { supabase, insert } = mockSupabase([missingColumnError, missingColumnError]);

    const result = await insertNexusJob(supabase, FULL_JOB);

    expect(result.error?.message).toContain('deadline');
    expect(result.fallbackUsed).toBe(true);
    expect(insert).toHaveBeenCalledTimes(2);
  });

  it('does not retry when the offending column was never sent', async () => {
    const missingColumnError = { error: { message: 'column nexus_jobs.deadline does not exist' } };
    const jobWithoutDeadline = { ...FULL_JOB };
    delete (jobWithoutDeadline as { deadline?: string }).deadline;
    const { supabase, insert } = mockSupabase([missingColumnError]);

    const result = await insertNexusJob(supabase, jobWithoutDeadline);

    expect(result.error?.message).toContain('deadline');
    expect(result.fallbackUsed).toBe(false);
    expect(insert).toHaveBeenCalledTimes(1);
  });

  it('gives up on table-level errors without stripping', async () => {
    const tableError = { error: { message: 'relation nexus_jobs does not exist' } };
    const { supabase, insert } = mockSupabase([tableError]);

    const result = await insertNexusJob(supabase, FULL_JOB);

    expect(result.error?.message).toContain('does not exist');
    expect(insert).toHaveBeenCalledTimes(1);
  });
});

describe('isMissingColumnError', () => {
  it('matches Postgres 42703 wording', () => {
    expect(isMissingColumnError({ message: 'column nexus_jobs.deadline does not exist' })).toBe(true);
  });

  it('matches PostgREST schema-cache wording', () => {
    expect(
      isMissingColumnError({
        message: "Could not find the 'deadline' column of 'nexus_jobs' in the schema cache",
      })
    ).toBe(true);
  });

  it('matches the raw error code 42703', () => {
    expect(isMissingColumnError({ code: '42703', message: 'undefined_column' })).toBe(true);
  });

  it('rejects table-level and non-schema errors', () => {
    expect(isMissingColumnError({ message: 'relation nexus_jobs does not exist' })).toBe(false);
    expect(isMissingColumnError({ message: "Could not find the table 'foo' in the schema cache" })).toBe(false);
    expect(isMissingColumnError({ message: 'duplicate key value violates unique constraint' })).toBe(false);
    expect(isMissingColumnError({ message: 'permission denied for table nexus_jobs' })).toBe(false);
  });

  it('handles null / undefined / empty messages', () => {
    expect(isMissingColumnError(null)).toBe(false);
    expect(isMissingColumnError(undefined)).toBe(false);
    expect(isMissingColumnError({ message: '' })).toBe(false);
    expect(isMissingColumnError({})).toBe(false);
  });
});

describe('extractMissingColumn', () => {
  it('parses the raw Postgres wording', () => {
    expect(extractMissingColumn({ message: 'column nexus_jobs.deadline does not exist' })).toBe('deadline');
    expect(extractMissingColumn({ message: 'column "nexus_jobs"."deadline" does not exist' })).toBe('deadline');
  });

  it('parses the PostgREST schema-cache wording', () => {
    expect(
      extractMissingColumn({
        message: "Could not find the 'deadline' column of 'nexus_jobs' in the schema cache",
      })
    ).toBe('deadline');
  });

  it('returns null when no column is named', () => {
    expect(extractMissingColumn({ message: 'duplicate key value violates unique constraint' })).toBeNull();
    expect(extractMissingColumn(null)).toBeNull();
    expect(extractMissingColumn(undefined)).toBeNull();
  });
});
