import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const { mockCreateBrowserClient } = vi.hoisted(() => ({
  mockCreateBrowserClient: vi.fn(),
}));

vi.mock('@supabase/ssr', () => ({
  createBrowserClient: mockCreateBrowserClient,
}));

import { createClient } from '@/lib/supabase/client';

describe('Supabase Client Validation', () => {
  const validEnv = {
    NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    Object.assign(process.env, validEnv);
  });

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  });

  it('should create a browser client with the configured env vars', () => {
    mockCreateBrowserClient.mockReturnValue({ __client: true });

    const client = createClient();

    expect(mockCreateBrowserClient).toHaveBeenCalledWith(
      'https://test.supabase.co',
      'test-anon-key'
    );
    expect(client).toEqual({ __client: true });
  });

  it('should throw when URL is missing', () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;

    expect(() => createClient()).toThrow(/NEXT_PUBLIC_SUPABASE_URL/);
  });

  it('should throw when anon key is missing', () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    expect(() => createClient()).toThrow(/NEXT_PUBLIC_SUPABASE_ANON_KEY/);
  });

  it('should throw when both are missing', () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    expect(() => createClient()).toThrow(/Missing Supabase environment variables/);
  });

  it('should not call createBrowserClient when env vars are missing', () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    expect(() => createClient()).toThrow();
    expect(mockCreateBrowserClient).not.toHaveBeenCalled();
  });
});
