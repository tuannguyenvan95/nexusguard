/**
 * Pure auth/redirect helpers shared by the edge proxy and the auth pages.
 *
 * Kept dependency-free and side-effect-free so they can be unit tested
 * (see src/lib/__tests__/auth.test.ts) and reused safely both on the
 * server (proxy) and the client (login page).
 */

/** Paths that never require authentication. */
const PUBLIC_PATH_PREFIXES = ['/login', '/register'];

/**
 * True for paths that should be reachable without a session.
 * The landing page, API routes and the auth screens are all public.
 */
export function isPublicPath(pathname: string): boolean {
  return (
    pathname === '/' ||
    pathname.startsWith('/api/') ||
    PUBLIC_PATH_PREFIXES.some((p) => pathname.startsWith(p))
  );
}

/**
 * Sanitize a `next` query parameter into a safe same-origin relative URL.
 *
 * Rejects absolute URLs, protocol-relative URLs (`//evil.com`) and any
 * non-path values so a crafted link can never be turned into an open
 * redirect after login. Returns null when there is nothing safe to use.
 */
export function sanitizeNextPath(
  next: string | null | undefined
): string | null {
  if (!next) return null;
  if (!next.startsWith('/') || next.startsWith('//')) return null;
  return next;
}

/** A redirect decision: where to send the visitor, and with what query. */
export interface AuthRedirect {
  pathname: string;
  search: string;
}

/**
 * Decide where a request should be redirected based on session state.
 *
 * - Unauthenticated visitors hitting anything under /dashboard are sent
 *   to /login with `?next=<original path>` so they can continue where
 *   they were headed after signing in.
 * - Authenticated visitors hitting the auth screens are bounced to
 *   /dashboard (they have no business on login/register).
 *
 * Returns null when the request may proceed.
 */
export function resolveAuthRedirect(
  pathname: string,
  search: string,
  isAuthenticated: boolean
): AuthRedirect | null {
  if (isAuthenticated) {
    if (pathname === '/login' || pathname === '/register') {
      return { pathname: '/dashboard', search: '' };
    }
    return null;
  }

  if (pathname.startsWith('/dashboard')) {
    return {
      pathname: '/login',
      search: `?next=${encodeURIComponent(pathname + search)}`,
    };
  }

  return null;
}
