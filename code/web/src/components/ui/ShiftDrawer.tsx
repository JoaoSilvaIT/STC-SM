import { useState, useEffect } from 'react'
import { X, Clock, User } from 'lucide-react'
import type { Shift, User as UserType } from '@/types/domain'
import styles from './ShiftDrawer.module.css'

interface ShiftDrawerProps {
  open:         boolean
  currentUser:  UserType
  shift:        Shift | null
  onSave:       (data: { startTime: string | null; endTime: string | null }) => void
  onClose:      () => void
}

// O input type="time" precisa do formato estrito "HH:mm" (24h)
const formatForInput = (timeString?: string | null) => {
  if (!timeString) return ''
  return timeString.slice(0, 5)
}

export default function ShiftDrawer({
                                      open, currentUser, shift, onSave, onClose,
                                    }: ShiftDrawerProps) {
  const [startTime, setStartTime] = useState<string>('')
  const [endTime,   setEndTime]   = useState<string>('')
  const [errors,    setErrors]    = useState<Record<string, string>>({})

  useEffect(() => {
    if (open && shift) {
      setStartTime(formatForInput(shift.startTime))
      setEndTime(formatForInput(shift.endTime))
      setErrors({})
    }
  }, [open, shift])

  if (!open || !shift) return null

  const validate = () => {
    const e: Record<string, string> = {}

    if (!startTime || !endTime) {
      e.time = 'Both start and end times are required'
    }

    return e
  }

  const handleSave = () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }

    onSave({
      startTime: startTime ? `${startTime}:00` : null,
      endTime: endTime ? `${endTime}:00` : null,
    })
  }

  return (
      <>
        <div className={styles.backdrop} onClick={onClose} />
        <div className={styles.drawer}>

          <div className={styles.drawerHead}>
            <div>
              <div className={styles.drawerTitle}>Edit Shift Times</div>
              <div className={styles.drawerSub}>Update start or end time for SHIFT-{shift.id.toString().padStart(3, '0')}</div>
            </div>
            <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
              <X size={15} />
            </button>
          </div>

          <div className={styles.drawerBody}>
            <div className={styles.field}>
              <label className={styles.label}><User size={11} /> Mechanic</label>
              <div className={styles.readOnly}>{shift.userName || currentUser.name}</div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}><Clock size={11} /> Start Time</label>
              <input
                  type="time"
                  className={`${styles.input} ${errors.time ? styles.inputErr : ''}`}
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}><Clock size={11} /> End Time</label>
              <input
                  type="time"
                  className={`${styles.input} ${errors.time ? styles.inputErr : ''}`}
                  value={endTime}
                  onChange={e => setEndTime(e.target.value)}
              />
            </div>

            {errors.time && <span className={styles.errMsg}>{errors.time}</span>}
          </div>

          <div className={styles.drawerFooter}>
            <div className={styles.footerActions}>
              <button className={styles.saveBtn} onClick={handleSave}>
                Save Changes
              </button>
              <button className={styles.cancelBtn} onClick={onClose}>
                Cancel
              </button>
            </div>
          </div>

        </div>
      </>
  )
}