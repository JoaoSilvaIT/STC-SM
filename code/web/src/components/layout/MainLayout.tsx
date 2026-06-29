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
import type { Shift, Alert } from '@/types/domain'
import styles from './MainLayout.module.css'
import { getUnreadAlerts, updateAlert } from '@/api/alerts'
import { useTranslation } from 'react-i18next'

const POP_UP_ICON: Record<string, React.ReactNode> = {
  LATE_START:    <Clock        size={16} color="#3b82f6" />,
  EARLY_ENDING:  <Clock        size={16} color="#3b82f6" />,
  OPEN_CABINET:  <DoorOpen        size={16} color="#3b82f6" />,
}

const NAV_PRIMARY = [
  { to: '/dashboard', labelKey: 'nav.dashboard', icon: LayoutDashboard },
  { to: '/cabinets',  labelKey: 'nav.cabinets',  icon: Package },
  { to: '/inventory', labelKey: 'nav.inventory', icon: Wrench },
  { to: '/activity',  labelKey: 'nav.activity',  icon: Activity },
  { to: '/shifts',    labelKey: 'nav.shifts',    icon: Clock },
]

const NAV_SECONDARY_ALL = [
  { to: '/users',    labelKey: 'nav.users',    icon: Users,    adminOnly: true },
  { to: '/settings', labelKey: 'nav.settings', icon: Settings, adminOnly: false },
]

export default function MainLayout() {
  const { t }                         = useTranslation()
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


  const local = clockFormat === '12h' ? 'en-US' : 'pt-PT';

  const hh = utcTime.toLocaleTimeString(local, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: clockFormat === '12h',
    timeZone: 'Europe/Lisbon'
  });

  const dd = utcTime.toLocaleDateString('en-CA', {
    timeZone: 'Europe/Lisbon'
  });

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const initials = user?.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() ?? '?'

  return (
    <div className={styles.layout}>

      {/* ── Popups ── */}
      {!isAdmin && (
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
                    <span className={styles.toastType}>{t(`alerts.${toast.type}`)}</span>
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
      )}

      {/* ── HEADER ── */}
      <header className={styles.header}>
        <div className={styles.brand}>
          <span className={styles.brandMark}>STC·SM</span>
          <span className={styles.brandSub}>{t('header.brandSub')}</span>
        </div>

        {/* FOD status indicator — placeholder until wired to live tool data */}
        <div className={styles.fodWrap} />

        <div className={styles.headerRight}>
          <div className={styles.hStat}>
            <span className={styles.hStatVal}>{activeShifts.length}</span>
            <span className={styles.hStatKey}>{t('header.activeShifts')}</span>
          </div>
          <div className={styles.hDivider} />
          {/* ── NOTIFICATIONS BELL ── */}
          {!isAdmin && (
              <div className={styles.bellWrap}>
                <button
                    className={styles.bellBtn}
                    onClick={() => setIsBellOpen(!isBellOpen)}
                    title={t('header.notifications')}
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
                        <span>{t('alerts.title')}</span>
                        <span className={styles.bellCount}>{t('alerts.unread', { count: alerts.length })}</span>
                      </div>

                      <div className={styles.bellList}>
                        {alerts.length === 0 ? (
                            <div className={styles.bellEmpty}>{t('alerts.empty')}</div>
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
                                    <span className={styles.bellItemTitle}>{t(`alerts.${alert.type}`)}</span>
                                    <span className={styles.bellItemMsg}>{alert.message}</span>
                                  </div>
                                </div>
                            ))
                        )}
                      </div>
                    </div>
                )}
              </div>
          )}
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
            title={t('header.logout')}
            aria-label={t('header.logout')}
          >
            <LogOut size={14} />
          </button>
          <div className={styles.hDivider} />
          <div className={styles.clock}>
            <span className={styles.clockHms}>{hh}</span>
            <span className={styles.clockDate}>{dd}</span>
          </div>
        </div>
      </header>

      {/* ── SIDEBAR ── */}
      <aside className={styles.sidebar}>
        <nav className={styles.nav}>
          <span className={styles.navGroup}>{t('nav.operations')}</span>
          {NAV_PRIMARY.map(({ to, labelKey, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.navActive : ''}`
              }
            >
              <Icon size={15} />
              <span>{t(labelKey)}</span>
            </NavLink>
          ))}

          <span className={styles.navGroup}>{t('nav.system')}</span>
          {navSecondary.map(({ to, labelKey, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.navActive : ''}`
              }
            >
              <Icon size={15} />
              <span>{t(labelKey)}</span>
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
