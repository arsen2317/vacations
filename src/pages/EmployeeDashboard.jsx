import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import CampaignBanner from '../components/CampaignBanner'
import RequestModal from '../components/RequestModal'
import NewRequestModal from '../components/NewRequestModal'
import { COLORS, Banner, Chip, StatusBadge, YearCalendar } from '../ds/index'

const MONTH_SHORT = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек']

function formatDateRange(startDate, endDate) {
  const s = new Date(startDate)
  const e = new Date(endDate)
  if (s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear()) {
    return `${s.getDate()}–${e.getDate()} ${MONTH_SHORT[s.getMonth()]}`
  }
  return `${s.getDate()} ${MONTH_SHORT[s.getMonth()]} — ${e.getDate()} ${MONTH_SHORT[e.getMonth()]}`
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

export default function EmployeeDashboard({ onGoToPlanning, onGoToTeam, onGoToHR }) {
  const { requests, balance } = useApp()
  const [year, setYear] = useState(2026)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [newRequestRange, setNewRequestRange] = useState(null)
  const [toast, setToast] = useState(null)

  const yearRequests = requests.filter(r => {
    const s = new Date(r.startDate)
    const e = new Date(r.endDate)
    return s.getFullYear() === year || e.getFullYear() === year
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 24 }}>
      <CampaignBanner onGoToPlanning={onGoToPlanning} />

      <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start', paddingTop: 8 }}>

        {/* Left panel */}
        <div style={{ width: 340, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Year chips */}
          <div style={{ display: 'flex', gap: 8 }}>
            <Chip active={year === 2026} onClick={() => setYear(2026)}>2026</Chip>
            <Chip active={year === 2027} onClick={() => setYear(2027)}>2027</Chip>
          </div>

          {/* Balance card */}
          <div style={{
            background: '#F2F3F7', borderRadius: 20, padding: '16px 20px',
            display: 'flex', flexDirection: 'column', gap: 6,
          }}>
            <div style={{ fontSize: 13, color: '#626C77', fontFamily: "'MTSCompact', sans-serif", lineHeight: '18px' }}>
              Доступно дней отпуска
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 28, fontWeight: 500, color: '#1D2023', fontFamily: "'MTSWide', sans-serif", lineHeight: '32px' }}>
                {balance.main}
              </span>
              <span style={{ fontSize: 14, color: '#626C77', fontFamily: "'MTSCompact', sans-serif" }}>основных</span>
              {balance.extra > 0 && (
                <>
                  <span style={{ fontSize: 14, color: '#BCC3D0', fontFamily: "'MTSCompact', sans-serif" }}>+</span>
                  <span style={{ fontSize: 28, fontWeight: 500, color: '#1D2023', fontFamily: "'MTSWide', sans-serif", lineHeight: '32px' }}>
                    {balance.extra}
                  </span>
                  <span style={{ fontSize: 14, color: '#626C77', fontFamily: "'MTSCompact', sans-serif" }}>доп.</span>
                </>
              )}
            </div>
          </div>

          {/* Vacation list section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <h2 style={{
              margin: 0, fontSize: 17, fontWeight: 500,
              color: COLORS.text, lineHeight: '24px',
              fontFamily: "'MTSWide', sans-serif",
            }}>
              Мои отпуска
            </h2>

            <Banner
              type="info"
              title="Для создания заявки выберите период в календаре справа"
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {yearRequests.length === 0 ? (
                <div style={{ fontSize: 14, color: '#626C77', fontFamily: "'MTSCompact', sans-serif", padding: '8px 0' }}>
                  Нет заявок за {year} год
                </div>
              ) : (
                yearRequests.map(req => (
                  <button
                    key={req.id}
                    onClick={() => setSelectedRequest(req)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '12px 16px', background: '#F2F3F7',
                      borderRadius: 16, border: 'none', cursor: 'pointer',
                      textAlign: 'left', width: '100%',
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: 15, fontWeight: 500, color: '#1D2023',
                        fontFamily: "'MTSCompact', sans-serif", lineHeight: '22px',
                      }}>
                        {formatDateRange(req.startDate, req.endDate)}
                      </div>
                      <div style={{
                        fontSize: 13, color: '#626C77',
                        fontFamily: "'MTSCompact', sans-serif", lineHeight: '18px',
                        marginTop: 2,
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

        {/* Right panel — year calendar */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <YearCalendar
            year={year}
            requests={yearRequests}
            onRequestClick={setSelectedRequest}
            onNewRequest={(start, end) => setNewRequestRange({ start, end })}
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
          onClose={() => setNewRequestRange(null)}
          onSubmitted={() => {
            setNewRequestRange(null)
            setToast('Заявка направлена на согласование')
          }}
        />
      )}

      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </div>
  )
}
