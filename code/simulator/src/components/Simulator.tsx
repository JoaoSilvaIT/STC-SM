import {useAuth} from "../context/AuthContext";
import { useState, useEffect, useRef} from 'react'
import type { Cabinet, Tool, CabinetStatus, ToolStatus} from '../types/domain'
import { listTools, updateTool } from '../api/tools'
import { listCabinets, updateCabinet } from '../api/cabinets'
import styles from './Simulator.module.css'
import { Client } from '@stomp/stompjs'

export interface CabinetSim {
    cabinet: Cabinet
    door: 'OPEN' | 'CLOSED'
    slots: ToolSlot[]
}

export interface ToolSlot {
    tool: Tool
    present: boolean
}

export default function Simulator() {
    const { user, logout } = useAuth()
    const [cabinets, setCabinets] = useState<Cabinet[]>([])
    const [tools, setTools] = useState<Tool[]>([])
    const [stompClient, setStompClient] = useState<Client | null >(null)


    useEffect(() => {
        // Load the initial data from the db
        const loadData = () => {
            Promise.all([listCabinets(), listTools()])
                .then(([c, t]) => {
                    setCabinets(c);
                    setTools(t);
                })
                .catch(err => console.error(err));
        };
        loadData();

        // Connects to the webSocket server of Spring Boot, listening for updates on cabinets and tools
        const client = new Client({
            brokerURL: (import.meta.env.VITE_WS_URL as string | undefined) ?? 'ws://localhost:8080/ws-simulator',
            onConnect: () => {
                // In case the backOffice puts the cabinet broken
                client.subscribe('/topic/cabinets', () => {
                    loadData();
                });
                client.subscribe('/topic/tools', () => {
                    loadData();
                })
            }
        });

        client.activate();
        setStompClient(client);

        return () => {
            client.deactivate();
        };
    }, []);

    const handleCabinet = async (data: {status: CabinetStatus, cabinetId: number }) => {
        try {
            if (stompClient && stompClient.connected) {
                const dataToSend = {
                    ...data,
                    userId: user?.id
                }
                // Sends the data to Spring Boot via WebSocket!
                stompClient.publish({
                    destination: '/app/cabinet/status',
                    body: JSON.stringify(dataToSend)
                });
            }
        } catch (err) {
            console.error(err)
        }
    }

    const handleTool = async (data: {status: ToolStatus, toolId: number }) => {
        try {
            if (stompClient && stompClient.connected) {
                const dataToSend = {
                    ...data,
                    userId: user?.id
                }
                // Sends the data to Spring Boot via WebSocket!
                stompClient.publish({
                    destination: '/app/tool/status',
                    body: JSON.stringify(dataToSend)
                });
            }
        } catch (err) {
            console.error(err)
        }
    }

    return (
        <div className={styles.page}>
            <div className={styles.pageHead}>
                <div>
                    <h1 className={styles.pageTitle}>Cabinet Simulator</h1>
                    <p className={styles.pageSub}>Click the door to open it · Click tools inside to remove or return them</p>
                </div>
            </div>
            <div className={styles.grid}>
                {cabinets.map(cab => {
                    const cabinetTools = tools.filter(t => t.cabinetId === cab.id);

                    const slots: ToolSlot[] = cabinetTools.map(t => ({
                        tool: t,
                        present: t.status === 'AVAILABLE'
                    }));

                    const cs: CabinetSim = {
                        cabinet: cab,
                        door: cab.status === 'OPEN' ? 'OPEN' : 'CLOSED',
                        slots: slots
                    };

                    return (<CabinetPanel
                        key={cab.id}
                        cs={cs}
                        onToggleDoor={handleCabinet}
                        onToggleTool={handleTool}
                    />)
                })}
            </div>
        </div>
    )
}

function CabinetPanel({ cs, onToggleTool, onToggleDoor }: {
    cs: CabinetSim
    onToggleTool: (data: {status: ToolStatus, toolId: number}) => void
    onToggleDoor: (data: {status: CabinetStatus, cabinetId: number}) => void
}) {
    const interactive = cs.cabinet.status === 'OPEN' || cs.cabinet.status === 'CLOSED'
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
                                    <button className={styles.closeDoorBtn} onClick={() => onToggleDoor({
                                        status: 'CLOSED', cabinetId: cs.cabinet.id
                                    })}>
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
                                        onToggle={() => onToggleTool({
                                            status: slot.present ? 'IN_USE' : 'AVAILABLE',
                                            toolId: slot.tool.id
                                        })}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Door — rotates open on click */}
                        <div
                            className={`${styles.door} ${isOpen ? styles.doorOpen : ''}`}
                            onClick={() => onToggleDoor({
                                status: isOpen ? 'CLOSED' : 'OPEN',
                                cabinetId: cs.cabinet.id
                            })}
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

