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
  isAdmin:        boolean
  isConfirming:   boolean
  onRequestEnd:   () => void
  onConfirmEnd:   () => void
  onCancelEnd:    () => void
}

function ShiftCard({
  shift, currentUserId, isAdmin,
  isConfirming, onRequestEnd, onConfirmEnd, onCancelEnd,
}: ShiftCardProps) {
  const userName    = shift.userName    ?? `User #${shift.userId}`
  const cabinetName = shift.cabinetName ?? `Cabinet #${shift.cabinetId}`
  const isActive    = shift.status === 'ACTIVE'
  const canEnd      = isActive && (isAdmin || shift.userId === currentUserId)

  return (
    <div className={`${styles.card} ${isActive ? styles.cardActive : styles.cardDone}`}>
      <div className={styles.cardHead}>
        <div className={styles.cardHeadLeft}>
          <div className={`${styles.statusLed} ${isActive ? styles.ledActive : styles.ledDone}`} />
          <div>
            <div className={styles.shiftId}>SHIFT-{shift.id.toString().padStart(3, '0')}</div>
            <div className={styles.aircraftReg}>{shift.aircraftReg || '—'}</div>
          </div>
        </div>
        <span className={`${styles.statusTag} ${isActive ? styles.tagActive : styles.tagDone}`}>
          {isActive ? <Play size={10} /> : <CheckCircle2 size={10} />}
          {isActive ? 'ACTIVE' : 'COMPLETED'}
        </span>
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
            <span className={styles.metaSub}>{isActive ? 'ongoing' : 'completed'}</span>
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

  const active    = shifts.filter(s => s.status === 'ACTIVE')
  const completed = shifts.filter(s => s.status === 'COMPLETED')
  const isAdmin   = user?.role === 'ADMIN'

  const myActiveShift = shifts.find(s => s.userId === user?.id && s.status === 'ACTIVE')
  const canStartShift = isAdmin || !myActiveShift

  const handleStartShift = async (data: { cabinetId: number; aircraftReg: string }) => {
    setActionError(null)
    if (!user) { setActionError('Not authenticated'); return }
    try {
      // aircraftReg is not yet supported by the backend; the field is preserved
      // in the drawer but not transmitted.
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
                : `${active.length} active · ${completed.length} completed`}
          </p>
        </div>
        <div className={styles.headRight}>
          <div className={styles.rule}>
            <span className={styles.ruleLabel}>Shift Locking Rule</span>
            <span className={styles.ruleText}>One mechanic per cabinet · Cabinet locked without active shift</span>
          </div>
          {canStartShift && (
            <button className={styles.startBtn} onClick={() => setDrawerOpen(true)}>
              <Play size={13} />
              Start Shift
            </button>
          )}
        </div>
      </div>

      {actionError && (
        <div className={styles.empty} style={{ color: 'var(--color-danger, #c00)' }}>{actionError}</div>
      )}

      <div className={styles.section}>
        <div className={styles.sectionHead}>
          <div className={styles.sectionTitle}>
            <span className={styles.activeLed} />
            Active Shifts
          </div>
          <span className={styles.sectionCount}>{active.length}</span>
        </div>
        <div className={styles.cards}>
          {active.length === 0
            ? <div className={styles.empty}>No active shifts</div>
            : active.map(s => (
                <ShiftCard
                  key={s.id}
                  shift={s}
                  currentUserId={user?.id ?? 0}
                  isAdmin={isAdmin}
                  isConfirming={confirmEndId === s.id}
                  onRequestEnd={() => setConfirmEndId(s.id)}
                  onConfirmEnd={() => handleEndShift(s.id)}
                  onCancelEnd={() => setConfirmEndId(null)}
                />
              ))
          }
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHead}>
          <div className={styles.sectionTitle}>
            <CheckCircle2 size={13} />
            Completed Shifts
          </div>
          <span className={styles.sectionCount}>{completed.length}</span>
        </div>
        <div className={styles.cards}>
          {completed.length === 0
            ? <div className={styles.empty}>No completed shifts</div>
            : completed.map(s => (
                <ShiftCard
                  key={s.id}
                  shift={s}
                  currentUserId={user?.id ?? 0}
                  isAdmin={isAdmin}
                  isConfirming={false}
                  onRequestEnd={() => {}}
                  onConfirmEnd={() => {}}
                  onCancelEnd={() => {}}
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
