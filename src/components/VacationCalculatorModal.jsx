import { useState, useRef } from 'react'
import { useApp } from '../context/AppContext'
import { COLORS, BTN_STYLE, CalendarRange } from '../ds/index'

const DAYS_PER_MONTH = 2.33
const MONTH_GEN = ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря']

function fullMonthsBetween(start, end) {
  if (!start || !end || end <= start) return 0
  let months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth())
  if (end.getDate() < start.getDate()) months -= 1
  return Math.max(0, months)
}

function pluralDays(n) {
  if (n % 10 === 1 && n % 100 !== 11) return 'день'
  if (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)) return 'дня'
  return 'дней'
}

function pluralMonths(n) {
  if (n % 10 === 1 && n % 100 !== 11) return 'месяц'
  if (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)) return 'месяца'
  return 'месяцев'
}

function fmtDate(d) {
  if (!d) return ''
  return `${d.getDate()} ${MONTH_GEN[d.getMonth()]} ${d.getFullYear()}`
}

export default function VacationCalculatorModal({ onClose }) {
  const { balance } = useApp()
  const [targetDate, setTargetDate] = useState(null)
  const [showCalendar, setShowCalendar] = useState(false)
  const [calendarRect, setCalendarRect] = useState(null)
  const fieldRef = useRef(null)

  const today = new Date(); today.setHours(0, 0, 0, 0)
  const isValid = !!targetDate && targetDate > today

  const additionalMonths = isValid ? fullMonthsBetween(today, targetDate) : 0
  const additionalDays = Math.floor(additionalMonths * DAYS_PER_MONTH)
  const total = (balance.main ?? 0) + additionalDays

  function openCalendar() {
    const rect = fieldRef.current?.getBoundingClientRect()
    setCalendarRect(rect)
    setShowCalendar(true)
  }

  return (
    <>
      <div
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        onClick={onClose}
      >
        <div
          onClick={e => e.stopPropagation()}
          style={{ width: 480, background: '#fff', borderRadius: 32, display: 'flex', flexDirection: 'column', overflow: 'hidden', fontFamily: "'MTSCompact', sans-serif" }}
        >
          {/* Header */}
          <div style={{ padding: '28px 28px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            <div style={{ fontSize: 20, fontWeight: 500, fontFamily: "'MTSWide', sans-serif", color: '#1D2023', lineHeight: '24px' }}>
              Калькулятор отпуска
            </div>
            <button onClick={onClose} style={{ padding: 4, border: 'none', background: '#F2F3F7', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 12, flexShrink: 0 }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M6.29289 16.2929C5.90237 16.6834 5.90237 17.3166 6.29289 17.7071C6.68342 18.0976 7.31658 18.0976 7.70711 17.7071L11.9999 13.4143L16.2929 17.7073C16.6834 18.0978 17.3166 18.0978 17.7071 17.7073C18.0976 17.3167 18.0976 16.6836 17.7071 16.293L13.4141 12.0001L17.7071 7.70711C18.0976 7.31658 18.0976 6.68342 17.7071 6.29289C17.3166 5.90237 16.6834 5.90237 16.2929 6.29289L11.9999 10.5859L7.70711 6.29304C7.31658 5.90252 6.68342 5.90252 6.2929 6.29304C5.90237 6.68357 5.90237 7.31673 6.29289 7.70726L10.5857 12.0001L6.29289 16.2929Z" fill="#1D2023"/>
              </svg>
            </button>
          </div>

          {/* Body */}
          <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ color: '#626C77', fontSize: 14, fontFamily: "'MTSCompact', sans-serif", fontWeight: 400, lineHeight: '20px' }}>
              Расчёт ведётся от текущего остатка отпуска. За каждый полный месяц начисляется {DAYS_PER_MONTH.toString().replace('.', ',')} календарных дня.
            </div>

            {/* Current balance */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ color: '#626C77', fontSize: 14, fontFamily: "'MTSCompact', sans-serif", fontWeight: 400, lineHeight: '20px' }}>
                Текущий остаток
              </div>
              <div style={{ color: '#1D2023', fontSize: 20, fontFamily: "'MTSCompact', sans-serif", fontWeight: 500, lineHeight: '24px' }}>
                {balance.main ?? 0} {pluralDays(balance.main ?? 0)}
              </div>
            </div>

            {/* Date picker field */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ color: '#626C77', fontSize: 14, fontFamily: "'MTSCompact', sans-serif", fontWeight: 400, lineHeight: '20px' }}>
                Рассчитать на дату
              </div>
              <div
                ref={fieldRef}
                onClick={openCalendar}
                style={{
                  height: 44,
                  paddingLeft: 12,
                  paddingRight: 8,
                  background: '#F2F3F7',
                  borderRadius: 16,
                  outline: '1px rgba(188, 195, 208, 0.50) solid',
                  outlineOffset: '-1px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  cursor: 'pointer',
                  boxSizing: 'border-box',
                }}
              >
                <div style={{ flex: '1 1 0', overflow: 'hidden' }}>
                  <div style={{ color: targetDate ? '#1D2023' : '#8C9BAB', fontSize: 17, fontFamily: "'MTSCompact', sans-serif", fontWeight: 400, lineHeight: '24px' }}>
                    {targetDate ? fmtDate(targetDate) : 'дд месяц гггг'}
                  </div>
                </div>
                <div style={{ padding: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="20" viewBox="0 0 18 20" fill="none">
                    <path fillRule="evenodd" clipRule="evenodd" d="M16.314 3.68597C15.609 2.98098 14.9055 2.62649 14 2.41921V1C14 0.447715 13.5523 0 13 0C12.4477 0 12 0.447715 12 1V2.15211C11.7111 2.12824 11.4044 2.10541 11.0772 2.08105C10.399 2.03058 9.69952 2 9 2C8.30048 2 7.60086 2.03059 6.92273 2.08106C6.59555 2.10541 6.28883 2.12824 6 2.15211V1C6 0.447715 5.55228 0 5 0C4.44772 0 4 0.447715 4 1V2.41921C3.09454 2.62649 2.39096 2.98098 1.68597 3.68597C0.373095 4.99884 0.275748 6.30684 0.0810531 8.92282C0.0305833 9.60095 0 10.3005 0 11C0 11.6995 0.0305834 12.399 0.0810532 13.0772C0.275748 15.6932 0.373095 17.0012 1.68597 18.314C2.99884 19.6269 4.30684 19.7243 6.92282 19.9189C7.60095 19.9694 8.30048 20 9 20C9.69952 20 10.399 19.9694 11.0772 19.9189C13.6932 19.7243 15.0012 19.6269 16.314 18.314C17.6269 17.0012 17.7243 15.6932 17.9189 13.0772C17.9694 12.399 18 11.6995 18 11C18 10.3005 17.9694 9.60095 17.9189 8.92282C17.7243 6.30684 17.6269 4.99884 16.314 3.68597ZM2.99706 8C2.44477 8 1.99706 8.44771 1.99706 9C1.99706 9.55228 2.44477 10 2.99706 10H14.9971C15.5493 10 15.9971 9.55228 15.9971 9C15.9971 8.44771 15.5493 8 14.9971 8H2.99706ZM11.9971 15.4C12.7703 15.4 13.3971 14.7732 13.3971 14C13.3971 13.2268 12.7703 12.6 11.9971 12.6C11.2239 12.6 10.5971 13.2268 10.5971 14C10.5971 14.7732 11.2239 15.4 11.9971 15.4Z" fill="#8D969F"/>
                  </svg>
                </div>
              </div>
              {targetDate && !isValid && (
                <span style={{ fontSize: 12, color: '#E30611', paddingLeft: 4 }}>Дата должна быть позже сегодняшней</span>
              )}
            </div>

            {/* Result */}
            {isValid && (
              <div style={{ background: '#F2F3F7', borderRadius: 16, padding: 16, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ color: '#626C77', fontSize: 14, fontFamily: "'MTSCompact', sans-serif", fontWeight: 400, lineHeight: '20px' }}>
                  К выбранной дате накопится
                </span>
                <span style={{ color: '#1D2023', fontSize: 24, fontFamily: "'MTSWide', sans-serif", fontWeight: 500, lineHeight: '28px' }}>
                  {total} {pluralDays(total)}
                </span>
                {additionalDays > 0 && (
                  <span style={{ color: '#626C77', fontSize: 12, fontFamily: "'MTSCompact', sans-serif", lineHeight: '16px' }}>
                    {balance.main ?? 0} сейчас + {additionalDays} накопится за {additionalMonths} {pluralMonths(additionalMonths)}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={{ padding: '0 28px 28px' }}>
            <button onClick={onClose} style={{ ...BTN_STYLE, height: 44, width: '100%', border: 'none', borderRadius: 16, cursor: 'pointer', background: COLORS.bg, color: '#1D2023' }}>
              Закрыть
            </button>
          </div>
        </div>
      </div>

      {/* Calendar dropdown — rendered outside the modal overlay to avoid z-index stacking */}
      {showCalendar && calendarRect && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 600 }}
          onClick={() => setShowCalendar(false)}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ position: 'fixed', top: calendarRect.bottom + 4, left: calendarRect.left }}
          >
            <CalendarRange
              initialStart={targetDate}
              onApply={(start) => {
                setTargetDate(start)
                setShowCalendar(false)
              }}
              onClose={() => setShowCalendar(false)}
            />
          </div>
        </div>
      )}
    </>
  )
}
