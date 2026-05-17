import { useEffect, useMemo, useState } from 'react'
import { Search, AlertTriangle, Plus, Pencil } from 'lucide-react'
import { createTool, listTools, updateTool } from '@/api/tools'
import { listCabinets } from '@/api/cabinets'
import { ApiError } from '@/api/client'
import ToolDrawer from '@/components/ui/ToolDrawer'
import type { Cabinet, Tool, ToolStatus } from '@/types/domain'
import styles from './Inventory.module.css'

const STATUS_FILTERS: Array<ToolStatus | 'ALL'> = ['ALL', 'AVAILABLE', 'IN_USE', 'MISSING', 'MAINTENANCE']

export default function Inventory() {
  const [tools,          setTools]          = useState<Tool[]>([])
  const [liveCabinets,   setLiveCabinets]   = useState<Cabinet[]>([])
  const [loading,        setLoading]        = useState(true)
  const [loadError,      setLoadError]      = useState<string | null>(null)
  const [search,         setSearch]         = useState('')
  const [statusF,        setStatusF]        = useState<ToolStatus | 'ALL'>('ALL')
  const [cabinetF,       setCabinetF]       = useState<number | 'ALL'>('ALL')
  const [drawerMode,     setDrawerMode]     = useState<'closed' | 'create' | 'edit'>('closed')
  const [selectedTool,   setSelectedTool]   = useState<Tool | null>(null)

  useEffect(() => {
    let cancelled = false
    Promise.all([listTools(), listCabinets()])
      .then(([t, c]) => { if (!cancelled) { setTools(t); setLiveCabinets(c) } })
      .catch(err => {
        if (cancelled) return
        setLoadError(err instanceof ApiError ? err.message : 'Failed to load inventory')
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return tools.filter(t => {
      if (statusF !== 'ALL' && t.status !== statusF) return false
      if (cabinetF !== 'ALL' && t.cabinetId !== cabinetF) return false
      if (q && !t.name.toLowerCase().includes(q) && !t.partNumber.toLowerCase().includes(q)) return false
      return true
    })
  }, [tools, search, statusF, cabinetF])

  const counts = {
    ALL:         tools.length,
    AVAILABLE:   tools.filter(t => t.status === 'AVAILABLE').length,
    IN_USE:      tools.filter(t => t.status === 'IN_USE').length,
    MISSING:     tools.filter(t => t.status === 'MISSING').length,
    MAINTENANCE: tools.filter(t => t.status === 'MAINTENANCE').length,
  }

  const refresh = async () => {
    const [t, c] = await Promise.all([listTools(), listCabinets()])
    setTools(t); setLiveCabinets(c)
  }

  const handleSave = async (data: { name: string; partNumber: string; cabinetId: number; status: ToolStatus }) => {
    setLoadError(null)
    if (drawerMode === 'create') {
      const cabinet = liveCabinets.find(c => c.id === data.cabinetId)
      if (!cabinet) throw new Error('Pick a valid cabinet first')
      await createTool({
        name: data.name,
        cabinetId: data.cabinetId,
        status: data.status,
        location: cabinet.location,
      })
    } else if (drawerMode === 'edit' && selectedTool) {
      await updateTool(selectedTool.id, data.status)
    }
    await refresh()
    closeDrawer()
  }

  const handleDeactivate = async (id: number) => {
    setLoadError(null)
    try {
      // Backend has no soft-delete for tools yet; mark as MAINTENANCE as the
      // closest available state.
      await updateTool(id, 'MAINTENANCE')
      await refresh()
      closeDrawer()
    } catch (err) {
      setLoadError(err instanceof ApiError ? err.message : 'Failed to update tool')
    }
  }

  const openEdit = (tool: Tool) => {
    setSelectedTool(tool)
    setDrawerMode('edit')
  }

  const closeDrawer = () => {
    setDrawerMode('closed')
    setSelectedTool(null)
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHead}>
        <div>
          <h1 className={styles.pageTitle}>Tool Inventory</h1>
          <p className={styles.pageSubtitle}>
            {loading ? 'Loading inventory…' : loadError ? loadError : `Asset registry · ${tools.length} tracked items`}
          </p>
        </div>
        <button className={styles.addBtn} onClick={() => setDrawerMode('create')}>
          <Plus size={13} /> Add Tool
        </button>
      </div>

      {/* FOD alert banner */}
      {counts.MISSING > 0 && (
        <div className={styles.fodBanner}>
          <AlertTriangle size={15} strokeWidth={2.5} />
          <span>
            <strong>{counts.MISSING} tool{counts.MISSING !== 1 ? 's' : ''}</strong> currently unaccounted — FOD risk is active
          </span>
        </div>
      )}

      {/* Filters */}
      <div className={styles.toolbar}>
        <div className={styles.statusFilters}>
          {STATUS_FILTERS.map(s => (
            <button
              key={s}
              className={`${styles.filterBtn} ${statusF === s ? styles.filterActive : ''} ${s === 'MISSING' ? styles.filterMissing : ''}`}
              onClick={() => setStatusF(s)}
            >
              {s === 'ALL' ? 'All' : s.replace('_', ' ')}
              <span className={styles.filterCount}>
                {s === 'ALL' ? counts.ALL : counts[s as ToolStatus]}
              </span>
            </button>
          ))}
        </div>

        <div className={styles.toolbarRight}>
          <select
            className={styles.select}
            value={cabinetF}
            onChange={e => setCabinetF(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
          >
            <option value="ALL">All Cabinets</option>
            {liveCabinets.map(c => (
              <option key={c.id} value={c.id}>{c.name} — {c.location}</option>
            ))}
          </select>

          <div className={styles.searchBox}>
            <Search size={13} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search name or part no…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className={styles.searchInput}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Part No.</th>
              <th>Tool Name</th>
              <th>Cabinet</th>
              <th>Location</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className={styles.empty}>No tools match the current filters</td>
              </tr>
            ) : filtered.map(tool => {
              const cab = liveCabinets.find(c => c.id === tool.cabinetId)
              return (
                <tr
                  key={tool.id}
                  className={`${styles.row} ${tool.status === 'MISSING' ? styles.rowMissing : ''}`}
                >
                  <td className={styles.mono}>{tool.partNumber}</td>
                  <td className={styles.toolName}>
                    {tool.status === 'MISSING' && <AlertTriangle size={11} className={styles.rowAlert} />}
                    {tool.name}
                  </td>
                  <td className={styles.mono}>{cab?.name ?? '—'}</td>
                  <td className={styles.location}>{cab?.location ?? '—'}</td>
                  <td><StatusPill status={tool.status} /></td>
                  <td className={styles.actionCell}>
                    <button className={styles.editBtn} onClick={() => openEdit(tool)} title="Edit tool">
                      <Pencil size={12} />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <div className={styles.tableFooter}>
        Showing {filtered.length} of {tools.length} tools
      </div>

      <ToolDrawer
        mode={drawerMode}
        tool={selectedTool}
        cabinets={liveCabinets}
        onSave={handleSave}
        onClose={closeDrawer}
        onDeactivate={handleDeactivate}
      />
    </div>
  )
}

function StatusPill({ status }: { status: Tool['status'] }) {
  const cls = {
    AVAILABLE:   styles.pillAvail,
    IN_USE:      styles.pillInUse,
    MISSING:     styles.pillMissing,
    MAINTENANCE: styles.pillMaint,
  }[status]
  return <span className={`${styles.pill} ${cls}`}>{status.replace('_', ' ')}</span>
}
