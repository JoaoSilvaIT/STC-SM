import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { TFunction } from 'i18next'
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
    date: d.toLocaleDateString('en-CA', { timeZone: 'Europe/Lisbon' }),
    time: d.toLocaleTimeString('pt-PT', {
      timeZone: 'Europe/Lisbon',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }),
  }
}

function relTime(iso: string, t: TFunction): string {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (mins < 1)  return t('dashboard.time.justNow')
  if (mins < 60) return t('dashboard.time.minsAgo', { count: mins })
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)  return t('dashboard.time.hoursAgo', { count: hrs })
  return t('dashboard.time.daysAgo', { count: Math.floor(hrs / 24) })
}

const TYPE_META: Record<ActivityType, { label: string; icon: React.ElementType; color: string }> = {
  OPEN_CABINET:         { label: 'activity.type.OPEN_CABINET',        icon: Unlock,        color: 'clear'   },
  CLOSE_CABINET:        { label: 'activity.type.CLOSE_CABINET',       icon: Lock,          color: 'muted'   },
  REMOVE_TOOL:          { label: 'activity.type.REMOVE_TOOL',         icon: Wrench,        color: 'info'    },
  RETURN_TOOL:          { label: 'activity.type.RETURN_TOOL',         icon: Wrench,        color: 'clear'   },
  TOOL_BROKEN:          { label: 'activity.type.TOOL_BROKEN',         icon: AlertTriangle, color: 'risk'    },
  TOOL_MISSING:         { label: 'activity.type.TOOL_MISSING',        icon: Search,        color: 'risk'    },
  TOOL_IN_MAINTENANCE:  { label: 'activity.type.TOOL_IN_MAINTENANCE', icon: Settings,      color: 'amber'   },
  CABINET_ANOMALY:      { label: 'activity.type.CABINET_ANOMALY',     icon: Siren,         color: 'risk'    },
  STARTED_SHIFT:        { label: 'activity.type.STARTED_SHIFT',       icon: Play,          color: 'clear'   },
  ENDED_SHIFT:          { label: 'activity.type.ENDED_SHIFT',         icon: Square,        color: 'muted'   },
  CABINET_BROKEN:       { label: 'activity.type.CABINET_BROKEN',      icon: AlertTriangle, color: 'risk'    },
}

function ActivityRow({ act, index }: { act: Activity; index: number }) {
  const { t } = useTranslation()
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
        <span className={styles.timeRel}>{relTime(act.timestamp, t)}</span>
      </td>
      <td className={styles.tdType}>
        <span className={`${styles.typeBadge} ${styles[`type_${meta.color}`]}`}>
          <Icon size={11} />
          {t(meta.label)}
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
  const { t } = useTranslation()
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
          <h1 className={styles.pageTitle}>{t('activity.title')}</h1>
          <p className={styles.pageSubtitle}>
            {loading
              ? t('activity.loading')
              : loadError
                ? loadError
                : t('activity.subtitle', { count: activities.length })}
          </p>
        </div>
        <div className={styles.headRight}>
          {missCount > 0 && (
            <div className={styles.missBadge}>
              <AlertTriangle size={12} />
              {t('activity.fodEvents', { count: missCount })}
            </div>
          )}
          <div className={styles.immutableNote}>
            <span className={styles.immutableDot} />
            {t('activity.readonly')}
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
          <option value="ALL">{t('activity.allTypes')}</option>
          {(Object.keys(TYPE_META) as ActivityType[]).map(ty => (
            <option key={ty} value={ty}>{t(TYPE_META[ty].label)}</option>
          ))}
        </select>

        <select
          className={styles.select}
          value={cabinetF}
          onChange={e => setCabinetF(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
        >
          <option value="ALL">{t('activity.allCabinets')}</option>
          {cabinets.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <span className={styles.filterCount}>
          {t('activity.records', { count: filtered.length })}
        </span>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>{t('activity.colSeq')}</th>
              <th>{t('activity.colTimestamp')}</th>
              <th>{t('activity.colType')}</th>
              <th>{t('activity.colCabinet')}</th>
              <th>{t('activity.colTool')}</th>
              <th>{t('activity.colOperator')}</th>
              <th>{t('activity.colNotes')}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((act, i) => (
              <ActivityRow key={act.id} act={act} index={i} />
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className={styles.empty}>
                  {loading ? t('common.loading') : t('activity.noMatch')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className={styles.footer}>
        {t('activity.footer', { shown: filtered.length, total: activities.length })}
      </div>
    </div>
  )
}
