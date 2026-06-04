import { useEffect, useState } from 'react'
import { Wrench, Package, AlertTriangle, Play } from 'lucide-react'
import { listCabinets } from '@/api/cabinets'
import { listTools } from '@/api/tools'
import { listShifts } from '@/api/shifts'
import { listActivities } from '@/api/activities'
import { ApiError } from '@/api/client'
import type { Activity, Cabinet, Shift, Tool } from '@/types/domain'
import styles from './Dashboard.module.css'

function relTime(iso: string): string {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (mins < 1)  return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)  return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function shiftDuration(iso: string): string {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return h > 0 ? `${h}h ${m.toString().padStart(2, '0')}m` : `${m}m`
}

function describeActivity(act: Activity): string {
  const cab = act.cabinetName ?? (act.cabinetId ? `CAB-${String(act.cabinetId).padStart(3, '0')}` : '—')
  const tool = act.toolName ?? (act.toolId != null ? `Tool #${act.toolId}` : null)
  switch (act.type) {
    case 'DOOR_OPENED':           return `${cab} door opened`
    case 'DOOR_CLOSED':           return `${cab} door secured`
    case 'TOOL_REMOVED':          return `${tool ?? 'Tool'} removed from ${cab}`
    case 'TOOL_RETURNED':         return `${tool ?? 'Tool'} returned to ${cab}`
    case 'TOOL_MISSING_DETECTED': return `${tool ?? 'Tool'} reported missing in ${cab}`
    case 'SHIFT_STARTED':         return `Shift started on ${cab}`
    case 'SHIFT_ENDED':           return `Shift ended on ${cab}`
    case 'CABINET_ONLINE':        return `${cab} online`
    case 'CABINET_OFFLINE':       return `${cab} offline`
    default:                      return `Event on ${cab}`
  }
}

interface CabinetCardProps {
  cabinet:     Cabinet
  tools:       Tool[]
  activeShift: Shift | null
}

