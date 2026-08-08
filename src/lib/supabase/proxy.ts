import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { isPublicPath, resolveAuthRedirect } from '@/lib/auth';

/**
 * Session check run by the edge proxy (see src/proxy.ts).
 *
 * Protects /dashboard from unauthenticated visitors and keeps signed-in
 * users off the login/register screens. When Supabase is not configured
 * (e.g. a local demo without env vars) the check fails open so the app
 * keeps working.
 */
export async function updateSession(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Missing Supabase environment variables; skipping auth check in proxy.');
    return NextResponse.next();
  }

  // Public paths (landing page, auth screens, API routes) never need a
  // session check — skip the Supabase round-trip entirely. The proxy docs
  // warn against doing slow work on every request, and this avoids one.
  if (isPublicPath(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname, search } = request.nextUrl;
  const redirect = resolveAuthRedirect(pathname, search, Boolean(user));

  if (redirect) {
    const url = request.nextUrl.clone();
    url.pathname = redirect.pathname;
    url.search = redirect.search;
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
