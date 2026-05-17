import { useState, useEffect } from 'react'
import { X, User, Mail, Shield, AlertTriangle } from 'lucide-react'
import type { User as UserType, UserRole } from '@/types/domain'
import styles from './UserDrawer.module.css'

interface UserDrawerProps {
  mode: 'closed' | 'create' | 'edit'
  user: UserType | null
  onSave: (data: { name: string; email: string; role: UserRole; password?: string }) => void
  onClose: () => void
  onDeactivate: (id: number) => void
}

export default function UserDrawer({ mode, user, onSave, onClose, onDeactivate }: UserDrawerProps) {
  const [name,              setName]              = useState('')
  const [email,             setEmail]             = useState('')
  const [role,              setRole]              = useState<UserRole>('MECHANIC')
  const [password,          setPassword]          = useState('')
  const [confirmDeactivate, setConfirmDeactivate] = useState(false)
  const [errors,            setErrors]            = useState<Record<string, string>>({})

  useEffect(() => {
    if (mode === 'edit' && user) {
      setName(user.name)
      setEmail(user.email)
      setRole(user.role)
      setPassword('')
    } else if (mode === 'create') {
      setName('')
      setEmail('')
      setRole('MECHANIC')
      setPassword('')
    }
    setConfirmDeactivate(false)
    setErrors({})
  }, [mode, user])

  if (mode === 'closed') return null

  const validate = () => {
    const e: Record<string, string> = {}
    if (!name.trim())                          e.name     = 'Name is required'
    if (!email.trim())                         e.email    = 'Email is required'
    if (mode === 'create' && !password.trim()) e.password = 'Password is required'
    return e
  }

  const handleSave = () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    onSave({ name: name.trim(), email: email.trim(), role, ...(mode === 'create' ? { password } : {}) })
  }

  return (
    <>
      <div className={styles.backdrop} onClick={onClose} />
      <div className={styles.drawer}>

        {/* Header */}
        <div className={styles.drawerHead}>
          <div>
            <div className={styles.drawerTitle}>
              {mode === 'create' ? 'New User' : 'Edit User'}
            </div>
            {mode === 'edit' && user && (
              <div className={styles.drawerSub}>{user.email}</div>
            )}
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div className={styles.drawerBody}>
          <div className={styles.field}>
            <label className={styles.label}><User size={11} /> Name</label>
            <input
              className={`${styles.input} ${errors.name ? styles.inputErr : ''}`}
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Full name"
            />
            {errors.name && <span className={styles.errMsg}>{errors.name}</span>}
          </div>

          <div className={styles.field}>
            <label className={styles.label}><Mail size={11} /> Email</label>
            <input
              className={`${styles.input} ${errors.email ? styles.inputErr : ''}`}
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="user@atl-mro.pt"
            />
            {errors.email && <span className={styles.errMsg}>{errors.email}</span>}
          </div>

          <div className={styles.field}>
            <label className={styles.label}><Shield size={11} /> Role</label>
            <select
              className={styles.select}
              value={role}
              onChange={e => setRole(e.target.value as UserRole)}
            >
              <option value="MECHANIC">Mechanic</option>
              <option value="ADMIN">Administrator</option>
            </select>
          </div>

          {mode === 'create' && (
            <div className={styles.field}>
              <label className={styles.label}>Password</label>
              <input
                className={`${styles.input} ${errors.password ? styles.inputErr : ''}`}
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Temporary password"
              />
              {errors.password && <span className={styles.errMsg}>{errors.password}</span>}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={styles.drawerFooter}>
          <div className={styles.footerActions}>
            <button className={styles.saveBtn} onClick={handleSave}>
              {mode === 'create' ? 'Create User' : 'Save Changes'}
            </button>
            <button className={styles.cancelBtn} onClick={onClose}>Cancel</button>
          </div>

          {mode === 'edit' && user && (
            <div className={styles.destructiveZone}>
              {!confirmDeactivate ? (
                <button
                  className={`${styles.deactivateBtn} ${!user.isActive ? styles.reactivateBtn : ''}`}
                  onClick={() => setConfirmDeactivate(true)}
                >
                  {user.isActive ? 'Deactivate User' : 'Reactivate User'}
                </button>
              ) : (
                <div className={styles.confirmRow}>
                  <AlertTriangle size={12} className={styles.confirmIcon} />
                  <span className={styles.confirmText}>
                    {user.isActive
                      ? `Deactivate ${user.name}? This will lock their access.`
                      : `Reactivate ${user.name}?`}
                  </span>
                  <button
                    className={styles.confirmYes}
                    onClick={() => { onDeactivate(user.id); setConfirmDeactivate(false) }}
                  >
                    Confirm
                  </button>
                  <button
                    className={styles.confirmNo}
                    onClick={() => setConfirmDeactivate(false)}
                  >
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
