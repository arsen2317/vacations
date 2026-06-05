import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import RequestModal from '../components/RequestModal'
import NewRequestModal from '../components/NewRequestModal'
import { COLORS, Banner, Chip, StatusBadge, YearCalendar, YEAR_CALENDAR_WIDTH } from '../ds/index'

const MONTH_GEN = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря']

const MAX_PLAN_DAYS = 40
const MIN_PLAN_DAYS = 28

function formatDateRange(startDate, endDate) {
  const s = new Date(startDate)
  const e = new Date(endDate)
  return `${s.getDate()} ${MONTH_GEN[s.getMonth()]} – ${e.getDate()} ${MONTH_GEN[e.getMonth()]}`
}

function formatSegmentDate(isoStr) {
  const d = new Date(isoStr + 'T00:00:00')
  return `${d.getDate()} ${MONTH_GEN[d.getMonth()]}`
}

function pluralDays(n) {
  if (n % 10 === 1 && n % 100 !== 11) return 'день'
  if (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)) return 'дня'
  return 'дней'
}

function Toast({ message, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 4000)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <div style={{
      position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)',
      zIndex: 2000, background: '#1D2023', color: '#FAFAFA', borderRadius: 16,
      padding: '14px 24px', fontSize: 15, fontFamily: "'MTSCompact', sans-serif",
      lineHeight: '22px', boxShadow: '0px 8px 24px rgba(0,0,0,0.20)',
      pointerEvents: 'none', whiteSpace: 'nowrap',
    }}>
      {message}
    </div>
  )
}

