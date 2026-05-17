import { useState } from 'react'
import {
  User, Shield, Monitor, Info,
  Check, ChevronRight, Sun, Moon,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { usePrefs } from '@/context/PrefsContext'
import type { UserRole } from '@/types/domain'
import styles from './Settings.module.css'

// ── Role permission definitions ───────────────────────────────────────────────

const ROLE_PERMISSIONS: Record<UserRole, { can: string[]; cannot: string[] }> = {
  ADMIN: {
    can: [
      'View all cabinets, tools, shifts and activities',
      'Create, edit and deactivate user accounts',
      'Add and manage tool cabinets',
      'Add and manage tools in inventory',
      'View full audit log',
      'Access system settings',
    ],
    cannot: [],
  },
  MECHANIC: {
    can: [
      'View cabinet status and tool inventory',
      'Start and end shifts',
      'View activity log for own shifts',
    ],
    cannot: [
      'Manage user accounts',
      'Add or edit cabinets or tools',
      'Access system settings',
    ],
  },
  BACK_OFFICE: {
    can: [
      'View cabinets, tools, shifts and activity log',
      'Generate reports',
    ],
    cannot: [
      'Manage user accounts',
      'Add or edit cabinets or tools',
      'Access system settings',
    ],
  },
}

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
  const { user }                          = useAuth()
  const { clockFormat, compactMode, theme,
          setClockFormat, setCompactMode, setTheme } = usePrefs()

  const [profileName,    setProfileName]    = useState(user?.name ?? '')
  const [profileEmail,   setProfileEmail]   = useState(user?.email ?? '')
  const [profileSaved,   setProfileSaved]   = useState(false)

  const handleProfileSave = () => {
    setProfileSaved(true)
    setTimeout(() => setProfileSaved(false), 2000)
  }

  if (!user) return null

  const initials = user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className={styles.page}>
      <div className={styles.pageHead}>
        <h1 className={styles.pageTitle}>Settings</h1>
        <p className={styles.pageSubtitle}>Account · display preferences · system</p>
      </div>

      <div className={styles.grid}>

        {/* ── LEFT COLUMN ── */}
        <div className={styles.col}>

          {/* Profile */}
          <Section icon={User} title="User Profile">
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
                <label className={styles.label}>Display Name</label>
                <input
                  className={styles.input}
                  value={profileName}
                  onChange={e => setProfileName(e.target.value)}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Email</label>
                <input
                  className={styles.input}
                  type="email"
                  value={profileEmail}
                  onChange={e => setProfileEmail(e.target.value)}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>New Password</label>
                <input
                  className={styles.input}
                  type="password"
                  placeholder="Leave blank to keep current"
                />
              </div>
            </div>

            <button
              className={`${styles.saveBtn} ${profileSaved ? styles.saveBtnDone : ''}`}
              onClick={handleProfileSave}
            >
              {profileSaved ? <><Check size={12} /> Saved</> : 'Save Changes'}
            </button>
          </Section>

          {/* Display */}
          <Section icon={Monitor} title="Display Preferences">
            <div className={styles.prefRow}>
              <div className={styles.prefLabel}>
                <span className={styles.prefName}>Theme</span>
                <span className={styles.prefHint}>Interface colour scheme</span>
              </div>
              <div className={styles.segControl}>
                <button
                  className={`${styles.seg} ${theme === 'dark' ? styles.segActive : ''}`}
                  onClick={() => setTheme('dark')}
                >
                  <Moon size={11} /> Dark
                </button>
                <button
                  className={`${styles.seg} ${theme === 'light' ? styles.segActive : ''}`}
                  onClick={() => setTheme('light')}
                >
                  <Sun size={11} /> Light
                </button>
              </div>
            </div>

            <div className={styles.prefRow}>
              <div className={styles.prefLabel}>
                <span className={styles.prefName}>Clock Format</span>
                <span className={styles.prefHint}>Affects the header clock</span>
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

            <div className={styles.prefRow}>
              <div className={styles.prefLabel}>
                <span className={styles.prefName}>Compact Mode</span>
                <span className={styles.prefHint}>Tighter rows in tables</span>
              </div>
              <button
                className={`${styles.toggle} ${compactMode ? styles.toggleOn : ''}`}
                onClick={() => setCompactMode(!compactMode)}
                aria-pressed={compactMode}
              >
                <span className={styles.toggleThumb} />
              </button>
            </div>
          </Section>

        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className={styles.col}>

          {/* System Info */}
          <Section icon={Info} title="System Information">
            <div className={styles.sysGrid}>
              {[
                { k: 'Application',  v: 'STC-SM'        },
                { k: 'Version',      v: '0.1.0-dev'     },
                { k: 'Environment',  v: 'Development'   },
                { k: 'API',          v: 'Operational'   },
                { k: 'RFID',         v: 'Operational'   },
                { k: 'Database',     v: 'Connected'     },
                { k: 'Audit Log',    v: 'Active'        },
              ].map(({ k, v }) => (
                <div key={k} className={styles.sysRow}>
                  <span className={styles.sysKey}>{k}</span>
                  <span className={`${styles.sysVal} ${v === 'Operational' || v === 'Connected' || v === 'Active' ? styles.sysValOk : styles.sysValInfo}`}>
                    {v}
                  </span>
                </div>
              ))}
            </div>
          </Section>

          {/* Access Control — ADMIN only */}
          {user.role === 'ADMIN' && (
            <Section icon={Shield} title="Access Control">
              <p className={styles.sectionNote}>
                Role definitions for this installation.
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
                          {p}
                        </li>
                      ))}
                      {perms.cannot.map(p => (
                        <li key={p} className={styles.permCannot}>
                          <span className={styles.permX}>✕</span>
                          {p}
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
