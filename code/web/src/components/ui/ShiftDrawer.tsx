import { useState, useEffect } from 'react'
import { X, Package, User } from 'lucide-react'
import type { Cabinet, Shift, User as UserType } from '@/types/domain'
import styles from './ShiftDrawer.module.css'

interface ShiftDrawerProps {
  open:         boolean
  currentUser:  UserType
  cabinets:     Cabinet[]
  activeShifts: Shift[]
  onSave:       (data: { cabinetId: number }) => void
  onClose:      () => void
}

export default function ShiftDrawer({
  open, currentUser, cabinets, activeShifts, onSave, onClose,
}: ShiftDrawerProps) {
  const [cabinetId,   setCabinetId]   = useState<number | ''>('')
  const [errors,      setErrors]      = useState<Record<string, string>>({})

  useEffect(() => {
    if (open) {
      setCabinetId('')
      setErrors({})
    }
  }, [open])

  if (!open) return null

  const occupiedIds       = activeShifts.map(s => s.cabinetId)
  const availableCabinets = cabinets.filter(
      c => (c.status === 'OPEN' || c.status === 'CLOSED') && !occupiedIds.includes(c.id)
  )

  const validate = () => {
    const e: Record<string, string> = {}
    if (!cabinetId)          e.cabinet     = 'Select a cabinet'
    return e
  }

  const handleSave = () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    onSave({
      cabinetId:   cabinetId as number,
    })
  }

  return (
    <>
      <div className={styles.backdrop} onClick={onClose} />
      <div className={styles.drawer}>

        <div className={styles.drawerHead}>
          <div>
            <div className={styles.drawerTitle}>Start Shift</div>
            <div className={styles.drawerSub}>Assigns a cabinet and opens access</div>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
            <X size={15} />
          </button>
        </div>

        <div className={styles.drawerBody}>
          <div className={styles.field}>
            <label className={styles.label}><User size={11} /> Mechanic</label>
            <div className={styles.readOnly}>{currentUser.name}</div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}><Package size={11} /> Cabinet</label>
            {availableCabinets.length === 0 ? (
              <div className={styles.noAvail}>
                No cabinets available — all online cabinets are occupied
              </div>
            ) : (
              <>
                <select
                  className={`${styles.select} ${errors.cabinet ? styles.inputErr : ''}`}
                  value={cabinetId}
                  onChange={e => setCabinetId(Number(e.target.value))}
                >
                  <option value="">Select cabinet…</option>
                  {availableCabinets.map(c => (
                    <option key={c.id} value={c.id}>{c.name} — {c.location}</option>
                  ))}
                </select>
                {errors.cabinet && <span className={styles.errMsg}>{errors.cabinet}</span>}
              </>
            )}
          </div>
        </div>

        <div className={styles.drawerFooter}>
          <div className={styles.footerActions}>
            <button
              className={styles.saveBtn}
              onClick={handleSave}
              disabled={availableCabinets.length === 0}
            >
              Start Shift
            </button>
            <button className={styles.cancelBtn} onClick={onClose}>Cancel</button>
          </div>
        </div>

      </div>
    </>
  )
}
