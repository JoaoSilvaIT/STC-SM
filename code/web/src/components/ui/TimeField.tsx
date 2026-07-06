import { useEffect, useState } from 'react'
import { usePrefs } from '@/context/PrefsContext'

interface TimeFieldProps {
  value:           string   // canonical 24h "HH:mm", or '' when unset
  onChange:        (v: string) => void
  className?:      string   // applied to each <select> (e.g. styles.input)
  error?:          boolean
  errorClassName?: string
  minuteStep?:     number   // minutes granularity in the dropdown (default 5)
}

const pad = (n: number) => n.toString().padStart(2, '0')

export default function TimeField({
                                    value, onChange, className = '', error, errorClassName = '', minuteStep = 5,
                                  }: TimeFieldProps) {
  const { clockFormat } = usePrefs()
  const is12h = clockFormat === '12h'

  // Local parts let the user pick hour before minute without losing the selection.
  const [hour,   setHour]   = useState('')   // 24h hour "0".."23" or ''
  const [minute, setMinute] = useState('')   // "0".."59" or ''

  // Sync down from the parent only when it actually differs (e.g. drawer opens / resets).
  useEffect(() => {
    const canonical = hour !== '' && minute !== '' ? `${pad(Number(hour))}:${pad(Number(minute))}` : ''
    if (value === canonical) return
    if (value) {
      const [h, m] = value.split(':')
      setHour(String(Number(h)))
      setMinute(String(Number(m)))
    } else {
      setHour('')
      setMinute('')
    }
  }, [value])

  const emit = (h: string, m: string) =>
    onChange(h !== '' && m !== '' ? `${pad(Number(h))}:${pad(Number(m))}` : '')

  const changeHour = (h: string) => { setHour(h); emit(h, minute) }
  const changeMinute = (m: string) => { setMinute(m); emit(hour, m) }

  // 12h derived view
  const hnum   = hour === '' ? null : Number(hour)
  const period = hnum === null ? 'AM' : hnum < 12 ? 'AM' : 'PM'
  const hour12 = hnum === null ? '' : String(hnum % 12 === 0 ? 12 : hnum % 12)

  const changeFrom12h = (h12: string, per: string) => {
    if (h12 === '') { changeHour(''); return }
    let h = Number(h12) % 12
    if (per === 'PM') h += 12
    changeHour(String(h))
  }

  const minutes = Array.from({ length: Math.ceil(60 / minuteStep) }, (_, i) => i * minuteStep)
  const cls = `${className} ${error ? errorClassName : ''}`
  const selStyle = { flex: 1, minWidth: 0 }

  return (
      <div style={{ display: 'flex', gap: 8 }}>
        {is12h ? (
            <>
              <select className={cls} style={selStyle} value={hour12}
                      onChange={e => changeFrom12h(e.target.value, period)}>
                <option value="">--</option>
                {Array.from({ length: 12 }, (_, i) => i + 1).map(h => (
                    <option key={h} value={h}>{pad(h)}</option>
                ))}
              </select>
              <select className={cls} style={selStyle} value={minute}
                      onChange={e => changeMinute(e.target.value)}>
                <option value="">--</option>
                {minutes.map(m => (
                    <option key={m} value={m}>{pad(m)}</option>
                ))}
              </select>
              <select className={cls} style={selStyle} value={period}
                      onChange={e => changeFrom12h(hour12, e.target.value)}>
                <option value="AM">AM</option>
                <option value="PM">PM</option>
              </select>
            </>
        ) : (
            <>
              <select className={cls} style={selStyle} value={hour}
                      onChange={e => changeHour(e.target.value)}>
                <option value="">--</option>
                {Array.from({ length: 24 }, (_, i) => i).map(h => (
                    <option key={h} value={h}>{pad(h)}</option>
                ))}
              </select>
              <select className={cls} style={selStyle} value={minute}
                      onChange={e => changeMinute(e.target.value)}>
                <option value="">--</option>
                {minutes.map(m => (
                    <option key={m} value={m}>{pad(m)}</option>
                ))}
              </select>
            </>
        )}
      </div>
  )
}
