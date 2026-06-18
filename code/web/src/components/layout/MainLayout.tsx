import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef} from 'react'
import {
  LayoutDashboard, Package, Wrench, Activity, Clock,
  AlertTriangle, Shield, Users, Settings, LogOut, FlaskConical,
    Bell, CheckCircle, X
} from 'lucide-react'
import { listShifts } from '@/api/shifts'
import { useAuth } from '@/context/AuthContext'
import { usePrefs } from '@/context/PrefsContext'
import { useSimulator, useSimulatorTools } from '@/context/SimulatorContext'
import type { Shift, Alert, AlertType} from '@/types/domain'
import styles from './MainLayout.module.css'
import { getUnreadAlerts, updateAlert } from '@/api/alerts'

const POP_UP_ICON: Record<string, React.ReactNode> = {
  LATE_START:    <Clock        size={16} color="#3b82f6" />,
}

const TYPE_META: Record<AlertType, {label: string}> = {
  LATE_START: { label: 'Clocked in late'}
}

const NAV_PRIMARY = [
  { to: '/dashboard', label: 'Dashboard',    icon: LayoutDashboard },
  { to: '/cabinets',  label: '  Cabinets',     icon: Package },
  { to: '/inventory', label: 'Inventory',    icon: Wrench },
  { to: '/activity',  label: 'Activity Log', icon: Activity },
  { to: '/shifts',    label: 'Shifts',       icon: Clock },
  { to: '/simulator', label: 'Simulator',    icon: FlaskConical },
]

const NAV_SECONDARY_ALL = [
  { to: '/users',    label: 'Users',    icon: Users,    adminOnly: true },
  { to: '/settings', label: 'Settings', icon: Settings, adminOnly: false },
]

