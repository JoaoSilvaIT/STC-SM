import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { TFunction } from 'i18next'
import { Wrench, Package, AlertTriangle, Play } from 'lucide-react'
import { listCabinets } from '@/api/cabinets'
import { listTools } from '@/api/tools'
import { listShifts } from '@/api/shifts'
import { listActivities } from '@/api/activities'
import { ApiError } from '@/api/client'
import type { Activity, Cabinet, Shift, Tool } from '@/types/domain'
import styles from './Dashboard.module.css'

function relTime(iso: string, t: TFunction): string {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (mins < 1)  return t('dashboard.time.justNow')
  if (mins < 60) return t('dashboard.time.minsAgo', { count: mins })
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)  return t('dashboard.time.hoursAgo', { count: hrs })
  return t('dashboard.time.daysAgo', { count: Math.floor(hrs / 24) })
}

function describeActivity(act: Activity, t: TFunction): string {
  const cab = act.cabinetName ?? (act.cabinetId ? `CAB-${String(act.cabinetId).padStart(3, '0')}` : '—')
  const toolName = act.toolName ?? (act.toolId != null ? `Tool #${act.toolId}` : t('common.tool'))
  switch (act.type) {
    case 'OPEN_CABINET':        return t('dashboard.activity.openCabinet', { cab })
    case 'CLOSE_CABINET':       return t('dashboard.activity.closeCabinet', { cab })
    case 'REMOVE_TOOL':         return t('dashboard.activity.removeTool', { tool: toolName, cab })
    case 'RETURN_TOOL':         return t('dashboard.activity.returnTool', { tool: toolName, cab })
    case 'TOOL_BROKEN':         return t('dashboard.activity.toolBroken', { tool: toolName, cab })
    case 'TOOL_MISSING':        return t('dashboard.activity.toolMissing', { tool: toolName, cab })
    case 'TOOL_IN_MAINTENANCE': return t('dashboard.activity.toolMaintenance', { tool: toolName })
    case 'CABINET_ANOMALY':     return t('dashboard.activity.cabinetAnomaly', { cab })
    case 'CABINET_BROKEN':      return t('dashboard.activity.cabinetBroken', { cab })
    case 'STARTED_SHIFT':       return t('dashboard.activity.shiftStarted', { cab })
    case 'ENDED_SHIFT':         return t('dashboard.activity.shiftEnded', { cab })
    default:                    return t('dashboard.activity.default', { cab })
  }
}

interface CabinetCardProps {
  cabinet:     Cabinet
  tools:       Tool[]
  activeShift: Shift | null
}

function CabinetCard({ cabinet, tools, activeShift }: CabinetCardProps) {
  const { t } = useTranslation()
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
          {t(`status.${cabinet.status}`)}
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
            <span className={styles.countAvail}>{avail}<em>{t('dashboard.storedTools')}</em></span>
            <span className={styles.countInUse}>{inUse}<em>{t('dashboard.inUseTools')}</em></span>
            {miss > 0 && <span style={{ color: 'var(--risk, #d33)' }}>{miss}<em>M</em></span>}
          </div>
        </>
      )}

      <div className={styles.cabFooter}>
        {activeShift ? (
          <div className={styles.shiftRow}>
            <Play size={10} />
            <span>{activeShift.userName ?? `User #${activeShift.userId}`}</span>
          </div>
        ) : (
          <span className={styles.noShift}>{t('dashboard.noActiveShift')}</span>
        )}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { t } = useTranslation()
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

    const handleCabinetsUpdate = () => {
      listCabinets()
          .then(c => { if (!cancelled) setCabinets(c) })
          .catch(console.error)
    }

    const handleToolsUpdate = () => {
      listTools()
          .then(t => { if (!cancelled) setTools(t) })
          .catch(console.error)
    }

    const handleShiftsUpdate = () => {
      listShifts()
          .then(s => {
            if (!cancelled) setShifts(s)
          })
          .catch(console.error)
    }

    const handleActivitiesUpdate = () => {
      listActivities()
            .then(a => {
              if (!cancelled) setActivities(a)
            })
            .catch(console.error)
    }

    window.addEventListener('cabinets-updated', handleCabinetsUpdate)
    window.addEventListener('tools-updated', handleToolsUpdate)
    window.addEventListener('shifts-updated', handleShiftsUpdate)
    window.addEventListener('activities-updated', handleActivitiesUpdate)

    return () => {
      cancelled = true
      window.removeEventListener('cabinets-updated', handleCabinetsUpdate)
      window.removeEventListener('tools-updated', handleToolsUpdate)
      window.removeEventListener('shifts-updated', handleShiftsUpdate)
      window.removeEventListener('activities-updated', handleActivitiesUpdate)
    };
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
          <h1 className={styles.pageTitle}>{t('dashboard.title')}</h1>
          <p className={styles.pageTs}>
            {loading ? t('common.loading') : loadError ? loadError : now}
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
            <span className={styles.statLabel}>{t('dashboard.toolsTracked')}</span>
            <span className={styles.statSub}>{t('dashboard.inUse', { count: inUseTools.length })}</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ '--c': 'var(--info)' } as React.CSSProperties}>
            <Play size={16} />
          </div>
          <div className={styles.statBody}>
            <span className={styles.statVal}>{activeShifts.length}</span>
            <span className={styles.statLabel}>{t('dashboard.activeShifts')}</span>
            <span className={styles.statSub}>{t('dashboard.totalShifts', { count: shifts.length })}</span>
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
            <span className={styles.statLabel}>{t('dashboard.missingTools')}</span>
            <span className={styles.statSub}>{missingTools.length === 0 ? t('dashboard.allAccounted') : t('dashboard.fodRisk')}</span>
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
            <span className={styles.statLabel}>{t('dashboard.cabinetsOnline')}</span>
            <span className={styles.statSub}>
              {t('dashboard.offlineMaint', { count: cabinets.filter(c => !['OPEN', 'CLOSED'].includes(c.status)).length })}
            </span>
          </div>
        </div>
      </div>

      <div className={styles.contentGrid}>
        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <span className={styles.sectionTitle}>{t('dashboard.cabinetStatus')}</span>
            <span className={styles.sectionBadge}>{t('dashboard.units', { count: cabinets.length })}</span>
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
            <span className={styles.sectionTitle}>{t('dashboard.recentActivity')}</span>
            <span className={styles.badgeLive}>{t('dashboard.live')}</span>
          </div>
          <div className={styles.feed}>
            {recent.length === 0 ? (
              <div style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '.8rem' }}>
                {loading ? t('common.loading') : t('dashboard.noActivity')}
              </div>
            ) : recent.map(act => {
              const isReturn = act.type === 'RETURN_TOOL'
              const isDoor   = act.type === 'OPEN_CABINET' || act.type === 'CLOSE_CABINET'
              return (
                <div
                  key={act.id}
                  className={`${styles.feedItem} ${isReturn ? styles.feedReturn : isDoor ? styles.feedShift : ''}`}
                >
                  <div className={`${styles.feedDot} ${isReturn ? styles.dotClear : styles.dotNeonGreen}`} />
                  <div className={styles.feedBody}>
                    <span className={styles.feedDesc}>{describeActivity(act, t)}</span>
                  </div>
                  <span className={styles.feedTime}>{relTime(act.timestamp, t)}</span>
                </div>
              )
            })}
          </div>
        </section>
      </div>
    </div>
  )
}
