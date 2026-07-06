import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  User, Shield, Monitor, Info,
  ChevronRight, Sun, Moon,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { usePrefs } from '@/context/PrefsContext'
import type { UserRole } from '@/types/domain'
import styles from './Settings.module.css'

// ── Role permission definitions (translation keys, resolved via t() below) ────

const ROLE_PERMISSIONS: Record<UserRole, { can: string[]; cannot: string[] }> = {
  ADMIN: {
    can: [
      'settings.perm.viewAll',
      'settings.perm.manageUsers',
      'settings.perm.manageCabinets',
      'settings.perm.manageTools',
      'settings.perm.viewFullAudit',
      'settings.perm.accessSettings',
    ],
    cannot: [],
  },
  MECHANIC: {
    can: [
      'settings.perm.viewCabinetTool',
      'settings.perm.startEndShifts',
      'settings.perm.viewOwnActivity',
    ],
    cannot: [
      'settings.perm.noManageUsers',
      'settings.perm.noEditCabinetsTools',
      'settings.perm.noAccessSettings',
    ],
  },
  BACK_OFFICE: {
    can: [
      'settings.perm.viewResources',
      'settings.perm.generateReports',
    ],
    cannot: [
      'settings.perm.noManageUsers',
      'settings.perm.noEditCabinetsTools',
      'settings.perm.noAccessSettings',
    ],
  },
}

// System rows: `ok` drives the styling, `value`/`valueKey` the (translatable) text.
// Values are derived from the actual build (version from package.json, environment from Vite mode).
const SYS_ROWS: { labelKey: string; value?: string; valueKey?: string; ok: boolean }[] = [
  { labelKey: 'settings.system.application', value: 'STC-SM',        ok: false },
  { labelKey: 'settings.system.version',     value: __APP_VERSION__, ok: false },
  {
    labelKey: 'settings.system.environment',
    valueKey: import.meta.env.DEV ? 'settings.system.development' : 'settings.system.production',
    ok: false,
  },
]

// ── Section wrapper ───────────────────────────────────────────────────────────

