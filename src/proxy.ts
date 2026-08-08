import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/proxy';

/**
 * Next.js 16 renamed the `middleware` convention to `proxy`.
 * This runs before every matched request, refreshes the Supabase session
 * and enforces dashboard auth.
 */
export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
