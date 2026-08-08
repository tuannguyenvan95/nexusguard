import { createClient } from '@/lib/supabase/client'
import type { AgentAction, Job } from '@/types/database'

export interface EscrowStats {
  lockedBalance: number
  activeEscrows: number
  pendingMilestones: number
  releasedMilestones: number
  refunded: number
  disputed: number
}

export type EscrowEventType =
  | 'JobCreated'
  | 'JobFunded'
  | 'DeliverableSubmitted'
  | 'Validated'
  | 'FundsReleased'
  | 'JobRefunded'
  | 'AgentRegistered'
  | 'CoordinationCycle'
  | 'InvoiceGenerated'
  | 'DisputeOpened'
  | 'Unknown'

export interface EscrowEvent {
  id: string
  time: string
  type: EscrowEventType
  detail: string
  hash: string
}

export interface EscrowSnapshot {
  /** Real escrow stats aggregated from the jobs table, or null if unreadable. */
  stats: EscrowStats | null
  /** Real contract-style events from agent_actions, or null if unreadable/empty. */
  events: EscrowEvent[] | null
}

const ACTIVE_STATUSES = ['open', 'funded', 'submitted']

function actionToEventType(action: string): EscrowEventType {
  switch (action) {
    case 'createJob':
      return 'JobCreated'
    case 'fundJob':
      return 'JobFunded'
    case 'submitDeliverable':
      return 'DeliverableSubmitted'
    case 'validate':
      return 'Validated'
    case 'processPayment':
      return 'FundsReleased'
    case 'refund':
      return 'JobRefunded'
    case 'register':
      return 'AgentRegistered'
    case 'coordinate':
      return 'CoordinationCycle'
    case 'generateInvoice':
      return 'InvoiceGenerated'
    case 'dispute':
      return 'DisputeOpened'
    default:
      return 'Unknown'
  }
}

function formatClockTime(iso: string): string {
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? '--:--:--' : d.toLocaleTimeString([], { hour12: false })
}

function shortId(id: string): string {
  return id.length > 8 ? id.slice(0, 8) : id
}

/** Aggregate escrow stats from real job rows (RLS permitting). */
function computeStats(jobs: Job[]): EscrowStats {
  const active = jobs.filter((j) => ACTIVE_STATUSES.includes(j.status))
  const lockedBalance = active.reduce((sum, j) => sum + Number(j.budget_usdc || 0), 0)

  let pendingMilestones = 0
  let releasedMilestones = 0
  for (const job of jobs) {
    const ms = Array.isArray(job.milestones) ? job.milestones : []
    for (const m of ms) {
      // Milestone rows differ across the codebase ({completed: boolean} vs
      // {status: 'released'} vs {percent} only) — accept every known shape.
      const milestone = m as { completed?: unknown; status?: string }
      const done = milestone.completed === true || milestone.status === 'released'
      if (done) releasedMilestones += 1
      else pendingMilestones += 1
    }
  }

  return {
    lockedBalance,
    activeEscrows: active.length,
    pendingMilestones,
    releasedMilestones,
    refunded: jobs.filter((j) => j.status === 'rejected').length,
    disputed: 0,
  }
}

/**
 * Fetch real escrow telemetry from Supabase:
 *  - stats aggregated from the `jobs` table (open/funded/submitted = active escrows)
 *  - contract-style events from `agent_actions` (publicly readable)
 * Returns null for the parts that could not be read so the caller can fall back
 * to simulation per-part. Never throws.
 */
export async function fetchEscrowData(): Promise<EscrowSnapshot> {
  let supabase: ReturnType<typeof createClient>
  try {
    supabase = createClient()
  } catch {
    return { stats: null, events: null }
  }

  try {
    const [actionsRes, jobsRes] = await Promise.all([
      supabase.from('agent_actions').select('*').order('created_at', { ascending: false }).limit(8),
      supabase.from('jobs').select('*').limit(100),
    ])

    const actions: AgentAction[] = actionsRes.error ? [] : (actionsRes.data || [])
    const jobs: Job[] = jobsRes.error ? [] : (jobsRes.data || [])
    const titleById = new Map(jobs.map((j) => [j.id, j.title]))

    const events: EscrowEvent[] = actions.map((a) => {
      const type = actionToEventType(a.action_type)
      const title = a.job_id ? titleById.get(a.job_id) : undefined
      const jobRef = a.job_id ? `#${shortId(a.job_id)}` : ''
      const details = (a.details || {}) as Record<string, unknown>

      let detail: string
      switch (type) {
        case 'JobCreated':
          detail = `Escrow "${title ?? jobRef}" created${details.budget ? ` · ${details.budget} USDC` : ''}`
          break
        case 'JobFunded':
          detail = `Escrow "${title ?? jobRef}" funded · ${details.amount ? `${details.amount} USDC` : 'funds locked'}`
          break
        case 'DeliverableSubmitted':
          detail = `Deliverable submitted for "${title ?? jobRef}"`
          break
        case 'Validated':
          detail = `Deliverable validated${typeof details.score === 'number' ? ` · score ${details.score}/100` : ''}`
          break
        case 'FundsReleased':
          detail = `Payment released for "${title ?? jobRef}"`
          break
        case 'AgentRegistered':
          detail = 'Agent identity registered on-chain'
          break
        case 'CoordinationCycle':
          detail = 'Coordination cycle completed'
          break
        case 'InvoiceGenerated':
          detail = `Invoice ${String(details.invoiceNumber ?? '')} generated · ${String(details.totalAmount ?? '')} USDC`
          break
        case 'DisputeOpened':
          detail = `Dispute opened on escrow "${title ?? jobRef}"`
          break
        default:
          detail = `${a.action_type} · ${(title ?? jobRef) || 'network'}`
      }

      return {
        id: a.id,
        time: formatClockTime(a.created_at),
        type,
        detail,
        hash: a.tx_hash || '--',
      }
    })

    // Neither source could be read → nothing real available.
    if (actionsRes.error && jobsRes.error) {
      return { stats: null, events: null }
    }

    return {
      stats: jobsRes.error ? null : computeStats(jobs),
      events: events.length > 0 ? events : null,
    }
  } catch {
    return { stats: null, events: null }
  }
}
