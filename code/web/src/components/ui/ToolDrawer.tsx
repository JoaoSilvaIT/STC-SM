import { useState, useEffect } from 'react'
import { X, Wrench, Hash, AlertTriangle } from 'lucide-react'
import type { Cabinet, Tool, ToolStatus } from '@/types/domain'
// Same visual structure as UserDrawer — shared CSS intentional
import styles from './UserDrawer.module.css'

interface ToolDrawerProps {
  mode:         'closed' | 'create' | 'edit'
  tool:         Tool | null
  cabinets:     Cabinet[]
  onSave:       (data: { name: string; partNumber: string; cabinetId: number; status: ToolStatus }) => Promise<void> | void
  onClose:      () => void
  onDeactivate: (id: number) => void
}

const STATUSES: ToolStatus[] = ['AVAILABLE', 'IN_USE', 'MISSING', 'MAINTENANCE']

export default function ToolDrawer({
  mode, tool, cabinets, onSave, onClose, onDeactivate,
}: ToolDrawerProps) {
  const [name,              setName]              = useState('')
  const [partNumber,        setPartNumber]        = useState('')
  const [cabinetId,         setCabinetId]         = useState<number>(cabinets[0]?.id ?? 1)
  const [status,            setStatus]            = useState<ToolStatus>('AVAILABLE')
  const [confirmDeactivate, setConfirmDeactivate] = useState(false)
  const [errors,            setErrors]            = useState<Record<string, string>>({})
  const [submitError,       setSubmitError]       = useState<string | null>(null)
  const [submitting,        setSubmitting]        = useState(false)

  useEffect(() => {
    if (mode === 'edit' && tool) {
      setName(tool.name)
      setPartNumber(tool.partNumber)
      setCabinetId(tool.cabinetId)
      setStatus(tool.status)
    } else if (mode === 'create') {
      setName('')
      setPartNumber('')
      setCabinetId(cabinets[0]?.id ?? 1)
      setStatus('AVAILABLE')
    }
    setConfirmDeactivate(false)
    setErrors({})
    setSubmitError(null)
  }, [mode, tool])

  if (mode === 'closed') return null

  const validate = () => {
    const e: Record<string, string> = {}
    if (!name.trim()) e.name = 'Name is required'
    if (!cabinetId)   e.cabinetId = 'Cabinet is required'
    return e
  }

  const handleSave = async () => {
    setSubmitError(null)
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setSubmitting(true)
    try {
      await onSave({ name: name.trim(), partNumber: partNumber.trim().toUpperCase(), cabinetId, status })
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to save tool')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <div className={styles.backdrop} onClick={onClose} />
      <div className={styles.drawer}>

        <div className={styles.drawerHead}>
          <div>
            <div className={styles.drawerTitle}>
              {mode === 'create' ? 'New Tool' : 'Edit Tool'}
            </div>
            {mode === 'edit' && tool && (
              <div className={styles.drawerSub}>{tool.partNumber}</div>
            )}
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
            <X size={15} />
          </button>
        </div>

        <div className={styles.drawerBody}>
          <div className={styles.field}>
            <label className={styles.label}><Wrench size={11} /> Tool Name</label>
            <input
              className={`${styles.input} ${errors.name ? styles.inputErr : ''}`}
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Torque Wrench 50Nm"
            />
            {errors.name && <span className={styles.errMsg}>{errors.name}</span>}
          </div>

          <div className={styles.field}>
            <label className={styles.label}><Hash size={11} /> Part Number</label>
            <input
              className={`${styles.input} ${errors.partNumber ? styles.inputErr : ''}`}
              value={partNumber}
              onChange={e => setPartNumber(e.target.value.toUpperCase())}
              placeholder="TW-50-3/8"
            />
            {errors.partNumber && <span className={styles.errMsg}>{errors.partNumber}</span>}
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Cabinet</label>
            <select
              className={styles.select}
              value={cabinetId}
              onChange={e => setCabinetId(Number(e.target.value))}
            >
              {cabinets.map(c => (
                <option key={c.id} value={c.id}>{c.name} — {c.location}</option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Status</label>
            <select
              className={styles.select}
              value={status}
              onChange={e => setStatus(e.target.value as ToolStatus)}
            >
              {STATUSES.map(s => (
                <option key={s} value={s}>{s.replace('_', ' ')}</option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.drawerFooter}>
          {submitError && <div className={styles.errMsg} style={{ marginBottom: 8 }}>{submitError}</div>}
          <div className={styles.footerActions}>
            <button className={styles.saveBtn} onClick={handleSave} disabled={submitting}>
              {submitting ? 'Saving…' : mode === 'create' ? 'Add Tool' : 'Save Changes'}
            </button>
            <button className={styles.cancelBtn} onClick={onClose}>Cancel</button>
          </div>

          {mode === 'edit' && tool && (
            <div className={styles.destructiveZone}>
              {!confirmDeactivate ? (
                <button
                  className={`${styles.deactivateBtn} ${!tool.isActive ? styles.reactivateBtn : ''}`}
                  onClick={() => setConfirmDeactivate(true)}
                >
                  {tool.isActive ? 'Deactivate Tool' : 'Reactivate Tool'}
                </button>
              ) : (
                <div className={styles.confirmRow}>
                  <AlertTriangle size={12} className={styles.confirmIcon} />
                  <span className={styles.confirmText}>
                    {tool.isActive ? `Deactivate ${tool.name}?` : `Reactivate ${tool.name}?`}
                  </span>
                  <button
                    className={styles.confirmYes}
                    onClick={() => { onDeactivate(tool.id); setConfirmDeactivate(false) }}
                  >
                    Confirm
                  </button>
                  <button className={styles.confirmNo} onClick={() => setConfirmDeactivate(false)}>
                    Cancel
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </>
  )
}
