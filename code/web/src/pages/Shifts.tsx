import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Clock, Package, User, Square, AlertTriangle, Edit2, Plus } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { listShifts, endShift, editShiftHours, createShift } from '@/api/shifts'
import { listCabinets } from '@/api/cabinets'
import { listUnassignedMechanics } from '@/api/users'
import { ApiError } from '@/api/client'
import ShiftDrawer from '@/components/ui/ShiftDrawer'
import CreateShiftDrawer from '@/components/ui/CreateShiftDrawer'
import type { Cabinet, Shift, User as UserType } from '@/types/domain'
import styles from './Shifts.module.css'

function timeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number)
  return (hours * 60) + (minutes || 0)
}

function formatDuration(start: string, end: string | null): string {
  const startMins = timeToMinutes(start)
  let endMins: number

  if (end) {
    endMins = timeToMinutes(end)
  } else {
    const now = new Date()
    endMins = (now.getHours() * 60) + now.getMinutes()
  }

  let diffMins = endMins - startMins

  if (diffMins < 0) {
    diffMins += 24 * 60
  }

  const h = Math.floor(diffMins / 60)
  const m = diffMins % 60
  return h > 0 ? `${h}h ${m.toString().padStart(2, '0')}m` : `${m}m`
}

function formatTime(localTimeStr: string): string {
  return localTimeStr.slice(0, 5)
}

interface ShiftCardProps {
  shift:          Shift
  currentUserId:  number
  isBackOffice:   boolean
  isConfirming:   boolean
  onRequestEnd:   () => void
  onConfirmEnd:   () => void
  onCancelEnd:    () => void
  onEdit:         () => void
}

function ShiftCard({
                     shift, currentUserId, isBackOffice,
                     isConfirming, onRequestEnd, onConfirmEnd, onCancelEnd, onEdit
                   }: ShiftCardProps) {
  const { t } = useTranslation()
  const userName    = shift.userName    ?? `User #${shift.userId}`
  const cabinetName = shift.cabinetName ?? `Cabinet #${shift.cabinetId}`
  const isActive    = shift.status === 'ACTIVE'
  const canEnd      = isActive && (isBackOffice || shift.userId === currentUserId)

  return (
      <div className={styles.card}>
        <div
            className={`${styles.statusDot} ${isActive ? styles.dotActive : styles.dotInactive}`}
            title={isActive ? t('shifts.activeShift') : t('shifts.inactiveShift')}
        />

        <div className={styles.cardHead}>
          <div className={styles.cardHeadLeft}>
            <div>
              <div className={styles.shiftId}>SHIFT-{shift.id.toString().padStart(3, '0')}</div>
            </div>
          </div>

          {isBackOffice &&
              <button className={styles.editBtn} onClick={onEdit} title={t('shifts.editTimes')}>
                <Edit2 size={14} />
              </button>
          }
        </div>

        <div className={styles.metaGrid}>
          <div className={styles.metaItem}>
            <User size={11} className={styles.metaIcon} />
            <div>
              <span className={styles.metaKey}>{t('shifts.mechanic')}</span>
              <span className={styles.metaVal}>{userName}</span>
            </div>
          </div>
          <div className={styles.metaItem}>
            <Package size={11} className={styles.metaIcon} />
            <div>
              <span className={styles.metaKey}>{t('shifts.cabinet')}</span>
              <span className={styles.metaVal}>{cabinetName}</span>
            </div>
          </div>
          <div className={styles.metaItem}>
            <Clock size={11} className={styles.metaIcon} />
            <div>
              <span className={styles.metaKey}>{t('shifts.duration')}</span>
              <span className={`${styles.metaVal} ${isActive ? styles.metaValActive : ''}`}>
              {formatDuration(shift.startTime, shift.endTime)}
            </span>
              <span className={styles.metaSub}>{isActive ? t('shifts.ongoing') : t('shifts.inactive')}</span>
            </div>
          </div>
        </div>

        <div className={styles.timeline}>
          <div className={styles.timelineRow}>
            <span className={styles.tlKey}>{t('shifts.start')}</span>
            <span className={styles.tlVal}>{formatTime(shift.startTime)}</span>
          </div>
          {shift.endTime && (
              <div className={styles.timelineRow}>
                <span className={styles.tlKey}>{t('shifts.end')}</span>
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
                {t('shifts.endConfirm', { name: shift.aircraftReg || cabinetName, cabinet: cabinetName })}
              </span>
                    <button className={styles.endConfirmYes} onClick={onConfirmEnd}>{t('shifts.confirm')}</button>
                    <button className={styles.endConfirmNo}  onClick={onCancelEnd}>{t('shifts.cancel')}</button>
                  </div>
              ) : (
                  <button className={styles.endBtn} onClick={onRequestEnd}>
                    <Square size={11} /> {t('shifts.endShift')}
                  </button>
              )}
            </div>
        )}
      </div>
  )
}

