import { useState, useEffect, useMemo } from 'react'
import { useApp } from '../context/AppContext'
import RequestModal from '../components/RequestModal'
import NewRequestModal from '../components/NewRequestModal'
import { COLORS, Banner, Chip, StatusBadge, PersonAvatar, YearCalendar, YEAR_CALENDAR_WIDTH } from '../ds/index'
import { countVacationDays } from '../utils/dateUtils'
import { COLLEAGUES, CURRENT_USER } from '../data/mockData'

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
                    {req.days} {pluralDays(req.days)} · {req.typeLabel}
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

function ColleagueRow({ col, onRemove }) {
  return (
    <div style={{ paddingTop: 10, paddingBottom: 10, display: 'flex', alignItems: 'center', gap: 12 }}>
      <PersonAvatar src={col.avatar} />
      <div style={{ flex: '1 1 0', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ color: '#1D2023', fontSize: 17, fontFamily: "'MTSCompact', sans-serif", fontWeight: 400, lineHeight: '24px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {col.name}
        </div>
        <div style={{ color: '#626C77', fontSize: 14, fontFamily: "'MTSCompact', sans-serif", fontWeight: 400, lineHeight: '20px' }}>
          {col.position ?? col.team}
        </div>
      </div>
      <button
        onClick={onRemove}
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M18 6L6 18M6 6L18 18" stroke="#1D2023" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </button>
    </div>
  )
}

// Left panel for 2027: planning view
function Panel2027({ balance, campaign, segments, onRemoveSegment, planStatus, setPlanStatus, setToast, trackedColleagues, onRemoveColleague }) {
  const [collapseOverlap, setCollapseOverlap] = useState(false)
  const distributedDays = segments.reduce((s, seg) => s + seg.days, 0)
  const hasLongSegment  = segments.some(s => s.days >= 14)
  const canSubmit       = distributedDays >= MIN_PLAN_DAYS && hasLongSegment

  function handleSubmit() {
    if (!canSubmit) return
    setPlanStatus('pending')
    setToast('Заявка направлена на согласование')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 24 }}>
      {/* Balance */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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
        {segments.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {segments.map(seg => (
              <div
                key={seg.id}
                style={{ paddingTop: 10, paddingBottom: 10, display: 'flex', alignItems: 'center', gap: 12 }}
              >
                {planStatus === 'draft' ? (
                  <>
                    {/* Remove button */}
                    <button
                      onClick={() => onRemoveSegment(seg.id)}
                      style={{ width: 24, height: 24, background: 'none', border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path fillRule="evenodd" clipRule="evenodd" d="M3.04351 3.04351C1.47611 4.6109 1.3538 6.18347 1.10916 9.32861C1.04148 10.1987 1 11.0993 1 12C1 12.9007 1.04148 13.8013 1.10916 14.6714C1.3538 17.8165 1.47611 19.3891 3.04351 20.9565C4.6109 22.5239 6.18347 22.6462 9.32861 22.8908C10.1987 22.9585 11.0994 23 12 23C12.9007 23 13.8013 22.9585 14.6714 22.8908C17.8165 22.6462 19.3891 22.5239 20.9565 20.9565C22.5239 19.3891 22.6462 17.8165 22.8908 14.6714C22.9585 13.8013 23 12.9007 23 12C23 11.0993 22.9585 10.1987 22.8908 9.32861C22.6462 6.18347 22.5239 4.6109 20.9565 3.04351C19.3891 1.47611 17.8165 1.3538 14.6714 1.10916C13.8013 1.04148 12.9007 1 12 1C11.0994 1 10.1987 1.04148 9.32861 1.10916C6.18347 1.3538 4.6109 1.47611 3.04351 3.04351Z" fill="#F95721"/>
                        <path d="M16 10.9985C16.5523 10.9985 17 11.4463 17 11.9985C17 12.5508 16.5523 12.9985 16 12.9985H8C7.44771 12.9985 7 12.5508 7 11.9985C7 11.4463 7.44771 10.9985 8 10.9985H16Z" fill="white"/>
                      </svg>
                    </button>
                    <div style={{ flex: '1 1 0', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <div style={{ color: '#1D2023', fontSize: 17, fontFamily: "'MTSCompact', sans-serif", fontWeight: 500, lineHeight: '24px' }}>
                        {formatSegmentDate(seg.startDate)} – {formatSegmentDate(seg.endDate)}
                      </div>
                      <div style={{ color: '#626C77', fontSize: 14, fontFamily: "'MTSCompact', sans-serif", fontWeight: 400, lineHeight: '20px' }}>
                        {seg.days} {pluralDays(seg.days)}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ flex: '1 1 0', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <div style={{ color: '#1D2023', fontSize: 17, fontFamily: "'MTSCompact', sans-serif", fontWeight: 500, lineHeight: '24px' }}>
                        {formatSegmentDate(seg.startDate)} – {formatSegmentDate(seg.endDate)}
                      </div>
                      <div style={{ color: '#626C77', fontSize: 14, fontFamily: "'MTSCompact', sans-serif", fontWeight: 400, lineHeight: '20px' }}>
                        {seg.days} {pluralDays(seg.days)}
                      </div>
                    </div>
                    <StatusBadge type={planStatus} />
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Submit button */}
        {planStatus === 'draft' && (
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            style={{
              alignSelf: 'stretch', height: 44, padding: 10,
              background: canSubmit ? '#0066FF' : '#F2F3F7',
              overflow: 'hidden', borderRadius: 16, border: 'none',
              cursor: canSubmit ? 'pointer' : 'not-allowed',
              display: 'flex', justifyContent: 'center', alignItems: 'center',
            }}
          >
            <span style={{
              paddingLeft: 8, paddingRight: 8,
              color: canSubmit ? '#FFFFFF' : '#8C9BAB',
              fontSize: 12, fontFamily: "'MTSWide', sans-serif",
              fontWeight: 700, textTransform: 'uppercase',
              lineHeight: '16px', letterSpacing: 0.6,
            }}>
              отправить на согласование
            </span>
          </button>
        )}
      </div>

      {/* Пересечения section */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <button
          onClick={() => setCollapseOverlap(v => !v)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, paddingTop: 36, paddingBottom: 12, display: 'flex', alignItems: 'center', gap: 4, textAlign: 'left' }}
        >
          <span style={{ color: '#1D2023', fontSize: 24, fontFamily: "'MTSWide', sans-serif", fontWeight: 500, lineHeight: '28px' }}>
            Пересечения
          </span>
          <svg
            width="12" height="7" viewBox="0 0 12 7" fill="none"
            style={{ flexShrink: 0, transition: 'transform 0.2s', transform: collapseOverlap ? 'rotate(0deg)' : 'rotate(180deg)' }}
          >
            <path d="M1 6L6 1L11 6" stroke="#1D2023" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingBottom: 12 }}>
          <div style={{ width: 8, height: 8, borderRadius: 9999, background: '#FAC031', flexShrink: 0 }} />
          <span style={{ color: '#626C77', fontSize: 17, fontFamily: "'MTSCompact', sans-serif", fontWeight: 400, lineHeight: '20px' }}>
            отметка пересечений
          </span>
        </div>

        {!collapseOverlap && (
          <>
            {/* Add colleague row */}
            <div style={{ paddingTop: 10, paddingBottom: 10, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 52, height: 52, background: '#F2F3F7', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M7 15C7 15.5523 7.44772 16 8 16C8.55229 16 9 15.5523 9 15V9H15C15.5523 9 16 8.55229 16 8C16 7.44772 15.5523 7 15 7H9V1C9 0.447715 8.55228 0 8 0C7.44771 0 7 0.447715 7 1L7 7H1C0.447715 7 0 7.44771 0 8C0 8.55228 0.447715 9 1 9H7L7 15Z" fill="#007CFF"/>
                </svg>
              </div>
              <span style={{ color: '#0070E5', fontSize: 17, fontFamily: "'MTSCompact', sans-serif", fontWeight: 400, lineHeight: '24px' }}>
                Добавить сотрудника
              </span>
            </div>

            {/* Colleagues list */}
            {trackedColleagues.map(col => (
              <ColleagueRow
                key={col.id}
                col={col}
                onRemove={() => onRemoveColleague(col.id)}
              />
            ))}
          </>
        )}
      </div>
    </div>
  )
}

function toISODate(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const INITIAL_TRACKED_IDS = COLLEAGUES
  .filter(c => !c.me && c.team === CURRENT_USER.team)
  .map(c => c.id)

export default function EmployeeDashboard({ onGoToPlanning, onGoToTeam, onGoToHR }) {
  const { requests, balance, segments, setSegments, planStatus, setPlanStatus, campaign } = useApp()
  const [year, setYear] = useState(2026)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [newRequestRange, setNewRequestRange] = useState(null)
  const [calendarKey, setCalendarKey] = useState(0)
  const [toast, setToast] = useState(null)
  const [trackedColleagueIds, setTrackedColleagueIds] = useState(INITIAL_TRACKED_IDS)

  const trackedColleagues = useMemo(
    () => trackedColleagueIds.map(id => COLLEAGUES.find(c => c.id === id)).filter(Boolean),
    [trackedColleagueIds],
  )

  const colleagueDates2027 = useMemo(() => {
    const dates = new Set()
    for (const col of trackedColleagues) {
      for (const seg of (col.segments ?? [])) {
        if (!seg.startDate.startsWith('2027')) continue
        if (seg.status === 'draft') continue
        const s = new Date(seg.startDate + 'T00:00:00')
        const e = new Date(seg.endDate   + 'T00:00:00')
        const cur = new Date(s)
        while (cur <= e) {
          dates.add(toISODate(cur))
          cur.setDate(cur.getDate() + 1)
        }
      }
    }
    return dates
  }, [trackedColleagues])

  function closeNewRequest() {
    setNewRequestRange(null)
    setCalendarKey(k => k + 1)
  }

  function handleRemoveSegment(id) {
    setSegments(prev => prev.filter(s => s.id !== id))
    setCalendarKey(k => k + 1)
  }

  function handleAddSegment(start, end) {
    const startStr = toISODate(start)
    const endStr   = toISODate(end)
    const days = countVacationDays(start, end)
    const distributedDays = segments.reduce((s, seg) => s + seg.days, 0)
    if (distributedDays + days > MAX_PLAN_DAYS) return
    // check overlap
    for (const seg of segments) {
      const ss = new Date(seg.startDate + 'T00:00:00')
      const se = new Date(seg.endDate   + 'T00:00:00')
      if (start <= se && end >= ss) return
    }
    setSegments(prev => [...prev, { id: Date.now(), startDate: startStr, endDate: endStr, days }]
      .sort((a, b) => a.startDate.localeCompare(b.startDate)))
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
              onRemoveSegment={handleRemoveSegment}
              planStatus={planStatus}
              setPlanStatus={setPlanStatus}
              setToast={setToast}
              trackedColleagues={trackedColleagues}
              onRemoveColleague={id => setTrackedColleagueIds(prev => prev.filter(x => x !== id))}
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
            onNewRequest={year === 2026
              ? (start, end) => setNewRequestRange({ start, end })
              : (planStatus === 'draft' ? handleAddSegment : undefined)
            }
            colleagueDates={year === 2027 ? colleagueDates2027 : null}
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
