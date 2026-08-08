import { formatAddress } from '@/lib/utils';
import { isValidWalletAddress } from '@/lib/ethereum';

/**
 * Shared job domain logic.
 *
 * These pure functions power the dashboard pages (create job, job detail,
 * profile) and are the real code under test by the Vitest suites.
 */

export interface Milestone {
  name: string;
  percent: number;
}

export interface MilestoneAmount {
  name: string;
  amount: string;
  percent: number;
}

/** Loose job shape coming from Supabase rows. */
export interface Job {
  id: string;
  title?: string;
  amount?: string;
  status?: string;
  applicant?: string | string[] | null;
  provider?: string | null;
  [key: string]: unknown;
}

export interface ApplicantUpdate {
  status: string;
  applicant: string;
}

/**
 * Validate that milestone percentages sum to 100%.
 * Uses a floating-point tolerance so splits like 33.33/33.33/33.34 pass.
 */
export function validateMilestones(
  milestones: Milestone[]
): { valid: boolean; error?: string } {
  if (milestones.length === 0) {
    return { valid: false, error: 'At least one milestone is required.' };
  }

  const totalPercent = milestones.reduce((sum, ms) => sum + ms.percent, 0);

  if (Math.abs(totalPercent - 100) > 0.001) {
    return {
      valid: false,
      error: `Milestone percentages must sum to 100%! (Current: ${totalPercent.toFixed(1)}%)`,
    };
  }

  return { valid: true };
}

/** Split a budget across milestones by percentage. */
export function calculateMilestoneAmounts(
  budget: number,
  milestones: Milestone[],
  currency: string
): MilestoneAmount[] {
  return milestones.map((ms) => ({
    name: ms.name,
    amount: `${((budget * ms.percent) / 100).toFixed(2)} ${currency}`,
    percent: ms.percent,
  }));
}

/** Maximum number of payment milestones allowed on a job. */
export const MAX_MILESTONES = 10;

/**
 * Add a milestone and redistribute percentages evenly across the new count.
 * The first `n` milestones share an even split; the last one absorbs the
 * rounding remainder so the total always sums to 100.
 * Names are regenerated as `Phase i` to match the create-job UX.
 */
export function addMilestone(milestones: Milestone[]): Milestone[] {
  if (milestones.length >= MAX_MILESTONES) return milestones;

  const evenPercent = Math.floor(100 / (milestones.length + 1));

  return Array.from({ length: milestones.length + 1 }, (_, i) => ({
    name: `Phase ${i + 1}`,
    percent:
      i < milestones.length
        ? evenPercent
        : 100 - evenPercent * milestones.length,
  }));
}

/**
 * Remove the milestone at `index` and redistribute percentages evenly
 * across the remaining ones. The last milestone absorbs the rounding
 * remainder so the total always sums to 100. Names are preserved.
 */
export function removeMilestone(
  milestones: Milestone[],
  index: number
): Milestone[] {
  if (milestones.length <= 1) return milestones;

  const updated = milestones.filter((_, i) => i !== index);
  const evenPercent = Math.floor(100 / updated.length);

  return updated.map((ms, i) => ({
    ...ms,
    percent:
      i < updated.length - 1
        ? evenPercent
        : 100 - evenPercent * (updated.length - 1),
  }));
}

/** Shorten a wallet address to 0x1234...5678 form (reuses utils.formatAddress). */
export const shortAddress = formatAddress;

/**
 * Normalize an `applicant` field (array, JSON string, or plain string)
 * into a string array.
 */
export function parseApplicants(
  applicant: string | string[] | null | undefined
): string[] {
  if (applicant == null) return [];

  if (Array.isArray(applicant)) {
    return applicant.filter((a): a is string => typeof a === 'string');
  }

  if (typeof applicant === 'string' && applicant) {
    try {
      const parsed = JSON.parse(applicant);
      if (Array.isArray(parsed)) {
        return parsed.filter((a): a is string => typeof a === 'string');
      }
      if (typeof parsed === 'string') return [parsed];
      return [applicant];
    } catch {
      return [applicant];
    }
  }

  return [];
}

/** Append an applicant address unless it is already present. */
export function addApplicant(
  applicants: string[],
  applicantAddress: string
): string[] {
  if (applicants.includes(applicantAddress)) return applicants;
  return [...applicants, applicantAddress];
}

/**
 * Apply to a job: merge the applicant and persist via `updateJob`.
 * Never throws — errors are returned in the result object.
 */
