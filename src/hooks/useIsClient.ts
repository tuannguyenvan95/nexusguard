'use client'

import { useSyncExternalStore } from 'react'

const emptySubscribe = () => () => {};

/**
 * SSR-safe hydration gate. Returns `false` on the server (and during the
 * server snapshot), `true` on the client. Use it to gate client-only UI such
 * as `createPortal` usage or values read from `localStorage` without causing
 * hydration mismatches or cascading renders (unlike `setState` in an effect).
 */
export function useIsClient(): boolean {
  return useSyncExternalStore(emptySubscribe, () => true, () => false);
}
