import { useEffect, useState } from 'react'
import { Play, CheckCircle2, Clock, Package, User, Square, AlertTriangle } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { listShifts, startShift, endShift } from '@/api/shifts'
import { listCabinets } from '@/api/cabinets'
import { ApiError } from '@/api/client'
import ShiftDrawer from '@/components/ui/ShiftDrawer'
import type { Cabinet, Shift } from '@/types/domain'
import styles from './Shifts.module.css'

function formatDuration(start: string, end: string | null): string {
  const ms   = (end ? new Date(end).getTime() : Date.now()) - new Date(start).getTime()
  const mins = Math.floor(ms / 60000)
  const h    = Math.floor(mins / 60)
  const m    = mins % 60
  return h > 0 ? `${h}h ${m.toString().padStart(2, '0')}m` : `${m}m`
}

function formatTime(iso: string): string {
  return new Date(iso).toISOString().replace('T', ' ').slice(0, 16) + ' UTC'
}

interface ShiftCardProps {
  shift:          Shift
  currentUserId:  number
  isBackOffice:        boolean
  isConfirming:   boolean
  onRequestEnd:   () => void
  onConfirmEnd:   () => void
  onCancelEnd:    () => void
}

function ShiftCard({
                     shift, currentUserId, isBackOffice,
                     isConfirming, onRequestEnd, onConfirmEnd, onCancelEnd,
                   }: ShiftCardProps) {
  const userName    = shift.userName    ?? `User #${shift.userId}`
  const cabinetName = shift.cabinetName ?? `Cabinet #${shift.cabinetId}`
  const isActive    = shift.status === 'ACTIVE'
  const canEnd      = isActive && (isBackOffice || shift.userId === currentUserId)

  return (
      <div className={styles.card}>
      <div
          className={`${styles.statusDot} ${isActive ? styles.dotActive : styles.dotInactive}`}
          title={isActive ? 'Active Shift' : 'Inactive Shift'}
      />

      <div className={styles.cardHead}>
      <div className={styles.cardHeadLeft}>
        <div>
          <div className={styles.shiftId}>SHIFT-{shift.id.toString().padStart(3, '0')}</div>
        </div>
      </div>
    </div>

    <div className={styles.metaGrid}>
      <div className={styles.metaItem}>
        <User size={11} className={styles.metaIcon} />
        <div>
          <span className={styles.metaKey}>Mechanic</span>
          <span className={styles.metaVal}>{userName}</span>
        </div>
      </div>
      <div className={styles.metaItem}>
        <Package size={11} className={styles.metaIcon} />
        <div>
          <span className={styles.metaKey}>Cabinet</span>
          <span className={styles.metaVal}>{cabinetName}</span>
        </div>
      </div>
      <div className={styles.metaItem}>
        <Clock size={11} className={styles.metaIcon} />
        <div>
          <span className={styles.metaKey}>Duration</span>
          <span className={`${styles.metaVal} ${isActive ? styles.metaValActive : ''}`}>
              {formatDuration(shift.startTime, shift.endTime)}
            </span>
          <span className={styles.metaSub}>{isActive ? 'ongoing' : 'inactive'}</span>
        </div>
      </div>
    </div>

    <div className={styles.timeline}>
      <div className={styles.timelineRow}>
        <span className={styles.tlKey}>Start</span>
        <span className={styles.tlVal}>{formatTime(shift.startTime)}</span>
      </div>
      {shift.endTime && (
          <div className={styles.timelineRow}>
            <span className={styles.tlKey}>End</span>
            <span className={styles.tlVal}>{formatTime(shift.endTime)}</span>
          </div>
      )}
    </div>

    {canEnd && (
        <div className={styles.endZone}>
          {isConfirming ? (
              <div className={styles.endConfirm}>
                <AlertTriangle size={12} className={styles.endConfirmIcon} />
                <span className={styles.endConfirmText}>
                End shift for {shift.aircraftReg || cabinetName}? This locks {cabinetName}.
              </span>
                <button className={styles.endConfirmYes} onClick={onConfirmEnd}>Confirm</button>
                <button className={styles.endConfirmNo}  onClick={onCancelEnd}>Cancel</button>
              </div>
          ) : (
              <button className={styles.endBtn} onClick={onRequestEnd}>
                <Square size={11} /> End Shift
              </button>
          )}
        </div>
    )}
  </div>
)
}

