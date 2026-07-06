import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Play, Lock, Unlock, Plus, Pencil, Settings } from 'lucide-react'
import { createCabinet, listCabinets, updateCabinet } from '@/api/cabinets'
import { listTools } from '@/api/tools'
import { listShifts } from '@/api/shifts'
import { ApiError } from '@/api/client'
import CabinetDrawer from '@/components/ui/CabinetDrawer'
import { useAuth } from '@/context/AuthContext'
import type { Cabinet, CabinetStatus, Shift, Tool } from '@/types/domain'
import styles from './Cabinets.module.css'

function shiftDuration(iso: string): string {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  const h    = Math.floor(mins / 60)
  const m    = mins % 60
  return h > 0 ? `${h}h ${m.toString().padStart(2, '0')}m` : `${m}m`
}

interface CabinetPanelProps {
  cabinet:     Cabinet
  tools:       Tool[]
  activeShift: Shift | null
  onEdit:      () => void
}

function CabinetPanel({ cabinet, tools, activeShift, onEdit }: CabinetPanelProps) {
  const { t } = useTranslation()
  const avail = tools.filter(t => t.status === 'AVAILABLE').length
  const inUse = tools.filter(t => t.status === 'IN_USE').length
  const miss  = tools.filter(t => t.status === 'MISSING').length
  const maint = tools.filter(t => t.status === 'IN_MAINTENANCE').length
  const total = tools.length

  const isOnline = cabinet.status === 'OPEN' || cabinet.status === 'CLOSED'

  return (
      <div className={`${styles.panel}
      ${cabinet.status === 'INACTIVE' ? styles.panelMaint : ''}
      ${miss > 0                      ? styles.panelMissing : ''}
    `}>

        <div className={styles.panelHead}>
          <div className={styles.panelHeadLeft}>
            <div className={`${styles.statusDot}
            ${isOnline                       ? styles.dotOnline : ''}
            ${cabinet.status === 'INACTIVE'   ? styles.dotMaint  : ''}
          `} />
            <div>
              <div className={styles.cabId}>{cabinet.name}</div>
              <div className={styles.cabLoc}>{cabinet.location}</div>
            </div>
          </div>
          <div className={styles.panelActions}>
            <button className={styles.editBtn} onClick={onEdit} title={t('cabinets.editCabinet')}>
              <Pencil size={12} />
            </button>
            <div className={styles.lockIcon}>
              {isOnline && activeShift
                  ? <Unlock size={14} className={styles.iconUnlocked} />
                  : <Lock   size={14} className={styles.iconLocked}   />
              }
            </div>
          </div>
        </div>

        <div className={styles.statusRow}>
          <span className={`${styles.statusBadge}
          ${cabinet.status === 'OPEN'       ? styles.badgeOnline : ''}
          ${cabinet.status === 'CLOSED'     ? styles.badgeClosed : ''} /* Vermelho (risk) */
          ${cabinet.status === 'INACTIVE'   ? styles.badgeMaint  : ''} /* Laranja (amber) - ALTERADO AQUI */
        `}>
            {cabinet.status === 'OPEN'     && <Unlock size={10} />}
            {cabinet.status === 'CLOSED'   && <Lock size={10} />}
            {cabinet.status === 'INACTIVE' && <Settings size={10} />}

            {t(`status.${cabinet.status}`)}
        </span>
          {miss > 0 && (
              <span className={styles.missAlert}>⚠ {t('cabinets.missing', { count: miss })}</span>
          )}
        </div>

        {isOnline && total > 0 && (
            <div className={styles.gauge}>
              <div className={styles.gaugeLabel}>
                <span className={styles.gaugeLabelText}>{t('cabinets.toolInventory')}</span>
                <span className={styles.gaugeFraction}>{t('cabinets.available', { avail, total })}</span>
              </div>
              <div className={styles.gaugeBar}>
                {avail > 0 && <div className={`${styles.gaugeSeg} ${styles.gsAvail}`} style={{ flex: avail }} />}
                {inUse > 0 && <div className={`${styles.gaugeSeg} ${styles.gsInUse}`} style={{ flex: inUse }} />}
                {miss  > 0 && <div className={`${styles.gaugeSeg} ${styles.gsMiss}`}  style={{ flex: miss  }} />}
                {maint > 0 && <div className={`${styles.gaugeSeg} ${styles.gsMaint}`} style={{ flex: maint }} />}
              </div>
              <div className={styles.gaugeLegend}>
                <span className={styles.legAvail}>{t('cabinets.legAvailable', { count: avail })} </span>
                <span className={styles.legInUse}>{t('cabinets.legInUse', { count: inUse })}</span>
                {miss  > 0 && <span className={styles.legMiss}>{t('cabinets.legMissing', { count: miss })}</span>}
                {maint > 0 && <span className={styles.legMaint}>{t('cabinets.legMaint', { count: maint })}</span>}
              </div>
            </div>
        )}

        {!isOnline && (
            <div className={styles.offlineMsg}>
              {t('cabinets.offlineMsg')}
            </div>
        )}

        <div className={styles.shiftBlock}>
          {activeShift ? (
              <>
                <div className={styles.shiftLabel}>
                  <Play size={10} /><span>{t('cabinets.activeShift')}</span>
                </div>
                <div className={styles.shiftInfo}>
                  <div className={styles.shiftRow}>
                    <span className={styles.shiftKey}>{t('cabinets.mechanic')}</span>
                    <span className={styles.shiftVal}>{activeShift.userName ?? `User #${activeShift.userId}`}</span>
                  </div>
                  <div className={styles.shiftRow}>
                    <span className={styles.shiftKey}>{t('cabinets.duration')}</span>
                    <span className={styles.shiftVal}>{shiftDuration(activeShift.startTime)}</span>
                  </div>
                </div>
              </>
          ) : (
              <div className={styles.noShift}>
                <Lock size={11} /><span>{t('cabinets.noActiveShift')}</span>
              </div>
          )}
        </div>

      </div>
  )
}

