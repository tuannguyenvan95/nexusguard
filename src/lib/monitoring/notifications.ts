export type NotificationKind = 'critical' | 'offline' | 'warning'

export interface MonitorNotification {
  id: number
  kind: NotificationKind
  title: string
  message: string
  time: string
}

type Listener = (notification: MonitorNotification) => void

const listeners = new Set<Listener>()
let idCounter = 0

/** Subscribe to monitor notifications. Returns an unsubscribe function. */
export function subscribeNotifications(fn: Listener): () => void {
  listeners.add(fn)
  return () => {
    listeners.delete(fn)
  }
}

/** Fire a monitor notification to all subscribers (client-side event bus). */
export function pushNotification(
  n: Omit<MonitorNotification, 'id' | 'time'>
): void {
  const full: MonitorNotification = {
    ...n,
    id: ++idCounter,
    time: new Date().toLocaleTimeString([], { hour12: false }),
  }
  listeners.forEach((fn) => fn(full))
}
