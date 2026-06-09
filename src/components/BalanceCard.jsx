import { useState, useRef } from 'react'
import { useApp } from '../context/AppContext'
import { COLORS, CalendarRange } from '../ds/index'

const TODAY = new Date()
TODAY.setHours(0, 0, 0, 0)

function fullMonthsBetween(from, to) {
  if (to <= from) return 0
  let months = (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth())
  if (to.getDate() < from.getDate()) months -= 1
  return Math.max(0, months)
}

function fmt(d) {
  if (!d) return ''
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
}

const CalcIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none">
    <rect x="3" y="3" width="18" height="18" rx="3" stroke="#0066FF" strokeWidth="1.6"/>
    <path d="M8 8h2M14 8h2M8 12h2M14 12h2M8 16h2M14 16h2" stroke="#0066FF" strokeWidth="1.6" strokeLinecap="round"/>
  </svg>
)

export default function BalanceCard() {
  const { balance } = useApp()
  const [showCalc, setShowCalc] = useState(false)
  const [targetDate, setTargetDate] = useState(null)
  const [showCalendar, setShowCalendar] = useState(false)
  const [calendarRect, setCalendarRect] = useState(null)
  const triggerRef = useRef(null)

  const months = targetDate ? fullMonthsBetween(TODAY, targetDate) : 0
  const accrued = Math.round(months * 2.33 * 10) / 10
  const projected = balance.main + accrued

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Основной */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 14, color: COLORS.secondary, fontFamily: "'MTSCompact', sans-serif" }}>
            Основной оплачиваемый
          </span>
          <button
            onClick={() => setShowCalc(v => !v)}
            style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
            title="Калькулятор накопления"
          >
            <CalcIcon />
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
          <span style={{ fontSize: 24, fontWeight: 700, color: COLORS.text, fontFamily: "'MTSWide', sans-serif" }}>{balance.main}</span>
          <span style={{ fontSize: 14, color: COLORS.secondary, fontFamily: "'MTSCompact', sans-serif" }}>дн.</span>
        </div>
      </div>

      {/* Калькулятор */}
      {showCalc && (
        <div style={{ background: COLORS.bg, borderRadius: 16, padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <span style={{ fontSize: 13, color: COLORS.secondary, fontFamily: "'MTSCompact', sans-serif" }}>
            Сколько дней накопится к дате
          </span>

          {/* Date trigger */}
          <div
            ref={triggerRef}
            onClick={() => {
              setCalendarRect(triggerRef.current?.getBoundingClientRect())
              setShowCalendar(true)
            }}
            style={{
              height: 44, paddingLeft: 12, paddingRight: 8, background: '#fff',
              borderRadius: 12, outline: '1px rgba(188,195,208,0.50) solid', outlineOffset: '-1px',
              display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', boxSizing: 'border-box',
            }}
          >
            <span style={{ flex: 1, fontSize: 15, color: targetDate ? COLORS.text : COLORS.hint, fontFamily: "'MTSCompact', sans-serif" }}>
              {targetDate ? fmt(targetDate) : 'Выберите дату'}
            </span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="18" viewBox="0 0 18 20" fill="none">
              <path fillRule="evenodd" clipRule="evenodd" d="M16.314 3.68597C15.609 2.98098 14.9055 2.62649 14 2.41921V1C14 0.447715 13.5523 0 13 0C12.4477 0 12 0.447715 12 1V2.15211C11.7111 2.12824 11.4044 2.10541 11.0772 2.08105C10.399 2.03058 9.69952 2 9 2C8.30048 2 7.60086 2.03059 6.92273 2.08106C6.59555 2.10541 6.28883 2.12824 6 2.15211V1C6 0.447715 5.55228 0 5 0C4.44772 0 4 0.447715 4 1V2.41921C3.09454 2.62649 2.39096 2.98098 1.68597 3.68597C0.373095 4.99884 0.275748 6.30684 0.0810531 8.92282C0.0305833 9.60095 0 10.3005 0 11C0 11.6995 0.0305834 12.399 0.0810532 13.0772C0.275748 15.6932 0.373095 17.0012 1.68597 18.314C2.99884 19.6269 4.30684 19.7243 6.92282 19.9189C7.60095 19.9694 8.30048 20 9 20C9.69952 20 10.399 19.9694 11.0772 19.9189C13.6932 19.7243 15.0012 19.6269 16.314 18.314C17.6269 17.0012 17.7243 15.6932 17.9189 13.0772C17.9694 12.399 18 11.6995 18 11C18 10.3005 17.9694 9.60095 17.9189 8.92282C17.7243 6.30684 17.6269 4.99884 16.314 3.68597ZM2.99706 8C2.44477 8 1.99706 8.44771 1.99706 9C1.99706 9.55228 2.44477 10 2.99706 10H14.9971C15.5493 10 15.9971 9.55228 15.9971 9C15.9971 8.44771 15.5493 8 14.9971 8H2.99706ZM11.9971 15.4C12.7703 15.4 13.3971 14.7732 13.3971 14C13.3971 13.2268 12.7703 12.6 11.9971 12.6C11.2239 12.6 10.5971 13.2268 10.5971 14C10.5971 14.7732 11.2239 15.4 11.9971 15.4Z" fill="#8D969F"/>
            </svg>
          </div>

          {/* Result */}
          {targetDate && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTop: `1px solid ${COLORS.stroke}` }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ fontSize: 13, color: COLORS.secondary, fontFamily: "'MTSCompact', sans-serif" }}>
                  Накопится к {fmt(targetDate)}
                </span>
                <span style={{ fontSize: 12, color: COLORS.hint, fontFamily: "'MTSCompact', sans-serif" }}>
                  {balance.main} сейчас + {accrued} за {months} мес.
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <span style={{ fontSize: 24, fontWeight: 700, color: COLORS.blue, fontFamily: "'MTSWide', sans-serif" }}>
                  {projected % 1 === 0 ? projected : projected.toFixed(1)}
                </span>
                <span style={{ fontSize: 14, color: COLORS.secondary, fontFamily: "'MTSCompact', sans-serif" }}>дн.</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Дополнительный */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTop: `1px solid ${COLORS.stroke}` }}>
        <span style={{ fontSize: 14, color: COLORS.secondary, fontFamily: "'MTSCompact', sans-serif" }}>Дополнительный</span>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
          <span style={{ fontSize: 24, fontWeight: 700, color: COLORS.text, fontFamily: "'MTSWide', sans-serif" }}>{balance.extra}</span>
          <span style={{ fontSize: 14, color: COLORS.secondary, fontFamily: "'MTSCompact', sans-serif" }}>дн.</span>
        </div>
      </div>

      {/* Calendar dropdown */}
      {showCalendar && calendarRect && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 600 }} onClick={() => setShowCalendar(false)}>
          <div
            onClick={e => e.stopPropagation()}
            style={{ position: 'fixed', top: calendarRect.bottom + 4, left: calendarRect.left }}
          >
            <CalendarRange
              initialStart={targetDate}
              initialEnd={targetDate}
              onApply={(s) => { setTargetDate(s) }}
              onClose={() => setShowCalendar(false)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