export async function applyToJob(
  applicantField: string | string[] | null | undefined,
  applicantAddress: string,
  updateJob: (
    updates: ApplicantUpdate
  ) => PromiseLike<{ error?: { message?: string } | null }>
): Promise<{ success: boolean; error?: string }> {
  try {
    // Never persist a fake or malformed applicant address — short demo
    // aliases like '0x123...abc (Simulated)' are rejected here so no caller
    // can accidentally (or intentionally) write junk into the applicant list.
    if (!isValidWalletAddress(applicantAddress)) {
      return {
        success: false,
        error: 'Connect your wallet before applying to a job.',
      };
    }

    const updatedApplicants = addApplicant(
      parseApplicants(applicantField),
      applicantAddress
    );

    const { error } = await updateJob({
      status: 'In Progress',
      applicant: JSON.stringify(updatedApplicants),
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Unknown error';
    return { success: false, error: message };
  }
}

/**
 * Shape of a Supabase/PostgREST error. Only `message` / `code` are read by
 * this module; the real `PostgrestError` satisfies it structurally.
 */
export interface DbErrorLike {
  message?: string;
  code?: string;
}

/** Minimal structural shape of the Supabase client used by {@link insertNexusJob}. */
export interface JobInsertClient {
  from: (table: string) => {
    insert: (rows: unknown[]) => PromiseLike<{ error: DbErrorLike | null }>;
  };
}

/**
 * True when a Supabase/PostgREST/Postgres error means a column is missing
 * from the table schema (the PostgREST schema-cache error or the raw
 * Postgres `42703 undefined_column` error), as opposed to a real data
 * problem we should surface to the user. Table-level errors (e.g. "relation
 * does not exist") are deliberately excluded — stripping columns can't help
 * those.
 */
export function isMissingColumnError(error: DbErrorLike | null | undefined): boolean {
  if (!error) return false;
  if (error.code === '42703') return true;
  const msg = error.message?.toLowerCase() ?? '';
  return (
    (msg.includes('column') && msg.includes('does not exist')) ||
    (msg.includes('could not find the') && msg.includes(' column of '))
  );
}

/**
 * Extract the offending column name from a missing-column error message.
 * Handles both the raw Postgres wording (`column nexus_jobs.deadline does
 * not exist`) and the PostgREST schema-cache wording (`Could not find the
 * 'deadline' column of 'nexus_jobs' ...`). Returns null when the message
 * doesn't name a column.
 */
export function extractMissingColumn(error: DbErrorLike | null | undefined): string | null {
  if (!error?.message) return null;
  const msg = error.message;

  const pg = msg.match(/column\s+([^\s]+)\s+does not exist/i);
  if (pg) {
    const qualified = pg[1].replace(/["']/g, '');
    return qualified.includes('.') ? qualified.slice(qualified.lastIndexOf('.') + 1) : qualified;
  }

  const pgrst = msg.match(/could not find the '([^']+)' column/i);
  return pgrst ? pgrst[1] : null;
}

/**
 * Insert a job into `nexus_jobs`, degrading gracefully when the table is
 * missing columns (hand-created tables predate later-added columns like
 * `deadline`; see supabase/migrations/003_nexus_jobs.sql).
 *
 * Tries the full payload first. If the database rejects it because a column
 * doesn't exist, the offending column is parsed out of the error message,
 * stripped, and the insert is retried — so a missing column no longer fails
 * the whole job save. Retries are capped to avoid pathological loops, and
 * `fallbackUsed` reports whether any column had to be dropped.
 */
export async function insertNexusJob(
  supabase: JobInsertClient,
  job: Record<string, unknown>
): Promise<{ error: DbErrorLike | null; fallbackUsed: boolean }> {
  const attempt = (payload: Record<string, unknown>) =>
    supabase.from('nexus_jobs').insert([payload]);

  let payload = job;
  let error: DbErrorLike | null = null;
  const stripped = new Set<string>();

  // One attempt per possibly-missing column, max 3 inserts total.
  for (let i = 0; i < 3; i += 1) {
    ({ error } = await attempt(payload));
    if (!error || !isMissingColumnError(error)) break;

    const column = extractMissingColumn(error);
    if (!column || !(column in payload) || stripped.has(column)) break;

    stripped.add(column);
    payload = { ...payload };
    delete payload[column];
  }

  return { error, fallbackUsed: stripped.size > 0 };
}

/** Extract a provider address from a provider field (JSON or plain string). */
export function parseProviderAddress(provider: unknown): string | null {
  if (provider == null || typeof provider !== 'string') return null;

  try {
    const parsed = JSON.parse(provider);
    if (parsed && typeof parsed === 'object' && typeof parsed.address === 'string') {
      return parsed.address;
    }
    return provider;
  } catch {
    return provider;
  }
}

/** Jobs created by a user (provider matches their short address). */
export function filterCreatedJobs(jobs: Job[], userAddress: string): Job[] {
  const short = shortAddress(userAddress).toLowerCase();
  return jobs.filter((job) => {
    const providerAddress = parseProviderAddress(job.provider);
    return providerAddress != null && providerAddress.toLowerCase() === short;
  });
}

/** Jobs a user has applied to. */
export function filterAppliedJobs(jobs: Job[], userAddress: string): Job[] {
  const needle = userAddress.toLowerCase();
  return jobs.filter((job) => {
    if (!job.applicant) return false;
    return parseApplicants(job.applicant).some(
      (a) => a.toLowerCase() === needle
    );
  });
}
