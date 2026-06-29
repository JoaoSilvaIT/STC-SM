import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, UserPlus, Shield, User, Briefcase } from 'lucide-react'
import { createUser, listUsers, updateUserState } from '@/api/users'
import { ApiError } from '@/api/client'
import type { User as UserType, UserRole } from '@/types/domain'
import UserDrawer from '@/components/ui/UserDrawer'
import styles from './Users.module.css'

type RoleFilter = UserRole | 'ALL'

export default function Users() {
  const { t } = useTranslation()
  const [users,        setUsers]        = useState<UserType[]>([])
  const [loading,      setLoading]      = useState(true)
  const [loadError,    setLoadError]    = useState<string | null>(null)
  const [drawerMode,   setDrawerMode]   = useState<'closed' | 'create' | 'edit'>('closed')
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null)
  const [search,       setSearch]       = useState('')
  const [roleFilter,   setRoleFilter]   = useState<RoleFilter>('ALL')
  const [showInactive, setShowInactive] = useState(false)

  const refresh = async () => {
    const u = await listUsers()
    setUsers(u)
  }

  useEffect(() => {
    let cancelled = false
    refresh()
      .catch(err => {
        if (cancelled) return
        setLoadError(err instanceof ApiError ? err.message : 'Failed to load users')
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return users.filter(u => {
      if (!showInactive && !u.isActive)                                                  return false
      if (roleFilter !== 'ALL' && u.role !== roleFilter)                                 return false
      if (q && !u.name.toLowerCase().includes(q) && !u.email.toLowerCase().includes(q)) return false
      return true
    })
  }, [users, search, roleFilter, showInactive])

  const counts = {
    ALL:      users.length,
    ADMIN:    users.filter(u => u.role === 'ADMIN').length,
    MECHANIC: users.filter(u => u.role === 'MECHANIC').length,
    BACK_OFFICE: users.filter(u => u.role === 'BACK_OFFICE').length,
  }

  const handleSave = async (data: { name: string; email: string; role: UserRole; password?: string }) => {
    setLoadError(null)
    try {
      if (drawerMode === 'create') {
        if (!data.password) { setLoadError(t('users.passwordRequired')); return }
        await createUser({
          name: data.name,
          email: data.email,
          password: data.password,
          role: data.role,
        })
      }
      // Note: backend doesn't expose name/email/role updates — only state. The
      // edit drawer fields for those are display-only until the backend exposes
      // a richer PUT.
      await refresh()
      closeDrawer()
    } catch (err) {
      setLoadError(err instanceof ApiError ? err.message : 'Failed to save user')
    }
  }

  const handleDeactivate = async (id: number) => {
    setLoadError(null)
    const target = users.find(u => u.id === id)
    if (!target) return
    const nextState = target.isActive ? 'INACTIVE' : 'ACTIVE'
    try {
      await updateUserState(id, nextState)
      await refresh()
      closeDrawer()
    } catch (err) {
      setLoadError(err instanceof ApiError ? err.message : 'Failed to update user')
    }
  }

  const openEdit = (user: UserType) => {
    setSelectedUser(user)
    setDrawerMode('edit')
  }

  const closeDrawer = () => {
    setDrawerMode('closed')
    setSelectedUser(null)
  }

  const activeCount   = users.filter(u => u.isActive).length
  const inactiveCount = users.filter(u => !u.isActive).length

  return (
    <div className={styles.page}>
      <div className={styles.pageHead}>
        <div>
          <h1 className={styles.pageTitle}>{t('users.title')}</h1>
          <p className={styles.pageSubtitle}>
            {loading
              ? t('users.loading')
              : loadError
                ? loadError
                : `${t('users.subtitle', { active: activeCount })}${inactiveCount > 0 ? ` · ${t('users.inactiveSuffix', { count: inactiveCount })}` : ''}`}
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.filters}>
          {(['ALL', 'MECHANIC', 'ADMIN', 'BACK_OFFICE'] as const).map(r => (
            <button
              key={r}
              className={`${styles.filterBtn} ${roleFilter === r ? styles.filterActive : ''}`}
              onClick={() => setRoleFilter(r)}
            >
              {t(`roles.${r}`)}
              <span className={styles.filterCount}>{counts[r]}</span>
            </button>
          ))}
          <button
            className={`${styles.filterBtn} ${showInactive ? styles.filterActive : ''}`}
            onClick={() => setShowInactive(v => !v)}
          >
            {t('users.showInactive')}
          </button>
        </div>

        <div className={styles.toolbarRight}>
          <div className={styles.searchBox}>
            <Search size={13} className={styles.searchIcon} />
            <input
              type="text"
              placeholder={t('users.searchPlaceholder')}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          <button className={styles.addBtn} onClick={() => setDrawerMode('create')}>
            <UserPlus size={13} />
            {t('users.addUser')}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>{t('users.colName')}</th>
              <th>{t('users.colEmail')}</th>
              <th>{t('users.colRole')}</th>
              <th>{t('users.colStatus')}</th>
              <th>{t('users.colActions')}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className={styles.empty}>{t('users.noMatch')}</td>
              </tr>
            ) : filtered.map(user => (
              <tr
                key={user.id}
                className={`${styles.row} ${!user.isActive ? styles.rowInactive : ''}`}
              >
                <td>
                  <div className={styles.nameCell}>
                    <div className={`${styles.avatar} ${user.role === 'ADMIN' ? styles.avatarAdmin : ''}`}>
                      {user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <span className={styles.userName}>{user.name}</span>
                  </div>
                </td>
                <td className={styles.email}>{user.email}</td>
                <td><RoleBadge role={user.role} /></td>
                <td><StatusPill isActive={user.isActive} /></td>
                <td>
                  <button className={styles.editBtn} onClick={() => openEdit(user)}>
                    {t('users.edit')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className={styles.tableFooter}>
        {t('users.showing', { shown: filtered.length, total: users.length })}
      </div>

      <UserDrawer
        mode={drawerMode}
        user={selectedUser}
        onSave={handleSave}
        onClose={closeDrawer}
        onDeactivate={handleDeactivate}
      />
    </div>
  )
}

function RoleBadge({ role }: { role: UserRole }) {
  const { t } = useTranslation()
  return (
    <span className={`${styles.roleBadge} ${role === 'ADMIN' ? styles.roleAdmin : role === 'BACK_OFFICE' ? styles.roleBack : styles.roleMech}`}>
      {role === 'ADMIN' ? <Shield size={10} /> : role === 'BACK_OFFICE' ? <Briefcase size={10} /> : <User size={10} />}
      {t(`roles.${role}`)}
    </span>
  )
}

function StatusPill({ isActive }: { isActive: boolean }) {
  const { t } = useTranslation()
  return (
    <span className={`${styles.pill} ${isActive ? styles.pillActive : styles.pillInactive}`}>
      {t(`status.${isActive ? 'ACTIVE' : 'INACTIVE'}`)}
    </span>
  )
}