export default function Shifts() {
  const { user } = useAuth()
  const [shifts,       setShifts]       = useState<Shift[]>([])
  const [cabinets,     setCabinets]     = useState<Cabinet[]>([])
  const [loading,      setLoading]      = useState(true)
  const [loadError,    setLoadError]    = useState<string | null>(null)
  const [actionError,  setActionError]  = useState<string | null>(null)
  const [drawerOpen,   setDrawerOpen]   = useState(false)
  const [confirmEndId, setConfirmEndId] = useState<number | null>(null)

  const refresh = async () => {
    const [s, c] = await Promise.all([listShifts(user?.id), listCabinets()])
    setShifts(s)
    setCabinets(c)
  }

  useEffect(() => {
    let cancelled = false
    refresh()
        .catch(err => {
          if (cancelled) return
          setLoadError(err instanceof ApiError ? err.message : 'Failed to load shifts')
        })
        .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  const active   = shifts.filter(s => s.status === 'ACTIVE')
  const inactive = shifts.filter(s => s.status === 'INACTIVE') // Renomeado de completed para inactive
  const isBackOffice = user?.role === 'BACK_OFFICE'

  const handleStartShift = async (data: { cabinetId: number; aircraftReg: string }) => {
    setActionError(null)
    if (!user) { setActionError('Not authenticated'); return }
    try {
      await startShift({ userId: user.id, cabinetId: data.cabinetId })
      await refresh()
      setDrawerOpen(false)
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : 'Failed to start shift')
    }
  }

  const handleEndShift = async (id: number) => {
    setActionError(null)
    try {
      await endShift(id)
      await refresh()
      setConfirmEndId(null)
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : 'Failed to end shift')
    }
  }

  return (
      <div className={styles.page}>
        <div className={styles.pageHead}>
          <div>
            <h1 className={styles.pageTitle}>Shift Management</h1>
            <p className={styles.pageSubtitle}>
              {loading
                  ? 'Loading shifts…'
                  : loadError
                      ? loadError
                      : `${shifts.length} total mechanics · ${active.length} active · ${inactive.length} inactive`}
            </p>

            {!loading && !loadError && (
                <div className={styles.legend}>
                  <div className={styles.legendItem}>
                    <span className={`${styles.statusDot} ${styles.dotActive}`} style={{ position: 'static' }} />
                    <span>Clocked In</span>
                  </div>
                  <div className={styles.legendItem}>
                    <span className={`${styles.statusDot} ${styles.dotInactive}`} style={{ position: 'static' }} />
                    <span>Clocked Out</span>
                  </div>
                </div>
            )}
          </div>
        </div>

        {actionError && (
            <div className={styles.empty} style={{ color: 'var(--color-danger, #c00)' }}>{actionError}</div>
        )}

        <div className={styles.section}>
          <div className={styles.cards}>
            {shifts.length === 0 && !loading
                ? <div className={styles.empty}>No shifts found</div>
                : shifts.map(s => (
                    <ShiftCard
                        key={s.id}
                        shift={s}
                        currentUserId={user?.id ?? 0}
                        isBackOffice={isBackOffice}
                        isConfirming={confirmEndId === s.id}
                        onRequestEnd={() => setConfirmEndId(s.id)}
                        onConfirmEnd={() => handleEndShift(s.id)}
                        onCancelEnd={() => setConfirmEndId(null)}
                    />
                ))
            }
          </div>
        </div>

        <ShiftDrawer
            open={drawerOpen}
            currentUser={user!}
            cabinets={cabinets}
            activeShifts={active}
            onSave={handleStartShift}
            onClose={() => setDrawerOpen(false)}
        />
      </div>
  )
}
