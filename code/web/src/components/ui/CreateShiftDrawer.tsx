import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { X, Clock, User, Package } from 'lucide-react'
import type { Cabinet, User as UserType } from '@/types/domain'
import TimeField from './TimeField'
import styles from './ShiftDrawer.module.css'

interface CreateShiftDrawerProps {
  open:       boolean
  mechanics:  UserType[]
  cabinets:   Cabinet[]
  onSave:     (data: { userId: number; cabinetId: number; startTime: string; endTime: string }) => void
  onClose:    () => void
}

export default function CreateShiftDrawer({
                                           open, mechanics, cabinets, onSave, onClose,
                                         }: CreateShiftDrawerProps) {
  const { t } = useTranslation()
  const [userId,    setUserId]    = useState<string>('')
  const [cabinetId, setCabinetId] = useState<string>('')
  const [startTime, setStartTime] = useState<string>('')
  const [endTime,   setEndTime]   = useState<string>('')
  const [errors,    setErrors]    = useState<Record<string, string>>({})

  useEffect(() => {
    if (open) {
      setUserId('')
      setCabinetId('')
      setStartTime('')
      setEndTime('')
      setErrors({})
    }
  }, [open])

  if (!open) return null

  const validate = () => {
    const e: Record<string, string> = {}
    if (!userId)    e.user    = t('shifts.selectMechanicError')
    if (!cabinetId) e.cabinet = t('shifts.selectCabinetError')
    if (!startTime || !endTime) e.time = t('shifts.timeRequired')
    return e
  }

  const handleSave = () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }

    onSave({
      userId:    Number(userId),
      cabinetId: Number(cabinetId),
      startTime: `${startTime}:00`,
      endTime:   `${endTime}:00`,
    })
  }

  return (
      <>
        <div className={styles.backdrop} onClick={onClose} />
        <div className={styles.drawer}>

          <div className={styles.drawerHead}>
            <div>
              <div className={styles.drawerTitle}>{t('shifts.createTitle')}</div>
              <div className={styles.drawerSub}>{t('shifts.createSub')}</div>
            </div>
            <button className={styles.closeBtn} onClick={onClose} aria-label={t('shifts.cancel')}>
              <X size={15} />
            </button>
          </div>

          <div className={styles.drawerBody}>
            <div className={styles.field}>
              <label className={styles.label}><User size={11} /> {t('shifts.mechanic')}</label>
              <select
                  className={`${styles.input} ${errors.user ? styles.inputErr : ''}`}
                  value={userId}
                  onChange={e => setUserId(e.target.value)}
              >
                <option value="">{t('shifts.selectMechanic')}</option>
                {mechanics.map(m => (
                    <option key={m.id} value={m.id}>{m.name} — {m.email}</option>
                ))}
              </select>
              {mechanics.length === 0 && (
                  <span className={styles.errMsg}>{t('shifts.noMechanicsAvailable')}</span>
              )}
              {errors.user && <span className={styles.errMsg}>{errors.user}</span>}
            </div>

            <div className={styles.field}>
              <label className={styles.label}><Package size={11} /> {t('shifts.cabinet')}</label>
              <select
                  className={`${styles.input} ${errors.cabinet ? styles.inputErr : ''}`}
                  value={cabinetId}
                  onChange={e => setCabinetId(e.target.value)}
              >
                <option value="">{t('shifts.selectCabinet')}</option>
                {cabinets.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {errors.cabinet && <span className={styles.errMsg}>{errors.cabinet}</span>}
            </div>

            <div className={styles.field}>
              <label className={styles.label}><Clock size={11} /> {t('shifts.start')}</label>
              <TimeField
                  value={startTime}
                  onChange={setStartTime}
                  className={styles.input}
                  error={!!errors.time}
                  errorClassName={styles.inputErr}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}><Clock size={11} /> {t('shifts.end')}</label>
              <TimeField
                  value={endTime}
                  onChange={setEndTime}
                  className={styles.input}
                  error={!!errors.time}
                  errorClassName={styles.inputErr}
              />
            </div>

            {errors.time && <span className={styles.errMsg}>{errors.time}</span>}
          </div>

          <div className={styles.drawerFooter}>
            <div className={styles.footerActions}>
              <button className={styles.saveBtn} onClick={handleSave}>
                {t('shifts.createShift')}
              </button>
              <button className={styles.cancelBtn} onClick={onClose}>
                {t('shifts.cancel')}
              </button>
            </div>
          </div>

        </div>
      </>
  )
}