export default function MainLayout() {
  const { user, logout }              = useAuth()
  const { clockFormat }               = usePrefs()
  const isAdmin                       = user?.role === 'ADMIN'
  const navSecondary                  = NAV_SECONDARY_ALL.filter(n => !n.adminOnly || isAdmin)
  const navigate                      = useNavigate()
  const [utcTime, setUtcTime]         = useState(new Date())

  // Alerts that were ignored
  const [alerts, setAlerts] = useState<Alert[]>([])

  // Pop-Up Alerts
  const [popUp, setPopUp] = useState([])

  // Set to check if the tab of notifications is either open or not
  const [isBellOpen, setIsBellOpen] = useState(false)

  // To not show the same alerts
  const knownAlertIds =   useRef(new Set())

  const closePopUp = (id: number) => {
    setPopUp(prev => prev.filter(t => t.id !== id))
  }

  const handlePopUpClick = async (id: number) => {
    try {
      await updateAlert(id)

      closePopUp(id)

      setAlerts(prev => prev.filter(a => a.id !== id))
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const unread = await getUnreadAlerts()

        const newAlerts = unread.filter(a => !knownAlertIds.current.has(a.id))

        if (newAlerts.length > 0) {
          setPopUp(prev => [...prev, ...newAlerts])
          newAlerts.forEach(a => knownAlertIds.current.add(a.id))
        }

        setAlerts(unread)
      } catch (e) {
        console.error(e)
      }
    }

    const pollingTimer = setInterval(fetchAlerts, 10000)

    return () => clearInterval(pollingTimer)
  }, [])

  useEffect(() => {
    if (popUp.length > 0) {

      const timer = setTimeout(() => {
        setPopUp(prev => prev.slice(1))
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [popUp])

  useEffect(() => {
    const t = setInterval(() => setUtcTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const sim          = useSimulator()
  const simTools     = useSimulatorTools(sim)
  const missingTools = simTools.filter(t => t.status === 'IN_USE')
  const [shifts, setShifts] = useState<Shift[]>([])
  const activeShifts        = shifts.filter(s => s.status === 'ACTIVE')
  const isFodRisk           = false

  useEffect(() => {
    let cancelled = false
    listShifts()
      .then(s => { if (!cancelled) setShifts(s) })
      .catch(() => { /* silent — header stat is best-effort */ })
    return () => { cancelled = true }
  }, [])

  const hh = clockFormat === '12h'
    ? utcTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true, timeZone: 'UTC' })
    : utcTime.toISOString().slice(11, 19)
  const dd = utcTime.toISOString().slice(0, 10)

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const initials = user?.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() ?? '?'

  return (
    <div className={styles.layout}>

      {/* ── Popups ── */}
      <div className={styles.toastContainer}>
        {popUp.map((toast: any) => (
            <div
                key={toast.id}
                className={`${styles.toast} ${styles[toast.type] ?? ''}`}
                onClick={() => handlePopUpClick(toast.id)}
                style={{ cursor: 'pointer' }}
            >
              <div className={styles.toastIconWrap}>
                {POP_UP_ICON[toast.type] ?? <AlertTriangle size={16} />}
              </div>
              <div className={styles.toastContent}>
                <span className={styles.toastType}>{TYPE_META[toast.type].label}</span>
                <span className={styles.toastMsg}>{toast.message}</span>
              </div>
              <button
                  className={styles.toastClose}
                  onClick={(e) => {
                    e.stopPropagation()
                    closePopUp(toast.id)
                  }}
              >
                <X size={14} />
              </button>
            </div>
        ))}
      </div>

      {/* ── HEADER ── */}
      <header className={styles.header}>
        <div className={styles.brand}>
          <span className={styles.brandMark}>STC·SM</span>
          <span className={styles.brandSub}>Smart Tool Cabinets</span>
        </div>

        {/* FOD STATUS — the most critical instrument on screen */}
        <div className={styles.fodWrap}>
          {isFodRisk && (
            <div className={styles.fodRisk}>
              <AlertTriangle size={13} strokeWidth={2.5} />
              <span className={styles.fodText}>
                FOD RISK &nbsp;·&nbsp; {missingTools.length}&nbsp;TOOL{missingTools.length !== 1 ? 'S' : ''} UNACCOUNTED
              </span>
            </div>
          )}
        </div>

        <div className={styles.headerRight}>
          <div className={styles.hStat}>
            <span className={styles.hStatVal}>{activeShifts.length}</span>
            <span className={styles.hStatKey}>Active Shifts</span>
          </div>
          <div className={styles.hDivider} />
          {/* ── NOTIFICATIONS BELL ── */}
          <div className={styles.bellWrap}>
            <button
                className={styles.bellBtn}
                onClick={() => setIsBellOpen(!isBellOpen)}
                title="Notificações"
            >
              <Bell size={18} className={styles.bellIcon} />
              {alerts.length > 0 && (
                  <span className={styles.bellBadge}>{alerts.length}</span>
              )}
            </button>

            {/* LIST OF NOTIFICATIONS UNREAD */}
            {isBellOpen && (
                <div className={styles.bellDropdown}>
                  <div className={styles.bellHeader}>
                    <span>Alerts</span>
                    <span className={styles.bellCount}>{alerts.length} unread</span>
                  </div>

                  <div className={styles.bellList}>
                    {alerts.length === 0 ? (
                        <div className={styles.bellEmpty}>No new alerts</div>
                    ) : (
                        alerts.map((alert: any) => (
                            <div
                                key={alert.id}
                                className={styles.bellItem}
                                onClick={() => {
                                  handlePopUpClick(alert.id);
                                }}
                            >
                              <div className={styles.bellItemIcon}>
                                {POP_UP_ICON[alert.type] ?? <AlertTriangle size={14} />}
                              </div>
                              <div className={styles.bellItemContent}>
                                <span className={styles.bellItemTitle}>{TYPE_META[alert.type]?.label ?? 'Alert'}</span>
                                <span className={styles.bellItemMsg}>{alert.message}</span>
                              </div>
                            </div>
                        ))
                    )}
                  </div>
                </div>
            )}
          </div>
          <div className={styles.userChip}>
            <div className={styles.userAvatar}>{initials}</div>
            <div>
              <div className={styles.userName}>{user?.name ?? '—'}</div>
              <div className={styles.userRole}>{user?.role ?? ''}</div>
            </div>
          </div>
          <button
            className={styles.logoutBtn}
            onClick={handleLogout}
            title="Log out"
            aria-label="Log out"
          >
            <LogOut size={14} />
          </button>
          <div className={styles.hDivider} />
          <div className={styles.clock}>
            <span className={styles.clockHms}>{hh}</span>
            <span className={styles.clockDate}>{dd} UTC</span>
          </div>
        </div>
      </header>

      {/* ── SIDEBAR ── */}
      <aside className={styles.sidebar}>
        <nav className={styles.nav}>
          <span className={styles.navGroup}>Operations</span>
          {NAV_PRIMARY.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.navActive : ''}`
              }
            >
              <Icon size={15} />
              <span>{label}</span>
            </NavLink>
          ))}

          <span className={styles.navGroup}>System</span>
          {navSecondary.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.navActive : ''}`
              }
            >
              <Icon size={15} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className={styles.sysBlock}>
          <div className={styles.sysTitle}>
            <Shield size={11} />
            <span>System Status</span>
          </div>
          {[
            { k: 'API',   v: 'OPERATIONAL' },
            { k: 'RFID',  v: 'OPERATIONAL' },
            { k: 'DB',    v: 'CONNECTED'   },
            { k: 'AUDIT', v: 'ACTIVE'      },
          ].map(({ k, v }) => (
            <div key={k} className={styles.sysRow}>
              <span className={styles.sysKey}>{k}</span>
              <span className={styles.sysVal}>{v}</span>
            </div>
          ))}
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main className={styles.main}>
        <Outlet />
      </main>

    </div>
  )
}
