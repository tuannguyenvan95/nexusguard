import { describe, expect, it } from 'vitest';
import {
  isPublicPath,
  resolveAuthRedirect,
  sanitizeNextPath,
} from '@/lib/auth';

describe('sanitizeNextPath', () => {
  it('accepts a normal relative path', () => {
    expect(sanitizeNextPath('/dashboard/jobs')).toBe('/dashboard/jobs');
  });

  it('returns null for missing values', () => {
    expect(sanitizeNextPath(null)).toBeNull();
    expect(sanitizeNextPath(undefined)).toBeNull();
    expect(sanitizeNextPath('')).toBeNull();
  });

  it('rejects absolute and protocol-relative URLs (open redirect protection)', () => {
    expect(sanitizeNextPath('https://evil.example.com')).toBeNull();
    expect(sanitizeNextPath('//evil.example.com')).toBeNull();
    expect(sanitizeNextPath('javascript:alert(1)')).toBeNull();
  });
});

describe('isPublicPath', () => {
  it('treats the landing page and auth screens as public', () => {
    expect(isPublicPath('/')).toBe(true);
    expect(isPublicPath('/login')).toBe(true);
    expect(isPublicPath('/register')).toBe(true);
  });

  it('treats API routes as public', () => {
    expect(isPublicPath('/api/jobs')).toBe(true);
  });

  it('treats dashboard routes as protected', () => {
    expect(isPublicPath('/dashboard')).toBe(false);
    expect(isPublicPath('/dashboard/treasury')).toBe(false);
  });
});

describe('resolveAuthRedirect', () => {
  it('redirects unauthenticated dashboard visitors to /login with a next param', () => {
    expect(resolveAuthRedirect('/dashboard/jobs/123', '', false)).toEqual({
      pathname: '/login',
      search: `?next=${encodeURIComponent('/dashboard/jobs/123')}`,
    });
  });

  it('preserves the original query string in the next param', () => {
    expect(resolveAuthRedirect('/dashboard', '?tab=open', false)).toEqual({
      pathname: '/login',
      search: `?next=${encodeURIComponent('/dashboard?tab=open')}`,
    });
  });

  it('lets unauthenticated users through on public paths', () => {
    expect(resolveAuthRedirect('/', '', false)).toBeNull();
    expect(resolveAuthRedirect('/login', '', false)).toBeNull();
    expect(resolveAuthRedirect('/api/jobs', '', false)).toBeNull();
  });

  it('bounces signed-in users off the auth screens', () => {
    expect(resolveAuthRedirect('/login', '', true)).toEqual({
      pathname: '/dashboard',
      search: '',
    });
    expect(resolveAuthRedirect('/register', '', true)).toEqual({
      pathname: '/dashboard',
      search: '',
    });
  });

  it('lets signed-in users through on dashboard routes', () => {
    expect(resolveAuthRedirect('/dashboard', '', true)).toBeNull();
  });
});
