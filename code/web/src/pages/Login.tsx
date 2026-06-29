import { useState, type FormEvent } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Shield, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { ApiError } from '@/api/client'
import styles from './Login.module.css'

export default function Login() {
  const { t }        = useTranslation()
  const { login }    = useAuth()
  const navigate     = useNavigate()
  const location     = useLocation()
  const from         = (location.state as { from?: Location })?.from?.pathname ?? '/dashboard'

  const [email,     setEmail]     = useState('')
  const [password,  setPassword]  = useState('')
  const [showPass,  setShowPass]  = useState(false)
  const [error,     setError]     = useState('')
  const [loading,   setLoading]   = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email.trim() || !password.trim()) {
      setError(t('login.errRequired'))
      return
    }
    setLoading(true)
    try {
      await login(email.trim(), password)
      navigate(from, { replace: true })
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError(t('login.errInvalid'))
      } else if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError(t('login.errServer'))
      }
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.panel}>

        {/* Brand */}
        <div className={styles.brand}>
          <span className={styles.brandMark}>STC·SM</span>
          <span className={styles.brandSub}>{t('login.brandSub')}</span>
        </div>

        <div className={styles.divider} />

        {/* Title */}
        <div className={styles.titleRow}>
          <Shield size={14} className={styles.titleIcon} />
          <span className={styles.title}>{t('login.title')}</span>
        </div>

        {/* Form */}
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.field}>
            <label className={styles.label}>{t('login.email')}</label>
            <input
              className={styles.input}
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="user@atl-mro.pt"
              autoComplete="username"
              autoFocus
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>{t('login.password')}</label>
            <div className={styles.passWrap}>
              <input
                className={styles.input}
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowPass(v => !v)}
                tabIndex={-1}
                aria-label={showPass ? t('login.hidePassword') : t('login.showPassword')}
              >
                {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {error && (
            <div className={styles.errorMsg}>{error}</div>
          )}

          <button
            className={styles.submitBtn}
            type="submit"
            disabled={loading}
          >
            {loading ? t('login.authenticating') : t('login.submit')}
          </button>
        </form>

        <div className={styles.footer}>
          {t('login.footer')}
        </div>

      </div>

      {/* Background grid lines — avionics aesthetic */}
      <div className={styles.bgGrid} aria-hidden />
    </div>
  )
}