function Section({
  icon: Icon, title, children,
}: {
  icon: React.ElementType
  title: string
  children: React.ReactNode
}) {
  return (
    <div className={styles.section}>
      <div className={styles.sectionHead}>
        <Icon size={13} className={styles.sectionIcon} />
        <span className={styles.sectionTitle}>{title}</span>
      </div>
      <div className={styles.sectionBody}>{children}</div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function Settings() {
  const { t } = useTranslation()
  const { user }                          = useAuth()
  const { clockFormat, theme, language,
          setClockFormat, setTheme, setLanguage } = usePrefs()

  const [profileName,    setProfileName]    = useState(user?.name ?? '')
  const [profileEmail,   setProfileEmail]   = useState(user?.email ?? '')

  if (!user) return null

  const initials = user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className={styles.page}>
      <div className={styles.pageHead}>
        <h1 className={styles.pageTitle}>{t('settings.title')}</h1>
        <p className={styles.pageSubtitle}>{t('settings.subtitle')}</p>
      </div>

      <div className={styles.grid}>

        {/* ── LEFT COLUMN ── */}
        <div className={styles.col}>

          {/* Profile */}
          <Section icon={User} title={t('settings.profile.title')}>
            <div className={styles.profileRow}>
              <div className={`${styles.profileAvatar} ${user.role === 'ADMIN' ? styles.avatarAdmin : styles.avatarMech}`}>
                {initials}
              </div>
              <div>
                <div className={styles.profileName}>{user.name}</div>
                <span className={`${styles.rolePill} ${user.role === 'ADMIN' ? styles.pillAdmin : styles.pillMech}`}>
                  {user.role === 'ADMIN' ? <Shield size={9} /> : <User size={9} />}
                  {user.role}
                </span>
              </div>
            </div>

            <div className={styles.fields}>
              <div className={styles.field}>
                <label className={styles.label}>{t('settings.profile.displayName')}</label>
                <input
                  className={styles.input}
                  value={profileName}
                  onChange={e => setProfileName(e.target.value)}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>{t('settings.profile.email')}</label>
                <input
                  className={styles.input}
                  type="email"
                  value={profileEmail}
                  onChange={e => setProfileEmail(e.target.value)}
                />
              </div>
            </div>
          </Section>

          {/* Display */}
          <Section icon={Monitor} title={t('settings.display.title')}>
            <div className={styles.prefRow}>
              <div className={styles.prefLabel}>
                <span className={styles.prefName}>{t('settings.display.theme')}</span>
                <span className={styles.prefHint}>{t('settings.display.themeHint')}</span>
              </div>
              <div className={styles.segControl}>
                <button
                  className={`${styles.seg} ${theme === 'dark' ? styles.segActive : ''}`}
                  onClick={() => setTheme('dark')}
                >
                  <Moon size={11} /> {t('settings.display.dark')}
                </button>
                <button
                  className={`${styles.seg} ${theme === 'light' ? styles.segActive : ''}`}
                  onClick={() => setTheme('light')}
                >
                  <Sun size={11} /> {t('settings.display.light')}
                </button>
              </div>
            </div>

            <div className={styles.prefRow}>
              <div className={styles.prefLabel}>
                <span className={styles.prefName}>{t('settings.language.name')}</span>
                <span className={styles.prefHint}>{t('settings.language.hint')}</span>
              </div>
              <div className={styles.segControl}>
                <button
                  className={`${styles.seg} ${language === 'en' ? styles.segActive : ''}`}
                  onClick={() => setLanguage('en')}
                >
                  EN
                </button>
                <button
                  className={`${styles.seg} ${language === 'pt' ? styles.segActive : ''}`}
                  onClick={() => setLanguage('pt')}
                >
                  PT
                </button>
              </div>
            </div>

            <div className={styles.prefRow}>
              <div className={styles.prefLabel}>
                <span className={styles.prefName}>{t('settings.display.clock')}</span>
                <span className={styles.prefHint}>{t('settings.display.clockHint')}</span>
              </div>
              <div className={styles.segControl}>
                <button
                  className={`${styles.seg} ${clockFormat === '24h' ? styles.segActive : ''}`}
                  onClick={() => setClockFormat('24h')}
                >
                  24h
                </button>
                <button
                  className={`${styles.seg} ${clockFormat === '12h' ? styles.segActive : ''}`}
                  onClick={() => setClockFormat('12h')}
                >
                  12h
                </button>
              </div>
            </div>
          </Section>

        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className={styles.col}>

          {/* System Info */}
          <Section icon={Info} title={t('settings.system.title')}>
            <div className={styles.sysGrid}>
              {SYS_ROWS.map(({ labelKey, value, valueKey, ok }) => (
                <div key={labelKey} className={styles.sysRow}>
                  <span className={styles.sysKey}>{t(labelKey)}</span>
                  <span className={`${styles.sysVal} ${ok ? styles.sysValOk : styles.sysValInfo}`}>
                    {valueKey ? t(valueKey) : value}
                  </span>
                </div>
              ))}
            </div>
          </Section>

          {/* Access Control — ADMIN only */}
          {user.role === 'ADMIN' && (
            <Section icon={Shield} title={t('settings.access.title')}>
              <p className={styles.sectionNote}>
                {t('settings.access.note')}
              </p>
              <div className={styles.roleCards}>
                {(Object.entries(ROLE_PERMISSIONS) as [UserRole, typeof ROLE_PERMISSIONS[UserRole]][]).map(([role, perms]) => (
                  <div key={role} className={`${styles.roleCard} ${role === 'ADMIN' ? styles.roleCardAdmin : styles.roleCardMech}`}>
                    <div className={styles.roleCardHead}>
                      <Shield size={11} />
                      <span>{role}</span>
                    </div>
                    <ul className={styles.permList}>
                      {perms.can.map(p => (
                        <li key={p} className={styles.permCan}>
                          <ChevronRight size={10} />
                          {t(p)}
                        </li>
                      ))}
                      {perms.cannot.map(p => (
                        <li key={p} className={styles.permCannot}>
                          <span className={styles.permX}>✕</span>
                          {t(p)}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </Section>
          )}

        </div>

      </div>
    </div>
  )
}