function CabinetCard({ cabinet, tools, activeShift }: CabinetCardProps) {
  const avail = tools.filter(t => t.status === 'AVAILABLE').length
  const inUse = tools.filter(t => t.status === 'IN_USE').length
  const miss  = tools.filter(t => t.status === 'MISSING').length

  const cardClass = [
    styles.cabCard,
    cabinet.status === 'INACTIVE'     ? styles.cabOffline     : '',
    cabinet.status === 'BROKEN' ? styles.cabMaintenance : '',
  ].join(' ')

  return (
    <div className={cardClass}>
      <div className={styles.cabHead}>
        <div>
          <span className={styles.cabId}>{cabinet.name}</span>
          <span className={styles.cabLoc}>{cabinet.location}</span>
        </div>
        <span className={
          cabinet.status === 'OPEN'      ? styles.badgeOnline  :
          cabinet.status === 'CLOSED'    ? styles.badgeOnline  :
          cabinet.status === 'INACTIVE'  ? styles.badgeOffline :
              styles.badgeMaint
        }>
          {cabinet.status}
        </span>
      </div>

      {cabinet.status !== 'INACTIVE' && tools.length > 0 && (
        <>
          <div className={styles.toolBar}>
            {avail > 0 && <div className={`${styles.seg} ${styles.segAvail}`} style={{ flex: avail }} />}
            {inUse > 0 && <div className={`${styles.seg} ${styles.segInUse}`} style={{ flex: inUse }} />}
            {miss  > 0 && <div className={`${styles.seg}`} style={{ flex: miss, background: 'var(--risk, #d33)' }} />}
          </div>
          <div className={styles.toolCounts}>
            <span className={styles.countAvail}>{avail}<em>Stored Tools</em></span>
            <span className={styles.countInUse}>{inUse}<em>In Use Tools</em></span>
            {miss > 0 && <span style={{ color: 'var(--risk, #d33)' }}>{miss}<em>M</em></span>}
          </div>
        </>
      )}

      <div className={styles.cabFooter}>
        {activeShift ? (
          <div className={styles.shiftRow}>
            <Play size={10} />
            <span>{activeShift.userName ?? `User #${activeShift.userId}`}</span>
            <span className={styles.dot}>·</span>
            <span>{shiftDuration(activeShift.startTime)}</span>
          </div>
        ) : (
          <span className={styles.noShift}>No active shift</span>
        )}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [cabinets,   setCabinets]   = useState<Cabinet[]>([])
  const [tools,      setTools]      = useState<Tool[]>([])
  const [shifts,     setShifts]     = useState<Shift[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading,    setLoading]    = useState(true)
  const [loadError,  setLoadError]  = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    Promise.all([listCabinets(), listTools(), listShifts(), listActivities()])
      .then(([c, t, s, a]) => {
        if (cancelled) return
        setCabinets(c); setTools(t); setShifts(s); setActivities(a)
      })
      .catch(err => {
        if (cancelled) return
        setLoadError(err instanceof ApiError ? err.message : 'Failed to load dashboard')
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  const activeShifts = shifts.filter(s => s.status === 'ACTIVE')
  const inUseTools   = tools.filter(t => t.status === 'IN_USE')
  const missingTools = tools.filter(t => t.status === 'MISSING')
  const recent       = activities.slice(0, 12)

  const now = new Date().toISOString().replace('T', ' ').slice(0, 16) + ' UTC'

  return (
    <div className={styles.page}>
      <div className={styles.pageHead}>
        <div>
          <h1 className={styles.pageTitle}>Operations Overview</h1>
          <p className={styles.pageTs}>
            {loading ? 'Loading…' : loadError ? loadError : now}
          </p>
        </div>
      </div>

      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ '--c': 'var(--amber)' } as React.CSSProperties}>
            <Wrench size={16} />
          </div>
          <div className={styles.statBody}>
            <span className={styles.statVal}>{tools.length}</span>
            <span className={styles.statLabel}>Tools Tracked</span>
            <span className={styles.statSub}>{inUseTools.length} in use</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ '--c': 'var(--info)' } as React.CSSProperties}>
            <Play size={16} />
          </div>
          <div className={styles.statBody}>
            <span className={styles.statVal}>{activeShifts.length}</span>
            <span className={styles.statLabel}>Active Shifts</span>
            <span className={styles.statSub}>{shifts.length} total</span>
          </div>
        </div>

        <div className={`${styles.statCard} ${missingTools.length > 0 ? '' : styles.statCardClear}`}>
          <div className={styles.statIcon} style={{ '--c': missingTools.length > 0 ? 'var(--risk)' : 'var(--clear)' } as React.CSSProperties}>
            <AlertTriangle size={16} />
          </div>
          <div className={styles.statBody}>
            <span className={`${styles.statVal} ${missingTools.length === 0 ? styles.statValClear : ''}`}>
              {missingTools.length}
            </span>
            <span className={styles.statLabel}>Missing Tools</span>
            <span className={styles.statSub}>{missingTools.length === 0 ? 'All accounted for' : 'FOD risk'}</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ '--c': 'var(--clear)' } as React.CSSProperties}>
            <Package size={16} />
          </div>
          <div className={styles.statBody}>
            <span className={styles.statVal}>
              {cabinets.filter(c => ['OPEN', 'CLOSED'].includes(c.status)).length}
              <span className={styles.statOf}>/{cabinets.length}</span>
            </span>
            <span className={styles.statLabel}>Cabinets Online</span>
            <span className={styles.statSub}>
              {cabinets.filter(c => !['OPEN', 'CLOSED'].includes(c.status)).length} offline / maint.
            </span>
          </div>
        </div>
      </div>

      <div className={styles.contentGrid}>
        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <span className={styles.sectionTitle}>Cabinet Status</span>
            <span className={styles.sectionBadge}>{cabinets.length} units</span>
          </div>
          <div className={styles.cabGrid}>
            {cabinets.map(c => (
              <CabinetCard
                key={c.id}
                cabinet={c}
                tools={tools.filter(t => t.cabinetId === c.id)}
                activeShift={activeShifts.find(s => s.cabinetId === c.id) ?? null}
              />
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <span className={styles.sectionTitle}>Recent Activity</span>
            <span className={styles.sectionBadge}>live</span>
          </div>
          <div className={styles.feed}>
            {recent.length === 0 ? (
              <div style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '.8rem' }}>
                {loading ? 'Loading…' : 'No activity recorded yet.'}
              </div>
            ) : recent.map(act => {
              const isReturn = act.type === 'TOOL_RETURNED'
              const isDoor   = act.type === 'DOOR_OPENED' || act.type === 'DOOR_CLOSED'
              return (
                <div
                  key={act.id}
                  className={`${styles.feedItem} ${isReturn ? styles.feedReturn : isDoor ? styles.feedShift : ''}`}
                >
                  <div className={`${styles.feedDot} ${isReturn ? styles.dotClear : styles.dotAmber}`} />
                  <div className={styles.feedBody}>
                    <span className={styles.feedDesc}>{describeActivity(act)}</span>
                  </div>
                  <span className={styles.feedTime}>{relTime(act.timestamp)}</span>
                </div>
              )
            })}
          </div>
        </section>
      </div>
    </div>
  )
}
