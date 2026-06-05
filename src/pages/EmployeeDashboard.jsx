import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import CampaignBanner from '../components/CampaignBanner'
import RequestModal from '../components/RequestModal'
import NewRequestModal from '../components/NewRequestModal'
import { COLORS, Banner, Chip, StatusBadge, YearCalendar } from '../ds/index'

const MONTH_GEN = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря']

function formatDateRange(startDate, endDate) {
  const s = new Date(startDate)
  const e = new Date(endDate)
  return `${s.getDate()} ${MONTH_GEN[s.getMonth()]} – ${e.getDate()} ${MONTH_GEN[e.getMonth()]}`
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
            display: 'flex', gap: 24,
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', gap: 4 }}>
              <div style={{ color: '#626C77', fontSize: 17, fontFamily: "'MTSCompact', sans-serif", fontWeight: 400, lineHeight: '20px', wordWrap: 'break-word' }}>
                Основной отпуск
              </div>
              <div style={{ color: '#1D2023', fontSize: 20, fontFamily: "'MTSCompact', sans-serif", fontWeight: 500, lineHeight: '24px', wordWrap: 'break-word' }}>
                {balance.main} {pluralDays(balance.main)}
              </div>
            </div>
            {balance.extra > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', gap: 4 }}>
                <div style={{ color: '#626C77', fontSize: 17, fontFamily: "'MTSCompact', sans-serif", fontWeight: 400, lineHeight: '20px', wordWrap: 'break-word' }}>
                  Дополнительный
                </div>
                <div style={{ color: '#1D2023', fontSize: 20, fontFamily: "'MTSCompact', sans-serif", fontWeight: 500, lineHeight: '24px', wordWrap: 'break-word' }}>
                  {balance.extra} {pluralDays(balance.extra)}
                </div>
              </div>
            )}
          </div>

          {/* Vacation list section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <h3 style={{
              margin: 0,
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
              subtitleLink={{ label: 'по ссылке', href: '#' }}
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {yearRequests.length === 0 ? (
                <div style={{ fontSize: 14, color: '#626C77', fontFamily: "'MTSCompact', sans-serif", padding: '8px 0' }}>
                  Нет&nbsp;заявок за&nbsp;{year} год
                </div>
              ) : (
                yearRequests.map(req => (
                  <button
                    key={req.id}
                    onClick={() => setSelectedRequest(req)}
                    style={{
                      paddingTop: 10, paddingBottom: 10, paddingLeft: 0, paddingRight: 0,
                      display: 'flex', alignItems: 'center', gap: 12,
                      background: 'none', border: 'none', borderBottom: '1px solid #F2F3F7',
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
