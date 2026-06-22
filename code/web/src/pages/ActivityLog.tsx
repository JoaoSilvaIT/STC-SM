import { useEffect, useMemo, useState } from 'react'
import { Unlock, Lock, Wrench, AlertTriangle, Search, Settings,
  Siren, Play, Square, Filter} from 'lucide-react'
import { listActivities } from '@/api/activities'
import { listCabinets } from '@/api/cabinets'
import { ApiError } from '@/api/client'
import type { Activity, ActivityType, Cabinet } from '@/types/domain'
import styles from './ActivityLog.module.css'

function formatTs(iso: string): { date: string; time: string } {
  const d = new Date(iso)
  return {
    date: d.toISOString().slice(0, 10),
    time: d.toISOString().slice(11, 19),
  }
}

function relTime(iso: string): string {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (mins < 1)  return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)  return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

const TYPE_META: Record<ActivityType, { label: string; icon: React.ElementType; color: string }> = {
  OPEN_CABINET:         { label: 'Opened Cabinet',      icon: Unlock,        color: 'clear'   },
  CLOSE_CABINET:        { label: 'Closed Cabinet',      icon: Lock,          color: 'muted'   },
  REMOVE_TOOL:          { label: 'Removed Tool',        icon: Wrench,        color: 'info'    },
  RETURN_TOOL:          { label: 'Returned Tool',       icon: Wrench,        color: 'clear'   },
  TOOL_BROKEN:          { label: 'Broken Tool',         icon: AlertTriangle, color: 'risk'    },
  TOOL_MISSING:         { label: 'Missing Tool',        icon: Search,        color: 'risk'    },
  TOOL_IN_MAINTENANCE:  { label: 'Tool in Maintenance', icon: Settings,      color: 'amber'   },
  CABINET_ANOMALY:      { label: 'Cabinet Anomaly',     icon: Siren,         color: 'risk'    },
  STARTED_SHIFT:        { label: 'Started Shift',       icon: Play,          color: 'clear'   },
  ENDED_SHIFT:          { label: 'Ended Shift',         icon: Square,        color: 'muted'   },
  CABINET_BROKEN:       { label: 'Broken Tool',         icon: AlertTriangle, color: 'risk'    },
}

function ActivityRow({ act, index }: { act: Activity; index: number }) {
  const meta   = TYPE_META[act.type]
  const Icon   = meta.icon
  const ts     = formatTs(act.timestamp)
  const isCrit = act.type === 'TOOL_MISSING'

  return (
    <tr
      className={`${styles.row} ${isCrit ? styles.rowCrit : ''}`}
      style={{ animationDelay: `${index * 0.02}s` }}
    >
      <td className={styles.tdSeq}>
        <span className={styles.seqNum}>#{act.id.toString().padStart(4, '0')}</span>
      </td>
      <td className={styles.tdTime}>
        <span className={styles.timeHms}>{ts.time}</span>
        <span className={styles.timeDate}>{ts.date}</span>
        <span className={styles.timeRel}>{relTime(act.timestamp)}</span>
      </td>
      <td className={styles.tdType}>
        <span className={`${styles.typeBadge} ${styles[`type_${meta.color}`]}`}>
          <Icon size={11} />
          {meta.label}
        </span>
      </td>
      <td className={styles.tdCabinet}>
        <span className={styles.cabName}>{act.cabinetName ?? (act.cabinetId ? `Cabinet #${act.cabinetId}` : '—')}</span>
      </td>
      <td className={styles.tdTool}>
        {act.toolName
          ? <span className={`${styles.toolName} ${isCrit ? styles.toolNameCrit : ''}`}>{act.toolName}</span>
          : <span className={styles.na}>—</span>
        }
      </td>
      <td className={styles.tdUser}>
        <span className={styles.userName}>{act.userName ?? `User #${act.userId}`}</span>
      </td>
      <td className={styles.tdNotes}>
        <span className={styles.na}>—</span>
      </td>
    </tr>
  )
}

export default function ActivityLog() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [cabinets,   setCabinets]   = useState<Cabinet[]>([])
  const [loading,    setLoading]    = useState(true)
  const [loadError,  setLoadError]  = useState<string | null>(null)
  const [typeF,      setTypeF]      = useState<ActivityType | 'ALL'>('ALL')
  const [cabinetF,   setCabinetF]   = useState<number | 'ALL'>('ALL')

  useEffect(() => {
    let cancelled = false

    Promise.all([listActivities(), listCabinets()])
        .then(([a, c]) => {
          if (!cancelled) {
            setActivities(a)
            setCabinets(c)
          }
        })
        .catch(err => {
          if (cancelled) return
          setLoadError(err instanceof ApiError ? err.message : 'Failed to load activity log')
        })
        .finally(() => {
          if (!cancelled) setLoading(false)
        })

    const handleActivitiesUpdate = () => {
      listActivities()
          .then(a => { if (!cancelled) setActivities(a) })
          .catch(console.error)
    }

    window.addEventListener('activities-updated', handleActivitiesUpdate)

    return () => {
      cancelled = true
      window.removeEventListener('activities-updated', handleActivitiesUpdate)
    }
  }, [])

  const filtered = useMemo(() =>
    activities.filter(a => {
      if (typeF    !== 'ALL' && a.type      !== typeF)     return false
      if (cabinetF !== 'ALL' && a.cabinetId !== cabinetF)  return false
      return true
    }),
  [activities, typeF, cabinetF])

  const missCount = activities.filter(a => a.type === 'TOOL_MISSING').length

  return (
    <div className={styles.page}>
      <div className={styles.pageHead}>
        <div>
          <h1 className={styles.pageTitle}>Activity Log</h1>
          <p className={styles.pageSubtitle}>
            {loading
              ? 'Loading activity log…'
              : loadError
                ? loadError
                : `Immutable audit trail · ${activities.length} record${activities.length !== 1 ? 's' : ''} · append-only`}
          </p>
        </div>
        <div className={styles.headRight}>
          {missCount > 0 && (
            <div className={styles.missBadge}>
              <AlertTriangle size={12} />
              {missCount} FOD event{missCount !== 1 ? 's' : ''} recorded
            </div>
          )}
          <div className={styles.immutableNote}>
            <span className={styles.immutableDot} />
            Audit log is read-only
          </div>
        </div>
      </div>

      <div className={styles.filters}>
        <Filter size={13} className={styles.filterIcon} />
        <select
          className={styles.select}
          value={typeF}
          onChange={e => setTypeF(e.target.value as ActivityType | 'ALL')}
        >
          <option value="ALL">All Event Types</option>
          {(Object.keys(TYPE_META) as ActivityType[]).map(t => (
            <option key={t} value={t}>{TYPE_META[t].label}</option>
          ))}
        </select>

        <select
          className={styles.select}
          value={cabinetF}
          onChange={e => setCabinetF(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
        >
          <option value="ALL">All Cabinets</option>
          {cabinets.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <span className={styles.filterCount}>
          {filtered.length} record{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Seq.</th>
              <th>Timestamp (UTC)</th>
              <th>Event Type</th>
              <th>Cabinet</th>
              <th>Tool</th>
              <th>Operator</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((act, i) => (
              <ActivityRow key={act.id} act={act} index={i} />
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className={styles.empty}>
                  {loading ? 'Loading…' : 'No records match the current filters'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className={styles.footer}>
        Showing {filtered.length} of {activities.length} records — log is append-only per aviation safety protocol
      </div>
    </div>
  )
}
