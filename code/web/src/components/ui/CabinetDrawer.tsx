import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { X, Package, MapPin, AlertTriangle } from 'lucide-react'
import type { Cabinet, CabinetStatus } from '@/types/domain'
// Same visual structure as UserDrawer — shared CSS intentional
import styles from './UserDrawer.module.css'

interface CabinetDrawerProps {
  mode:         'closed' | 'create' | 'edit'
  cabinet:      Cabinet | null
  onSave:       (data: { name: string; location: string; status: CabinetStatus }) => void
  onClose:      () => void
  onDeactivate: (id: number) => void
}

const STATUSES: CabinetStatus[] = ['OPEN', 'CLOSED', 'BROKEN', 'INACTIVE']

export default function CabinetDrawer({
  mode, cabinet, onSave, onClose, onDeactivate,
}: CabinetDrawerProps) {
  const { t } = useTranslation()
  const [name,              setName]              = useState('')
  const [location,          setLocation]          = useState('')
  const [status,            setStatus]            = useState<CabinetStatus>('OPEN')
  const [confirmDeactivate, setConfirmDeactivate] = useState(false)
  const [errors,            setErrors]            = useState<Record<string, string>>({})

  useEffect(() => {
    if (mode === 'edit' && cabinet) {
      setName(cabinet.name)
      setLocation(cabinet.location)
      setStatus(cabinet.status)
    } else if (mode === 'create') {
      setName('')
      setLocation('')
      setStatus('OPEN')
    }
    setConfirmDeactivate(false)
    setErrors({})
  }, [mode, cabinet])

  if (mode === 'closed') return null

  const validate = () => {
    const e: Record<string, string> = {}
    if (!name.trim())     e.name     = t('drawer.errNameRequired')
    if (!location.trim()) e.location = t('drawer.errLocationRequired')
    return e
  }

  const handleSave = () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    onSave({ name: name.trim(), location: location.trim(), status })
  }

  return (
    <>
      <div className={styles.backdrop} onClick={onClose} />
      <div className={styles.drawer}>

        <div className={styles.drawerHead}>
          <div>
            <div className={styles.drawerTitle}>
              {mode === 'create' ? t('drawer.newCabinet') : t('drawer.editCabinet')}
            </div>
            {mode === 'edit' && cabinet && (
              <div className={styles.drawerSub}>{cabinet.name}</div>
            )}
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label={t('drawer.close')}>
            <X size={15} />
          </button>
        </div>

        <div className={styles.drawerBody}>
          <div className={styles.field}>
            <label className={styles.label}><Package size={11} /> {t('drawer.nameLabel')}</label>
            <input
              className={`${styles.input} ${errors.name ? styles.inputErr : ''}`}
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder={t('drawer.cabinetNamePlaceholder')}
            />
            {errors.name && <span className={styles.errMsg}>{errors.name}</span>}
          </div>

          <div className={styles.field}>
            <label className={styles.label}><MapPin size={11} /> {t('drawer.locationLabel')}</label>
            <input
              className={`${styles.input} ${errors.location ? styles.inputErr : ''}`}
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder={t('drawer.locationPlaceholder')}
            />
            {errors.location && <span className={styles.errMsg}>{errors.location}</span>}
          </div>

          <div className={styles.field}>
            <label className={styles.label}>{t('drawer.statusLabel')}</label>
            <select
              className={styles.select}
              value={status}
              onChange={e => setStatus(e.target.value as CabinetStatus)}
            >
              {STATUSES.map(s => (
                <option key={s} value={s}>{t(`status.${s}`)}</option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.drawerFooter}>
          <div className={styles.footerActions}>
            <button className={styles.saveBtn} onClick={handleSave}>
              {mode === 'create' ? t('drawer.addCabinet') : t('drawer.saveChanges')}
            </button>
            <button className={styles.cancelBtn} onClick={onClose}>{t('drawer.cancel')}</button>
          </div>
        </div>
      </div>
    </>
  )
}
