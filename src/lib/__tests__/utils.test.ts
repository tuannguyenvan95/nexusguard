import { describe, it, expect } from 'vitest';
import { getErrorMessage } from '@/lib/utils';

describe('getErrorMessage', () => {
  it('returns the message of an Error instance', () => {
    expect(getErrorMessage(new Error('boom'))).toBe('boom');
  });

  it('returns plain strings as-is', () => {
    expect(getErrorMessage('oops')).toBe('oops');
  });

  it('extracts a message property from unknown objects', () => {
    expect(getErrorMessage({ message: 'api failed' })).toBe('api failed');
  });

  it('stringifies non-string message properties', () => {
    expect(getErrorMessage({ message: 123 })).toBe('123');
  });

  it('returns a fallback for null and undefined', () => {
    expect(getErrorMessage(null)).toBe('Unknown error');
    expect(getErrorMessage(undefined)).toBe('Unknown error');
  });

  it('returns a fallback for non-object primitives', () => {
    expect(getErrorMessage(42)).toBe('Unknown error');
    expect(getErrorMessage(true)).toBe('Unknown error');
  });

  it('returns a fallback for objects without a message', () => {
    expect(getErrorMessage({ code: 'E_NOPE' })).toBe('Unknown error');
  });
});
