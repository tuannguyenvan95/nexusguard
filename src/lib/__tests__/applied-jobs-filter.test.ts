import { describe, it, expect } from 'vitest';
import { filterCreatedJobs, filterAppliedJobs, shortAddress, type Job } from '@/lib/jobs';

describe('Profile Page Applied Jobs Filter', () => {
  const userAddress = '0x1234567890abcdef1234567890abcdef12345678';

  describe('filterAppliedJobs', () => {
    it('should find jobs when applicant is a JSON array', () => {
      const jobs: Job[] = [
        {
          id: 'job_1',
          title: 'Test Job',
          applicant: JSON.stringify([userAddress, '0xother']),
        },
      ];

      const result = filterAppliedJobs(jobs, userAddress);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('job_1');
    });

    it('should find jobs when applicant is already an array', () => {
      const jobs: Job[] = [
        {
          id: 'job_1',
          title: 'Test Job',
          applicant: [userAddress, '0xother'],
        },
      ];

      const result = filterAppliedJobs(jobs, userAddress);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('job_1');
    });

    it('should find jobs when applicant is a single string', () => {
      const jobs: Job[] = [
        {
          id: 'job_1',
          title: 'Test Job',
          applicant: userAddress,
        },
      ];

      const result = filterAppliedJobs(jobs, userAddress);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('job_1');
    });

    it('should be case-insensitive when comparing addresses', () => {
      const jobs: Job[] = [
        {
          id: 'job_1',
          title: 'Test Job',
          applicant: userAddress.toUpperCase(),
        },
      ];

      const result = filterAppliedJobs(jobs, userAddress);
      expect(result).toHaveLength(1);
    });

    it('should return empty array when no jobs match', () => {
      const jobs: Job[] = [
        {
          id: 'job_1',
          title: 'Test Job',
          applicant: '0xnotmatching',
        },
      ];

      const result = filterAppliedJobs(jobs, userAddress);
      expect(result).toHaveLength(0);
    });

    it('should handle jobs with no applicant field', () => {
      const jobs: Job[] = [
        {
          id: 'job_1',
          title: 'Test Job',
        },
      ];

      const result = filterAppliedJobs(jobs, userAddress);
      expect(result).toHaveLength(0);
    });

    it('should handle jobs with null applicant', () => {
      const jobs: Job[] = [
        {
          id: 'job_1',
          title: 'Test Job',
          applicant: null,
        },
      ];

      const result = filterAppliedJobs(jobs, userAddress);
      expect(result).toHaveLength(0);
    });

    it('should handle invalid JSON in applicant field', () => {
      const jobs: Job[] = [
        {
          id: 'job_1',
          title: 'Test Job',
          applicant: 'invalid-json{',
        },
      ];

      // Should fall back to string comparison
      const result = filterAppliedJobs(jobs, userAddress);
      expect(result).toHaveLength(0);
    });
  });

  describe('filterCreatedJobs', () => {
    it('should find jobs created by user with JSON provider', () => {
      const short = shortAddress(userAddress).toLowerCase();

      const jobs: Job[] = [
        {
          id: 'job_1',
          title: 'My Job',
          provider: JSON.stringify({ address: short, name: 'Test' }),
        },
      ];

      const result = filterCreatedJobs(jobs, userAddress);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('job_1');
    });

    it('should find jobs created by user with string provider', () => {
      const short = shortAddress(userAddress).toLowerCase();

      const jobs: Job[] = [
        {
          id: 'job_1',
          title: 'My Job',
          provider: short,
        },
      ];

      const result = filterCreatedJobs(jobs, userAddress);
      expect(result).toHaveLength(1);
    });

    it('should return empty array when no jobs match', () => {
      const jobs: Job[] = [
        {
          id: 'job_1',
          title: 'Other Job',
          provider: '0xnotmatching',
        },
      ];

      const result = filterCreatedJobs(jobs, userAddress);
      expect(result).toHaveLength(0);
    });
  });
});
