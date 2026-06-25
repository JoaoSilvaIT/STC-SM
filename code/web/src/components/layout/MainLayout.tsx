import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef} from 'react'
import { Client } from '@stomp/stompjs'
import {
  LayoutDashboard, Package, Wrench, Activity, Clock,
  AlertTriangle, Shield, Users, Settings, LogOut, FlaskConical,
    Bell, CheckCircle, X, DoorOpen
} from 'lucide-react'
import { listShifts } from '@/api/shifts'
import { listCabinets } from '@/api/cabinets'
import { useAuth } from '@/context/AuthContext'
import { usePrefs } from '@/context/PrefsContext'
import type { Shift, Alert, AlertType} from '@/types/domain'
import styles from './MainLayout.module.css'
import { getUnreadAlerts, updateAlert } from '@/api/alerts'

const POP_UP_ICON: Record<string, React.ReactNode> = {
  LATE_START:    <Clock        size={16} color="#3b82f6" />,
  EARLY_ENDING:  <Clock        size={16} color="#3b82f6" />,
  OPEN_CABINET:  <DoorOpen        size={16} color="#3b82f6" />,
}

const TYPE_META: Record<AlertType, {label: string}> = {
  LATE_START: { label: 'Clocked in late'},
  EARLY_ENDING: { label: 'Clocked off early'},
  OPEN_CABINET: { label: 'Cabinet opened for too long'},
}

const NAV_PRIMARY = [
  { to: '/dashboard', label: 'Dashboard',    icon: LayoutDashboard },
  { to: '/cabinets',  label: '  Cabinets',     icon: Package },
  { to: '/inventory', label: 'Inventory',    icon: Wrench },
  { to: '/activity',  label: 'Activity Log', icon: Activity },
  { to: '/shifts',    label: 'Shifts',       icon: Clock },
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
  const [popUp, setPopUp] = useState<Alert[]>([])

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
    // Get the alerts that already append but the user hasn't seen yet
    const fetchInitialAlerts = async () => {
      try {
        const unread = await getUnreadAlerts()
        setAlerts(unread)
        unread.forEach(a => knownAlertIds.current.add(a.id))
      } catch (e) {
        console.error(e)
      }
    }

    fetchInitialAlerts()

    const stompClient = new Client({
      brokerURL: (import.meta.env.VITE_WS_URL as string | undefined) ?? 'ws://localhost:8080/ws-simulator',
      onConnect: () => {
        stompClient.subscribe('/topic/alerts', (message) => {
          const newAlert = JSON.parse(message.body);

          // Se for um alerta novo que ainda não vimos
          if (!knownAlertIds.current.has(newAlert.id)) {
            knownAlertIds.current.add(newAlert.id);

            setAlerts(prev => [...prev, newAlert]);

            setPopUp(prev => [...prev, newAlert]);
          }
        });

        stompClient.subscribe('/topic/shifts', (message) => {
          listShifts().then(s => setShifts(s)).catch(console.error);

          window.dispatchEvent(new Event('shifts-updated'));
        });

        stompClient.subscribe('/topic/cabinets', (message) => {
          window.dispatchEvent(new Event('cabinets-updated'))
        });

        stompClient.subscribe('/topic/activity', (message) => {
          window.dispatchEvent(new Event('activities-updated'))
        })

        stompClient.subscribe('/topic/tools', (message) => {
          window.dispatchEvent(new Event('tools-updated'))
        })
      },
      onStompError: (frame) => {
        console.error('Error on WebSocket: ' + frame.headers['message']);
      }
    });

    stompClient.activate();

    return () => {
      stompClient.deactivate();
    }
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

  const [shifts, setShifts] = useState<Shift[]>([])
  const activeShifts        = shifts.filter(s => s.status === 'ACTIVE')

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
        {popUp.map((toast) => (
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
                <span className={styles.toastType}>{TYPE_META[toast.type]?.label ?? 'Alert'}</span>
                <span className={styles.toastMsg}>{toast.message}</span>
              </div>
              <button
                  className={styles.toastClose}
                  onClick={(e) => {
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

        {/* FOD status indicator — placeholder until wired to live tool data */}
        <div className={styles.fodWrap} />

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
                        alerts.map((alert) => (
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
      </aside>

      {/* ── MAIN ── */}
      <main className={styles.main}>
        <Outlet />
      </main>

    </div>
  )
}
