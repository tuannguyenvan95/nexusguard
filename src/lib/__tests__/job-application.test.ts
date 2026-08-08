import { describe, it, expect, vi } from 'vitest';
import { applyToJob, addApplicant, parseApplicants, type Job } from '@/lib/jobs';

// Full-length EVM addresses — applyToJob now rejects short demo aliases.
const USER_A = '0x1111111111111111111111111111111111111111';
const USER_B = '0x2222222222222222222222222222222222222222';

describe('Job Application Handler', () => {
  it('should add applicant to empty array', async () => {
    const job: Job = {
      id: 'job_1',
      applicant: [],
      status: 'Open',
    };

    const mockUpdateJob = vi.fn().mockResolvedValue({ error: null });

    const result = await applyToJob(job.applicant, USER_A, mockUpdateJob);

    expect(result.success).toBe(true);
    expect(mockUpdateJob).toHaveBeenCalledWith({
      status: 'In Progress',
      applicant: JSON.stringify([USER_A]),
    });
  });

  it('should add applicant to existing array', async () => {
    const job: Job = {
      id: 'job_1',
      applicant: [USER_B],
      status: 'Open',
    };

    const mockUpdateJob = vi.fn().mockResolvedValue({ error: null });

    const result = await applyToJob(job.applicant, USER_A, mockUpdateJob);

    expect(result.success).toBe(true);
    expect(mockUpdateJob).toHaveBeenCalledWith({
      status: 'In Progress',
      applicant: JSON.stringify([USER_B, USER_A]),
    });
  });

  it('should not add duplicate applicant', async () => {
    const job: Job = {
      id: 'job_1',
      applicant: [USER_A],
      status: 'Open',
    };

    const mockUpdateJob = vi.fn().mockResolvedValue({ error: null });

    const result = await applyToJob(job.applicant, USER_A, mockUpdateJob);

    expect(result.success).toBe(true);
    expect(mockUpdateJob).toHaveBeenCalledWith({
      status: 'In Progress',
      applicant: JSON.stringify([USER_A]),
    });
  });

  it('should handle JSON string applicant field', async () => {
    const job: Job = {
      id: 'job_1',
      applicant: JSON.stringify([USER_B]),
      status: 'Open',
    };

    const mockUpdateJob = vi.fn().mockResolvedValue({ error: null });

    const result = await applyToJob(job.applicant, USER_A, mockUpdateJob);

    expect(result.success).toBe(true);
    expect(mockUpdateJob).toHaveBeenCalledWith({
      status: 'In Progress',
      applicant: JSON.stringify([USER_B, USER_A]),
    });
  });

  it('should reject fake/short applicant addresses without calling update', async () => {
    const job: Job = {
      id: 'job_1',
      applicant: [],
      status: 'Open',
    };

    const mockUpdateJob = vi.fn().mockResolvedValue({ error: null });

    const result = await applyToJob(job.applicant, '0x123...abc (Simulated)', mockUpdateJob);

    expect(result.success).toBe(false);
    expect(result.error).toContain('Connect your wallet');
    expect(mockUpdateJob).not.toHaveBeenCalled();
  });

  it('should reject malformed applicant addresses', async () => {
    const job: Job = {
      id: 'job_1',
      applicant: [],
      status: 'Open',
    };

    const mockUpdateJob = vi.fn().mockResolvedValue({ error: null });

    const result = await applyToJob(job.applicant, 'not-an-address', mockUpdateJob);

    expect(result.success).toBe(false);
    expect(mockUpdateJob).not.toHaveBeenCalled();
  });

  it('should return error when update fails', async () => {
    const job: Job = {
      id: 'job_1',
      applicant: [],
      status: 'Open',
    };

    const mockUpdateJob = vi.fn().mockResolvedValue({
      error: { message: 'Database error' },
    });

    const result = await applyToJob(job.applicant, USER_A, mockUpdateJob);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Database error');
  });

  it('should handle exceptions gracefully', async () => {
    const job: Job = {
      id: 'job_1',
      applicant: [],
      status: 'Open',
    };

    const mockUpdateJob = vi.fn().mockRejectedValue(new Error('Network error'));

    const result = await applyToJob(job.applicant, USER_A, mockUpdateJob);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Network error');
  });

  it('should handle invalid JSON in applicant field', async () => {
    const job: Job = {
      id: 'job_1',
      applicant: 'invalid-json',
      status: 'Open',
    };

    const mockUpdateJob = vi.fn().mockResolvedValue({ error: null });

    const result = await applyToJob(job.applicant, USER_A, mockUpdateJob);

    expect(result.success).toBe(true);
    // Should fall back to treating the string as a single applicant
    expect(mockUpdateJob).toHaveBeenCalledWith({
      status: 'In Progress',
      applicant: JSON.stringify(['invalid-json', USER_A]),
    });
  });

  describe('addApplicant', () => {
    it('should append when absent', () => {
      expect(addApplicant(['0xa'], '0xb')).toEqual(['0xa', '0xb']);
    });

    it('should not append when present', () => {
      expect(addApplicant(['0xa'], '0xa')).toEqual(['0xa']);
    });
  });

  describe('parseApplicants', () => {
    it('should handle undefined/null/empty', () => {
      expect(parseApplicants(undefined)).toEqual([]);
      expect(parseApplicants(null)).toEqual([]);
      expect(parseApplicants('')).toEqual([]);
    });

    it('should pass through arrays', () => {
      expect(parseApplicants(['0xa', '0xb'])).toEqual(['0xa', '0xb']);
    });

    it('should parse JSON array strings', () => {
      expect(parseApplicants('["0xa","0xb"]')).toEqual(['0xa', '0xb']);
    });

    it('should parse JSON string values', () => {
      expect(parseApplicants('"0xa"')).toEqual(['0xa']);
    });

    it('should fall back to single string on invalid JSON', () => {
      expect(parseApplicants('0xa')).toEqual(['0xa']);
    });
  });
});
