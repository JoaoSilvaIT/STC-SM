import { useEffect, useState } from 'react'
import { Wifi, WifiOff, Wrench, Play, Lock, Unlock, Plus, Pencil } from 'lucide-react'
import { createCabinet, listCabinets, updateCabinet } from '@/api/cabinets'
import { listTools } from '@/api/tools'
import { listShifts } from '@/api/shifts'
import { ApiError } from '@/api/client'
import CabinetDrawer from '@/components/ui/CabinetDrawer'
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
  const avail = tools.filter(t => t.status === 'AVAILABLE').length
  const inUse = tools.filter(t => t.status === 'IN_USE').length
  const miss  = tools.filter(t => t.status === 'MISSING').length
  const maint = tools.filter(t => t.status === 'MAINTENANCE').length
  const total = tools.length
  const isOnline = cabinet.status === 'ONLINE'

  return (
    <div className={`${styles.panel}
      ${cabinet.status === 'OFFLINE'     ? styles.panelOffline  : ''}
      ${cabinet.status === 'MAINTENANCE' ? styles.panelMaint    : ''}
      ${miss > 0                         ? styles.panelMissing  : ''}
      ${!cabinet.isActive                ? styles.panelInactive : ''}
    `}>

      <div className={styles.panelHead}>
        <div className={styles.panelHeadLeft}>
          <div className={`${styles.statusDot}
            ${cabinet.status === 'ONLINE'      ? styles.dotOnline  : ''}
            ${cabinet.status === 'OFFLINE'     ? styles.dotOffline : ''}
            ${cabinet.status === 'MAINTENANCE' ? styles.dotMaint   : ''}
          `} />
          <div>
            <div className={styles.cabId}>{cabinet.name}</div>
            <div className={styles.cabLoc}>{cabinet.location}</div>
          </div>
        </div>
        <div className={styles.panelActions}>
          <button className={styles.editBtn} onClick={onEdit} title="Edit cabinet">
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
          ${cabinet.status === 'ONLINE'      ? styles.badgeOnline  : ''}
          ${cabinet.status === 'OFFLINE'     ? styles.badgeOffline : ''}
          ${cabinet.status === 'MAINTENANCE' ? styles.badgeMaint   : ''}
        `}>
          {cabinet.status === 'ONLINE'      && <Wifi     size={10} />}
          {cabinet.status === 'OFFLINE'     && <WifiOff  size={10} />}
          {cabinet.status === 'MAINTENANCE' && <Wrench   size={10} />}
          {cabinet.status}
        </span>
        {miss > 0 && (
          <span className={styles.missAlert}>⚠ {miss} MISSING</span>
        )}
      </div>

      {isOnline && total > 0 && (
        <div className={styles.gauge}>
          <div className={styles.gaugeLabel}>
            <span className={styles.gaugeLabelText}>Tool Inventory</span>
            <span className={styles.gaugeFraction}>{avail}/{total} available</span>
          </div>
          <div className={styles.gaugeBar}>
            {avail > 0 && <div className={`${styles.gaugeSeg} ${styles.gsAvail}`} style={{ flex: avail }} />}
            {inUse > 0 && <div className={`${styles.gaugeSeg} ${styles.gsInUse}`} style={{ flex: inUse }} />}
            {miss  > 0 && <div className={`${styles.gaugeSeg} ${styles.gsMiss}`}  style={{ flex: miss  }} />}
            {maint > 0 && <div className={`${styles.gaugeSeg} ${styles.gsMaint}`} style={{ flex: maint }} />}
          </div>
          <div className={styles.gaugeLegend}>
            <span className={styles.legAvail}>{avail} Avail</span>
            <span className={styles.legInUse}>{inUse} In Use</span>
            {miss  > 0 && <span className={styles.legMiss}>{miss} Missing</span>}
            {maint > 0 && <span className={styles.legMaint}>{maint} Maint.</span>}
          </div>
        </div>
      )}

      {!isOnline && (
        <div className={styles.offlineMsg}>
          {cabinet.status === 'OFFLINE'
            ? 'Cabinet is offline. No real-time data available.'
            : 'Cabinet is under scheduled maintenance.'}
        </div>
      )}

      <div className={styles.shiftBlock}>
        {activeShift ? (
          <>
            <div className={styles.shiftLabel}>
              <Play size={10} /><span>Active Shift</span>
            </div>
            <div className={styles.shiftInfo}>
              <div className={styles.shiftRow}>
                <span className={styles.shiftKey}>Mechanic</span>
                <span className={styles.shiftVal}>{activeShift.userName ?? `User #${activeShift.userId}`}</span>
              </div>
              <div className={styles.shiftRow}>
                <span className={styles.shiftKey}>Aircraft</span>
                <span className={styles.shiftVal}>{activeShift.aircraftReg || '—'}</span>
              </div>
              <div className={styles.shiftRow}>
                <span className={styles.shiftKey}>Duration</span>
                <span className={styles.shiftVal}>{shiftDuration(activeShift.startTime)}</span>
              </div>
            </div>
          </>
        ) : (
          <div className={styles.noShift}>
            <Lock size={11} /><span>No active shift — cabinet locked</span>
          </div>
        )}
      </div>

    </div>
  )
}

export default function Cabinets() {
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
        if (cancelled) return
        setCabinets(c); setTools(t); setShifts(s)
      })
      .catch(err => {
        if (cancelled) return
        setLoadError(err instanceof ApiError ? err.message : 'Failed to load cabinets')
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  const online  = cabinets.filter(c => c.status === 'ONLINE' && c.isActive).length
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
      await updateCabinet(id, 'MAINTENANCE')
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
          <h1 className={styles.pageTitle}>Cabinet Status</h1>
          <p className={styles.pageSubtitle}>
            {online}/{cabinets.filter(c => c.isActive).length} online
            {missing > 0 ? ` · ${missing} tools missing` : ' · all tools accounted for'}
          </p>
        </div>
        <button className={styles.addBtn} onClick={() => setDrawerMode('create')}>
          <Plus size={13} /> Add Cabinet
        </button>
      </div>

      <div className={styles.legend}>
        <span className={styles.legItem}><span className={`${styles.legDot} ${styles.ldGreen}`}  /> Online</span>
        <span className={styles.legItem}><span className={`${styles.legDot} ${styles.ldAmber}`} /> Maintenance</span>
        <span className={styles.legItem}><span className={`${styles.legDot} ${styles.ldGray}`}  /> Offline</span>
        <span className={styles.legItem}><span className={`${styles.legDot} ${styles.ldRed}`}   /> Missing tools</span>
      </div>

      {loading ? (
        <div className={styles.legend}>Loading cabinets…</div>
      ) : loadError ? (
        <div className={styles.legend} style={{ color: 'var(--color-danger, #c00)' }}>{loadError}</div>
      ) : (
        <div className={styles.grid}>
          {cabinets.filter(c => c.isActive).map(cab => (
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