export default function Cabinets() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [cabinets,        setCabinets]        = useState<Cabinet[]>([])
  const [tools,           setTools]           = useState<Tool[]>([])
  const [shifts,          setShifts]          = useState<Shift[]>([])
  const [loading,         setLoading]         = useState(true)
  const [loadError,       setLoadError]       = useState<string | null>(null)
  const [drawerMode,      setDrawerMode]      = useState<'closed' | 'create' | 'edit'>('closed')
  const [selectedCabinet, setSelectedCabinet] = useState<Cabinet | null>(null)

  useEffect(() => {
    let cancelled = false

    Promise.all([listCabinets(), listTools(), listShifts()])
        .then(([c, t, s]) => {
          if (!cancelled) {
            setCabinets(c)
            setTools(t)
            setShifts(s)
          }
        })
        .catch(err => {
          if (cancelled) return
          setLoadError(err instanceof ApiError ? err.message : 'Failed to load cabinets')
        })
        .finally(() => {
          if (!cancelled) setLoading(false)
        })

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

    window.addEventListener('cabinets-updated', handleCabinetsUpdate)
    window.addEventListener('tools-updated', handleToolsUpdate)
    window.addEventListener('shifts-updated', handleShiftsUpdate)

    return () => {
      cancelled = true
      window.removeEventListener('cabinets-updated', handleCabinetsUpdate)
      window.removeEventListener('tools-updated', handleToolsUpdate)
      window.removeEventListener('shifts-updated', handleShiftsUpdate)
    };
  }, [])

  const cabinetsOnline = cabinets.filter(c => ['OPEN', 'CLOSED'].includes(c.status)).length
  const missing = tools.filter(t => t.status === 'MISSING').length
  const activeShifts = shifts.filter(s => s.status === 'ACTIVE')

  const handleSave = async (data: { name: string; location: string; status: CabinetStatus }) => {
    setLoadError(null)
    try {
      if (drawerMode === 'create') {
        await createCabinet(data)
      } else if (drawerMode === 'edit' && selectedCabinet) {
        await updateCabinet(selectedCabinet.id, data.status)
      }
      const [c, t, s] = await Promise.all([listCabinets(), listTools(), listShifts()])
      setCabinets(c); setTools(t); setShifts(s)
      closeDrawer()
    } catch (err) {
      setLoadError(err instanceof ApiError ? err.message : 'Failed to save cabinet')
    }
  }

  const handleDeactivate = async (id: number) => {
    setLoadError(null)
    try {
      await updateCabinet(id, 'BROKEN')
      const [c, t, s] = await Promise.all([listCabinets(), listTools(), listShifts()])
      setCabinets(c); setTools(t); setShifts(s)
      closeDrawer()
    } catch (err) {
      setLoadError(err instanceof ApiError ? err.message : 'Failed to deactivate cabinet')
    }
  }

  const openEdit = (cabinet: Cabinet) => {
    setSelectedCabinet(cabinet)
    setDrawerMode('edit')
  }

  const closeDrawer = () => {
    setDrawerMode('closed')
    setSelectedCabinet(null)
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHead}>
        <div>
          <h1 className={styles.pageTitle}>{t('cabinets.title')}</h1>
          <p className={styles.pageSubtitle}>
            {t('cabinets.online', { online: cabinetsOnline, total: cabinets.filter(c => c.status !== 'BROKEN').length })}
            {missing > 0 ? ` · ${t('cabinets.toolsMissing', { count: missing })}` : ` · ${t('cabinets.allAccounted')}`}
          </p>
        </div>
        {user?.role === 'ADMIN' && (
          <button className={styles.addBtn} onClick={() => setDrawerMode('create')}>
            <Plus size={14} />
            {t('cabinets.addCabinet')}
          </button>
        )}
      </div>

      <div className={styles.legend}>
        <span className={styles.legItem}><span className={`${styles.legDot} ${styles.ldGreen}`}  /> {t('cabinets.legendOnline')}</span>
        <span className={styles.legItem}><span className={`${styles.legDot} ${styles.ldAmber}`} /> {t('cabinets.legendMaintenance')}</span>
        <span className={styles.legItem}><span className={`${styles.legDot} ${styles.ldRed}`}   /> {t('cabinets.legendMissing')}</span>
      </div>

      {loading ? (
        <div className={styles.legend}>{t('cabinets.loading')}</div>
      ) : loadError ? (
        <div className={styles.legend} style={{ color: 'var(--color-danger, #c00)' }}>{loadError}</div>
      ) : (
        <div className={styles.grid}>
          {cabinets.filter(c => c.status != 'BROKEN')
              .map(cab => (
            <CabinetPanel
              key={cab.id}
              cabinet={cab}
              tools={tools.filter(t => t.cabinetId === cab.id)}
              activeShift={activeShifts.find(s => s.cabinetId === cab.id) ?? null}
              onEdit={() => openEdit(cab)}
            />
          ))}
        </div>
      )}

      <CabinetDrawer
        mode={drawerMode}
        cabinet={selectedCabinet}
        onSave={handleSave}
        onClose={closeDrawer}
        onDeactivate={handleDeactivate}
      />
    </div>
  )
}