export default function Shifts() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [shifts,       setShifts]       = useState<Shift[]>([])
  const [cabinets,     setCabinets]     = useState<Cabinet[]>([])
  const [loading,      setLoading]      = useState(true)
  const [loadError,    setLoadError]    = useState<string | null>(null)
  const [actionError,  setActionError]  = useState<string | null>(null)

  const [editingShift, setEditingShift] = useState<Shift | null>(null)
  const [confirmEndId, setConfirmEndId] = useState<number | null>(null)
  const [creating,     setCreating]     = useState(false)
  const [mechanics,    setMechanics]    = useState<UserType[]>([])

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


    const handleShiftUpdate = () => {
      refresh().catch(console.error);
    };

    window.addEventListener('shifts-updated', handleShiftUpdate);

    return () => {
      cancelled = true
      window.removeEventListener('shifts-updated', handleShiftUpdate);
    }
  }, [])

  const active   = shifts.filter(s => s.status === 'ACTIVE')
  const inactive = shifts.filter(s => s.status === 'INACTIVE')
  const isBackOffice = user?.role === 'BACK_OFFICE'

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

  const openCreate = async () => {
    setActionError(null)
    try {
      setMechanics(await listUnassignedMechanics())
    } catch (err) {
      setMechanics([])
      setActionError(err instanceof ApiError ? err.message : 'Failed to load mechanics')
    }
    setCreating(true)
  }

  const handleCreateShift = async (data: { userId: number; cabinetId: number; startTime: string; endTime: string }) => {
    setActionError(null)
    try {
      await createShift(data)
      await refresh()
      setCreating(false)
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : 'Failed to create shift')
    }
  }

  const handleUpdateShiftTimes = async (data: { startTime: string | null; endTime: string | null }) => {
    if (!editingShift) return
    setActionError(null)
    try {
      await editShiftHours(editingShift.id, data.startTime, data.endTime)
      await refresh()
      setEditingShift(null)
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : 'Failed to update shift times')
    }
  }

  return (
      <div className={styles.page}>
        <div className={styles.pageHead}>
          <div>
            <h1 className={styles.pageTitle}>{t('shifts.title')}</h1>
            <p className={styles.pageSubtitle}>
              {loading
                  ? t('shifts.loading')
                  : loadError
                      ? loadError
                      : t('shifts.subtitle', { total: shifts.length, active: active.length, inactive: inactive.length })}
            </p>

            {!loading && !loadError && (
                <div className={styles.legend}>
                  <div className={styles.legendItem}>
                    <span className={`${styles.statusDot} ${styles.dotActive}`} style={{ position: 'static' }} />
                    <span>{t('shifts.clockedIn')}</span>
                  </div>
                  <div className={styles.legendItem}>
                    <span className={`${styles.statusDot} ${styles.dotInactive}`} style={{ position: 'static' }} />
                    <span>{t('shifts.clockedOut')}</span>
                  </div>
                </div>
            )}
          </div>
          {isBackOffice && (
              <button className={styles.startBtn} onClick={openCreate}>
                <Plus size={13} /> {t('shifts.newShift')}
              </button>
          )}
        </div>

        {actionError && (
            <div className={styles.empty} style={{ color: 'var(--color-danger, #c00)' }}>{actionError}</div>
        )}

        <div className={styles.section}>
          <div className={styles.cards}>
            {shifts.length === 0 && !loading
                ? <div className={styles.empty}>{t('shifts.noShifts')}</div>
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
                        onEdit={() => setEditingShift(s)}
                    />
                ))
            }
          </div>
        </div>

        <ShiftDrawer
            open={!!editingShift}
            currentUser={user!}
            shift={editingShift}
            onSave={handleUpdateShiftTimes}
            onClose={() => setEditingShift(null)}
        />

        <CreateShiftDrawer
            open={creating}
            mechanics={mechanics}
            cabinets={cabinets}
            onSave={handleCreateShift}
            onClose={() => setCreating(false)}
        />
      </div>
  )
}