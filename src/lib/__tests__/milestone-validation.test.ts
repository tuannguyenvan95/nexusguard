import { describe, it, expect } from 'vitest';
import {
  validateMilestones,
  calculateMilestoneAmounts,
  addMilestone,
  removeMilestone,
  MAX_MILESTONES,
  type Milestone,
} from '@/lib/jobs';

describe('Milestone Validation', () => {
  describe('validateMilestones', () => {
    it('should pass when milestones sum to exactly 100', () => {
      const milestones: Milestone[] = [
        { name: 'Phase 1', percent: 50 },
        { name: 'Phase 2', percent: 50 },
      ];

      const result = validateMilestones(milestones);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should pass with single milestone at 100%', () => {
      const milestones: Milestone[] = [
        { name: 'Final Delivery', percent: 100 },
      ];

      const result = validateMilestones(milestones);
      expect(result.valid).toBe(true);
    });

    it('should pass with multiple milestones summing to 100', () => {
      const milestones: Milestone[] = [
        { name: 'Phase 1', percent: 33 },
        { name: 'Phase 2', percent: 33 },
        { name: 'Phase 3', percent: 34 },
      ];

      const result = validateMilestones(milestones);
      expect(result.valid).toBe(true);
    });

    it('should handle floating point precision (e.g., 33.33 * 3)', () => {
      const milestones: Milestone[] = [
        { name: 'Phase 1', percent: 33.33 },
        { name: 'Phase 2', percent: 33.33 },
        { name: 'Phase 3', percent: 33.34 },
      ];

      const result = validateMilestones(milestones);
      expect(result.valid).toBe(true);
    });

    it('should fail when milestones sum to less than 100', () => {
      const milestones: Milestone[] = [
        { name: 'Phase 1', percent: 40 },
        { name: 'Phase 2', percent: 40 },
      ];

      const result = validateMilestones(milestones);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('100%');
    });

    it('should fail when milestones sum to more than 100', () => {
      const milestones: Milestone[] = [
        { name: 'Phase 1', percent: 60 },
        { name: 'Phase 2', percent: 60 },
      ];

      const result = validateMilestones(milestones);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('100%');
    });

    it('should fail with empty milestones array', () => {
      const milestones: Milestone[] = [];

      const result = validateMilestones(milestones);
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('addMilestone', () => {
    it('should turn a single 100% milestone into a 50/50 split', () => {
      const result = addMilestone([{ name: 'Final Delivery', percent: 100 }]);

      expect(result).toEqual([
        { name: 'Phase 1', percent: 50 },
        { name: 'Phase 2', percent: 50 },
      ]);
    });

    it('should distribute evenly with the remainder on the last milestone', () => {
      const result = addMilestone([
        { name: 'Phase 1', percent: 50 },
        { name: 'Phase 2', percent: 50 },
      ]);

      expect(result).toEqual([
        { name: 'Phase 1', percent: 33 },
        { name: 'Phase 2', percent: 33 },
        { name: 'Phase 3', percent: 34 },
      ]);
    });

    it('should always sum to 100 after adding', () => {
      let milestones: Milestone[] = [{ name: 'Final Delivery', percent: 100 }];

      for (let i = 0; i < MAX_MILESTONES - 1; i++) {
        milestones = addMilestone(milestones);
        expect(milestones.reduce((s, m) => s + m.percent, 0)).toBe(100);
      }

      expect(milestones).toHaveLength(MAX_MILESTONES);
    });

    it('should cap at MAX_MILESTONES', () => {
      let milestones: Milestone[] = [{ name: 'Final Delivery', percent: 100 }];
      for (let i = 1; i < MAX_MILESTONES; i++) {
        milestones = addMilestone(milestones);
      }

      const capped = addMilestone(milestones);
      expect(capped).toBe(milestones);
      expect(capped).toHaveLength(MAX_MILESTONES);
    });

    it('should handle empty array', () => {
      expect(addMilestone([])).toEqual([{ name: 'Phase 1', percent: 100 }]);
    });
  });

  describe('removeMilestone', () => {
    it('should remove the milestone and redistribute remaining', () => {
      const result = removeMilestone(
        [
          { name: 'Phase 1', percent: 33 },
          { name: 'Phase 2', percent: 33 },
          { name: 'Phase 3', percent: 34 },
        ],
        0
      );

      expect(result).toEqual([
        { name: 'Phase 2', percent: 50 },
        { name: 'Phase 3', percent: 50 },
      ]);
    });

    it('should preserve milestone names when removing', () => {
      const result = removeMilestone(
        [
          { name: 'Kickoff', percent: 50 },
          { name: 'Delivery', percent: 50 },
        ],
        0
      );

      expect(result).toEqual([{ name: 'Delivery', percent: 100 }]);
    });

    it('should not remove when only one milestone exists', () => {
      const single: Milestone[] = [{ name: 'Final Delivery', percent: 100 }];
      expect(removeMilestone(single, 0)).toBe(single);
    });

    it('should always sum to 100 after removing', () => {
      let milestones: Milestone[] = [
        { name: 'Phase 1', percent: 20 },
        { name: 'Phase 2', percent: 20 },
        { name: 'Phase 3', percent: 20 },
        { name: 'Phase 4', percent: 20 },
        { name: 'Phase 5', percent: 20 },
      ];

      while (milestones.length > 1) {
        milestones = removeMilestone(milestones, 0);
        expect(milestones.reduce((s, m) => s + m.percent, 0)).toBe(100);
      }
    });

    it('should handle out-of-range index by redistributing the full list', () => {
      const ms: Milestone[] = [
        { name: 'Phase 1', percent: 60 },
        { name: 'Phase 2', percent: 40 },
      ];

      // Nothing is filtered out, so the list is just re-balanced evenly.
      expect(removeMilestone(ms, 99)).toEqual([
        { name: 'Phase 1', percent: 50 },
        { name: 'Phase 2', percent: 50 },
      ]);
    });
  });

  describe('calculateMilestoneAmounts', () => {
    it('should calculate correct amounts for 50/50 split', () => {
      const milestones: Milestone[] = [
        { name: 'Phase 1', percent: 50 },
        { name: 'Phase 2', percent: 50 },
      ];

      const result = calculateMilestoneAmounts(1000, milestones, 'USDC');

      expect(result).toEqual([
        { name: 'Phase 1', amount: '500.00 USDC', percent: 50 },
        { name: 'Phase 2', amount: '500.00 USDC', percent: 50 },
      ]);
    });

    it('should calculate correct amounts for uneven split', () => {
      const milestones: Milestone[] = [
        { name: 'Phase 1', percent: 30 },
        { name: 'Phase 2', percent: 70 },
      ];

      const result = calculateMilestoneAmounts(1000, milestones, 'USDC');

      expect(result).toEqual([
        { name: 'Phase 1', amount: '300.00 USDC', percent: 30 },
        { name: 'Phase 2', amount: '700.00 USDC', percent: 70 },
      ]);
    });

    it('should handle decimal percentages', () => {
      const milestones: Milestone[] = [
        { name: 'Phase 1', percent: 33.33 },
        { name: 'Phase 2', percent: 33.33 },
        { name: 'Phase 3', percent: 33.34 },
      ];

      const result = calculateMilestoneAmounts(1000, milestones, 'USDC');

      expect(result[0].amount).toBe('333.30 USDC');
      expect(result[1].amount).toBe('333.30 USDC');
      expect(result[2].amount).toBe('333.40 USDC');
    });

    it('should work with different currencies', () => {
      const milestones: Milestone[] = [
        { name: 'Phase 1', percent: 100 },
      ];

      const result = calculateMilestoneAmounts(5000, milestones, 'ETH');

      expect(result).toEqual([
        { name: 'Phase 1', amount: '5000.00 ETH', percent: 100 },
      ]);
    });
  });
});
