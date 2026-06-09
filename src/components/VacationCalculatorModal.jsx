import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { COLORS, BTN_STYLE } from '../ds/index'

const DAYS_PER_MONTH = 2.33

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

export default function VacationCalculatorModal({ onClose }) {
  const { balance } = useApp()
  const [targetDate, setTargetDate] = useState('')

  const today = new Date(); today.setHours(0, 0, 0, 0)
  const end = targetDate ? new Date(targetDate + 'T00:00:00') : null
  const isValid = !!end && end > today

  const additionalMonths = isValid ? fullMonthsBetween(today, end) : 0
  const additionalDays = Math.floor(additionalMonths * DAYS_PER_MONTH)
  const total = (balance.main ?? 0) + additionalDays

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width: 480, background: '#fff', borderRadius: 32, display: 'flex', flexDirection: 'column', overflow: 'hidden', fontFamily: "'MTSCompact', sans-serif" }}>

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

          {/* Target date */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ color: '#626C77', fontSize: 14, fontFamily: "'MTSCompact', sans-serif", fontWeight: 400, lineHeight: '20px' }}>
              Рассчитать на дату
            </div>
            <input
              type="date"
              value={targetDate}
              onChange={e => setTargetDate(e.target.value)}
              style={{
                height: 44,
                paddingLeft: 12,
                paddingRight: 12,
                background: '#F2F3F7',
                borderRadius: 16,
                outline: '1px rgba(188, 195, 208, 0.50) solid',
                outlineOffset: '-1px',
                border: 'none',
                color: '#1D2023',
                fontSize: 17,
                fontFamily: "'MTSCompact', sans-serif",
                boxSizing: 'border-box',
                width: '100%',
              }}
            />
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
                  {balance.main ?? 0} сейчас + {additionalDays} накопится за {additionalMonths} {additionalMonths % 10 === 1 && additionalMonths % 100 !== 11 ? 'месяц' : additionalMonths % 10 >= 2 && additionalMonths % 10 <= 4 && (additionalMonths % 100 < 10 || additionalMonths % 100 >= 20) ? 'месяца' : 'месяцев'}
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
  )
}
