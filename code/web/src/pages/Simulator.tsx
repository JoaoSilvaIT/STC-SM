import { useSimulator } from '@/context/SimulatorContext'
import type { CabinetSim, ToolSlot } from '@/context/SimulatorContext'
import styles from './Simulator.module.css'

export default function Simulator() {
  const { cabinets, toggleTool, toggleDoor, resetAll } = useSimulator()

  return (
    <div className={styles.page}>
      <div className={styles.pageHead}>
        <div>
          <h1 className={styles.pageTitle}>Cabinet Simulator</h1>
          <p className={styles.pageSub}>Click the door to open it · Click tools inside to remove or return them</p>
        </div>
        <button className={styles.resetBtn} onClick={resetAll}>Reset All</button>
      </div>
      <div className={styles.grid}>
        {cabinets.map(cs => (
          <CabinetPanel
            key={cs.cabinet.id}
            cs={cs}
            onToggleTool={toolId => toggleTool(cs.cabinet.id, toolId)}
            onToggleDoor={() => toggleDoor(cs.cabinet.id)}
          />
        ))}
      </div>
    </div>
  )
}

function CabinetPanel({ cs, onToggleTool, onToggleDoor }: {
  cs: CabinetSim
  onToggleTool: (toolId: number) => void
  onToggleDoor: () => void
}) {
  const interactive = cs.cabinet.status === 'OPEN'
  const isOpen = cs.door === 'OPEN'
  const removedCount = cs.slots.filter(s => !s.present).length

  const badgeCls =
    cs.cabinet.status === 'OPEN'   ? styles.badgeOnline :
    cs.cabinet.status === 'BROKEN' ? styles.badgeMaint  :
                                     styles.badgeOffline

  return (
    <div className={`${styles.panel} ${!interactive ? styles.panelInactive : ''}`}>
      {/* ── Header ── */}
      <div className={styles.panelHead}>
        <div>
          <div className={styles.panelName}>{cs.cabinet.name}</div>
          <div className={styles.panelLoc}>{cs.cabinet.location}</div>
        </div>
        <span className={badgeCls}>{cs.cabinet.status}</span>
      </div>

      {interactive ? (
        /* ── 3D Cabinet scene ── */
        <div className={styles.scene}>

          {/* Interior — always rendered, visible when door is open */}
          <div className={`${styles.interior} ${isOpen ? styles.interiorOpen : ''}`}>
            <div className={styles.interiorTop}>
              <span className={styles.interiorHint}>
                {isOpen ? 'Click a tool to remove or return it' : 'Open the door to interact'}
              </span>
              <div className={styles.interiorActions}>
                {removedCount > 0 && (
                  <span className={styles.removedBadge}>{removedCount} out</span>
                )}
                {isOpen && (
                  <button className={styles.closeDoorBtn} onClick={onToggleDoor}>
                    ← Close
                  </button>
                )}
              </div>
            </div>
            <div className={styles.slots}>
              {cs.slots.map(slot => (
                <SlotRow
                  key={slot.tool.id}
                  slot={slot}
                  disabled={!isOpen}
                  onToggle={() => onToggleTool(slot.tool.id)}
                />
              ))}
            </div>
          </div>

          {/* Door — rotates open on click */}
          <div
            className={`${styles.door} ${isOpen ? styles.doorOpen : ''}`}
            onClick={onToggleDoor}
            role="button"
            aria-label={isOpen ? 'Close door' : 'Open door'}
          >
            {/* Hinge side accent */}
            <div className={styles.doorHingeBar} />

            {/* Door face */}
            <div className={styles.doorFace}>
              <div className={styles.doorTop}>
                <span className={styles.doorId}>{cs.cabinet.name}</span>
              </div>

              <div className={styles.doorMid}>
                <div className={styles.doorVents}>
                  {[...Array(5)].map((_, i) => <div key={i} className={styles.vent} />)}
                </div>
                <div className={styles.doorHandle}>
                  <div className={styles.handleGrip} />
                </div>
              </div>

              <div className={styles.doorBottom}>
                <span className={styles.doorStatus}>
                  {isOpen ? '← CLOSE' : 'OPEN →'}
                </span>
              </div>
            </div>
          </div>

        </div>
      ) : (
        <div className={styles.inactiveBody}>
          <span className={styles.inactiveMsg}>{cs.cabinet.status} — not simulated</span>
        </div>
      )}
    </div>
  )
}

function SlotRow({ slot, disabled, onToggle }: {
  slot: ToolSlot
  disabled: boolean
  onToggle: () => void
}) {
  return (
    <button
      className={`${styles.slot} ${slot.present ? styles.slotPresent : styles.slotAbsent}`}
      onClick={onToggle}
      disabled={disabled}
      title={disabled ? 'Open door first' : slot.present ? 'Remove tool' : 'Return tool'}
    >
      <span className={`${styles.indicator} ${slot.present ? styles.indicatorOn : styles.indicatorOff}`} />
      <span className={styles.slotInfo}>
        <span className={styles.slotName}>{slot.tool.name}</span>
        <span className={styles.slotPart}>{slot.tool.partNumber}</span>
      </span>
      {!slot.present && <span className={styles.outTag}>OUT</span>}
    </button>
  )
}
