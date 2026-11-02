import { useState, useRef } from 'react'
import { useApp } from '../context/AppContext'
import { CalendarSingle, Drawer, FieldBox, CalendarIcon } from '../ds/index'
import { LOCALE } from '../i18n/locale'
import { t, MONTH_GEN, pluralDays, pluralMonths } from '../i18n/translate'

const DAYS_PER_MONTH = 2.33

function fullMonthsBetween(start, end) {
  if (!start || !end || end <= start) return 0
  let months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth())
  if (end.getDate() < start.getDate()) months -= 1
  return Math.max(0, months)
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
      <Drawer
        title={t('Калькулятор отпуска')}
        subtitle={t('Расчёт ведётся от текущего остатка отпуска. За каждый полный месяц начисляется {n} календарных дня.')
          .replace('{n}', DAYS_PER_MONTH.toString().replace('.', LOCALE === 'en' ? '.' : ','))}
        onClose={onClose}
        actions={[{ label: t('закрыть'), type: 'secondary', onClick: onClose }]}
      >
        {/* Current balance */}
        <div style={{ padding: '10px 0' }}>
          <div style={{ color: '#626C77', fontSize: 14, fontFamily: "'MTSCompact', sans-serif", lineHeight: '20px' }}>{t('Текущий остаток')}</div>
          <div style={{ color: '#1D2023', fontSize: 17, fontFamily: "'MTSCompact', sans-serif", lineHeight: '24px' }}>
            {balance.main ?? 0} {pluralDays(balance.main ?? 0)}
          </div>
        </div>

        {/* Date picker field */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div ref={fieldRef}>
            <FieldBox
              label={t('Рассчитать на дату')}
              value={targetDate ? fmtDate(targetDate) : ''}
              active={showCalendar}
              error={!!targetDate && !isValid}
              onClick={openCalendar}
              right={
                <span style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <CalendarIcon />
                </span>
              }
            />
          </div>
          {targetDate && !isValid && (
            <span style={{ fontSize: 12, lineHeight: '16px', color: '#E30611', fontFamily: "'MTSCompact', sans-serif" }}>{t('Дата должна быть позже сегодняшней')}</span>
          )}
        </div>

        {/* Result */}
        {isValid && (
          <div style={{ background: '#F2F3F7', borderRadius: 16, padding: 16, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ color: '#626C77', fontSize: 14, fontFamily: "'MTSCompact', sans-serif", fontWeight: 400, lineHeight: '20px' }}>
              {t('К выбранной дате накопится')}
            </span>
            <span style={{ color: '#1D2023', fontSize: 24, fontFamily: "'MTSWide', sans-serif", fontWeight: 500, lineHeight: '28px' }}>
              {total} {pluralDays(total)}
            </span>
            {additionalDays > 0 && (
              <span style={{ color: '#626C77', fontSize: 12, fontFamily: "'MTSCompact', sans-serif", lineHeight: '16px' }}>
                {balance.main ?? 0} {t('сейчас +')} {additionalDays} {t('накопится за')} {additionalMonths} {pluralMonths(additionalMonths)}
              </span>
            )}
          </div>
        )}
      </Drawer>

      {/* Calendar dropdown — rendered outside the modal overlay to avoid z-index stacking */}
      {showCalendar && calendarRect && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 1100 }}
          onClick={() => setShowCalendar(false)}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ position: 'fixed', top: calendarRect.bottom + 4, left: calendarRect.left }}
          >
            <CalendarSingle
              initialDate={targetDate}
              minDate={(() => { const d = new Date(); d.setHours(0,0,0,0); d.setDate(d.getDate() + 1); return d })()}
              onApply={(date) => {
                setTargetDate(date)
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