// Left panel for 2026: balance + vacation list
function Panel2026({ balance, yearRequests, setSelectedRequest, setNewRequestRange }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Balance */}
      <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ color: '#626C77', fontSize: 17, fontFamily: "'MTSCompact', sans-serif", fontWeight: 400, lineHeight: '20px' }}>
            Основной отпуск
          </div>
          <div style={{ color: '#1D2023', fontSize: 20, fontFamily: "'MTSCompact', sans-serif", fontWeight: 500, lineHeight: '24px' }}>
            {balance.main} {pluralDays(balance.main)}
          </div>
        </div>
        {balance.extra > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ color: '#626C77', fontSize: 17, fontFamily: "'MTSCompact', sans-serif", fontWeight: 400, lineHeight: '20px' }}>
              Дополнительный
            </div>
            <div style={{ color: '#1D2023', fontSize: 20, fontFamily: "'MTSCompact', sans-serif", fontWeight: 500, lineHeight: '24px' }}>
              {balance.extra} {pluralDays(balance.extra)}
            </div>
          </div>
        )}
      </div>

      {/* Vacation list */}
      <div style={{ marginTop: 16 }}>
        <h3 style={{
          margin: '36px 0 12px',
          color: '#1D2023',
          fontFeatureSettings: "'liga' off, 'clig' off",
          fontFamily: "'MTSWide', sans-serif",
          fontSize: 24,
          fontWeight: 500,
          lineHeight: '28px',
        }}>
          Мои отпуска
        </h3>

        <Banner
          type="info"
          title="Для создания новой заявки на&nbsp;отпуск выберите период в&nbsp;календаре"
          subtitle="Узнать больше о&nbsp;правилах планирования отпусков можно "
          subtitleLink={{ label: 'по ссылке', href: '#' }}
        />

        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {yearRequests.length === 0 ? (
            <div style={{ fontSize: 14, color: '#626C77', fontFamily: "'MTSCompact', sans-serif", padding: '8px 0' }}>
              Нет&nbsp;заявок за&nbsp;2026 год
            </div>
          ) : (
            yearRequests.map(req => (
              <button
                key={req.id}
                onClick={() => setSelectedRequest(req)}
                style={{
                  paddingTop: 10, paddingBottom: 10, paddingLeft: 0, paddingRight: 0,
                  display: 'flex', alignItems: 'center', gap: 12,
                  background: 'none', border: 'none',
                  cursor: 'pointer', textAlign: 'left', width: '100%',
                }}
              >
                <div style={{ flex: '1 1 0', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start' }}>
                  <div style={{
                    alignSelf: 'stretch',
                    color: '#1D2023', fontSize: 17, fontFamily: "'MTSCompact', sans-serif",
                    fontWeight: 500, lineHeight: '24px', wordWrap: 'break-word',
                  }}>
                    {formatDateRange(req.startDate, req.endDate)}
                  </div>
                  <div style={{
                    alignSelf: 'stretch',
                    color: '#626C77', fontSize: 14, fontFamily: "'MTSCompact', sans-serif",
                    fontWeight: 400, lineHeight: '20px', wordWrap: 'break-word',
                  }}>
                    {req.typeLabel}
                  </div>
                </div>
                <StatusBadge type={req.status} />
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

// Left panel for 2027: planning view
function Panel2027({ balance, campaign, segments, planStatus, setPlanStatus, setToast }) {
  const distributedDays = segments.reduce((s, seg) => s + seg.days, 0)
  const hasLongSegment  = segments.some(s => s.days >= 14)
  const canSubmit       = distributedDays >= MIN_PLAN_DAYS && hasLongSegment

  function handleSubmit() {
    if (!canSubmit) return
    setPlanStatus('pending')
    setToast('Заявка направлена на согласование')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 0 }}>
      {/* Balance */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {/* Основной отпуск */}
        <div style={{ height: 56, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 4 }}>
          <div style={{ color: '#626C77', fontSize: 17, fontFamily: "'MTSCompact', sans-serif", fontWeight: 400, lineHeight: '20px' }}>
            Основной отпуск
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6 }}>
            <div style={{ color: '#1D2023', fontSize: 20, fontFamily: "'MTSCompact', sans-serif", fontWeight: 500, lineHeight: '24px' }}>
              {campaign.totalDays} дней
            </div>
            {balance.accumulated > 0 && (
              <div style={{ color: '#1D2023', fontSize: 20, fontFamily: "'MTSCompact', sans-serif", fontWeight: 500, lineHeight: '24px' }}>
                + {balance.accumulated} накопленный
              </div>
            )}
          </div>
        </div>

        {/* Дополнительный отпуск */}
        {balance.extra > 0 && (
          <div style={{ height: 56, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 4 }}>
            <div style={{ color: '#626C77', fontSize: 17, fontFamily: "'MTSCompact', sans-serif", fontWeight: 400, lineHeight: '20px' }}>
              Дополнительный отпуск
            </div>
            <div style={{ color: '#1D2023', fontSize: 20, fontFamily: "'MTSCompact', sans-serif", fontWeight: 500, lineHeight: '24px' }}>
              {balance.extra} {pluralDays(balance.extra)}
            </div>
          </div>
        )}

        {/* Распределено */}
        <div style={{ height: 56, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 4 }}>
          <div style={{ color: '#626C77', fontSize: 17, fontFamily: "'MTSCompact', sans-serif", fontWeight: 400, lineHeight: '20px' }}>
            Распределено
          </div>
          <div style={{ color: '#1D2023', fontSize: 20, fontFamily: "'MTSCompact', sans-serif", fontWeight: 500, lineHeight: '24px' }}>
            {distributedDays} из {MAX_PLAN_DAYS} дней
          </div>
        </div>
      </div>

      {/* Periods section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* H3 + subtitle */}
        <div style={{ paddingTop: 36, paddingBottom: 12 }}>
          <div style={{ color: '#1D2023', fontSize: 24, fontFamily: "'MTSWide', sans-serif", fontWeight: 500, lineHeight: '28px' }}>
            Периоды отпуска
          </div>
          <div style={{ marginTop: 4, color: '#626C77', fontSize: 14, fontFamily: "'MTSCompact', sans-serif", fontWeight: 400, lineHeight: '20px' }}>
            Один из периодов должен быть не менее 14 дней
          </div>
        </div>

        <Banner
          type="info"
          title="Для создания плана на&nbsp;отпуск выберите периоды в&nbsp;календаре"
          subtitle="Узнать больше о&nbsp;правилах планирования отпусков можно "
          subtitleLink={{ label: 'по ссылке', href: '#' }}
        />

        {/* Segments list */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {segments.length === 0 ? (
            <div style={{ padding: '8px 0', fontSize: 14, color: '#626C77', fontFamily: "'MTSCompact', sans-serif" }}>
              Нет добавленных периодов
            </div>
          ) : (
            segments.map(seg => (
              <div
                key={seg.id}
                style={{
                  paddingTop: 10, paddingBottom: 10,
                  display: 'flex', alignItems: 'center', gap: 12,
                }}
              >
                <div style={{ flex: '1 1 0', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div style={{ color: '#1D2023', fontSize: 17, fontFamily: "'MTSCompact', sans-serif", fontWeight: 500, lineHeight: '24px' }}>
                    {formatSegmentDate(seg.startDate)} – {formatSegmentDate(seg.endDate)}
                  </div>
                  <div style={{ color: '#626C77', fontSize: 14, fontFamily: "'MTSCompact', sans-serif", fontWeight: 400, lineHeight: '20px' }}>
                    {seg.days} {pluralDays(seg.days)}
                  </div>
                </div>
                <StatusBadge type={planStatus === 'draft' ? 'draft' : planStatus} />
              </div>
            ))
          )}
        </div>

        {/* Submit button */}
        {planStatus === 'draft' && (
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            style={{
              alignSelf: 'stretch',
              height: 44,
              padding: 10,
              background: canSubmit ? '#0066FF' : '#F2F3F7',
              overflow: 'hidden',
              borderRadius: 16,
              border: 'none',
              cursor: canSubmit ? 'pointer' : 'not-allowed',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <span style={{
              paddingLeft: 8, paddingRight: 8,
              color: canSubmit ? '#FFFFFF' : '#8C9BAB',
              fontSize: 12,
              fontFamily: "'MTSWide', sans-serif",
              fontWeight: 700,
              textTransform: 'uppercase',
              lineHeight: '16px',
              letterSpacing: 0.6,
            }}>
              отправить на согласование
            </span>
          </button>
        )}
      </div>
    </div>
  )
}

export default function EmployeeDashboard({ onGoToPlanning, onGoToTeam, onGoToHR }) {
  const { requests, balance, segments, planStatus, setPlanStatus, campaign } = useApp()
  const [year, setYear] = useState(2026)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [newRequestRange, setNewRequestRange] = useState(null)
  const [calendarKey, setCalendarKey] = useState(0)
  const [toast, setToast] = useState(null)

  function closeNewRequest() {
    setNewRequestRange(null)
    setCalendarKey(k => k + 1)
  }

  const yearRequests = requests.filter(r => {
    const s = new Date(r.startDate)
    const e = new Date(r.endDate)
    return s.getFullYear() === year || e.getFullYear() === year
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 24 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', paddingTop: 8 }}>

        {/* Left panel */}
        <div style={{ flex: 1, minWidth: 260, display: 'flex', flexDirection: 'column', paddingRight: 32 }}>

          {/* Year chips */}
          <div style={{ display: 'flex', gap: 8 }}>
            <Chip active={year === 2026} onClick={() => setYear(2026)}>2026</Chip>
            <Chip active={year === 2027} onClick={() => setYear(2027)}>2027 – планирование</Chip>
          </div>

          {year === 2026 ? (
            <Panel2026
              balance={balance}
              yearRequests={yearRequests}
              setSelectedRequest={setSelectedRequest}
              setNewRequestRange={setNewRequestRange}
            />
          ) : (
            <Panel2027
              balance={balance}
              campaign={campaign}
              segments={segments}
              planStatus={planStatus}
              setPlanStatus={setPlanStatus}
              setToast={setToast}
            />
          )}
        </div>

        {/* Vertical divider */}
        <div style={{ width: 1, background: '#E8EDF2', alignSelf: 'stretch', flexShrink: 0 }} />

        {/* Right panel */}
        <div style={{ width: YEAR_CALENDAR_WIDTH, flexShrink: 0, paddingLeft: 32 }}>
          <YearCalendar
            key={calendarKey}
            year={year}
            requests={year === 2026 ? yearRequests : segments.map(s => ({
              ...s,
              startDate: new Date(s.startDate + 'T00:00:00'),
              endDate: new Date(s.endDate + 'T00:00:00'),
              status: planStatus,
            }))}
            onRequestClick={year === 2026 ? setSelectedRequest : undefined}
            onNewRequest={year === 2026 ? (start, end) => setNewRequestRange({ start, end }) : undefined}
          />
        </div>
      </div>

      <RequestModal
        request={selectedRequest}
        onClose={() => setSelectedRequest(null)}
      />

      {newRequestRange && (
        <NewRequestModal
          initialStart={newRequestRange.start}
          initialEnd={newRequestRange.end}
          onClose={closeNewRequest}
          onSubmitted={() => {
            closeNewRequest()
            setToast('Заявка направлена на согласование')
          }}
        />
      )}

      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </div>
  )
}
