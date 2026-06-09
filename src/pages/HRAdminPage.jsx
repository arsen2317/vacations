import { useApp } from '../context/AppContext'
import { COLORS, BTN_STYLE, Banner } from '../ds/index'

const CARD_STYLE = {
  background: '#fff',
  borderRadius: 20,
  padding: 24,
  outline: `1px ${COLORS.stroke} solid`,
  outlineOffset: '-1px',
}

const STATS = [
  { label: 'Всего сотрудников', value: '6 500', color: COLORS.text      },
  { label: 'Согласованы',       value: '3 240', color: '#007502'        },
  { label: 'На согласовании',   value: '2 180', color: '#005CBD'        },
  { label: 'Черновики',         value: '1 080', color: COLORS.secondary },
]

const PROGRESS_PCT = Math.round(3240 / 6500 * 100) // 50
const PENDING_PCT  = Math.round(2180 / 6500 * 100) // 34

function downloadCsv(filename, headers, rows) {
  const csv = [headers, ...rows]
    .map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
    .join('\n')
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

export default function HRAdminPage() {
  const { campaign } = useApp()

  function downloadReport() {
    downloadCsv(
      `hr-report-${campaign.year}.csv`,
      ['Показатель', 'Значение'],
      [
        ['Всего сотрудников', '6 500'],
        ['Согласованы',       '3 240'],
        ['На согласовании',   '2 180'],
        ['Черновики',         '1 080'],
      ],
    )
  }

  return (
    <div style={{ paddingTop: 32, paddingBottom: 48, display: 'flex', flexDirection: 'column', gap: 24, fontFamily: "'MTSCompact', sans-serif" }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ fontSize: 24, fontWeight: 500, color: COLORS.text, fontFamily: "'MTSWide', sans-serif", lineHeight: '28px' }}>
          HR-панель — кампания {campaign.year}
        </div>
        <button
          onClick={downloadReport}
          style={{ ...BTN_STYLE, height: 44, paddingLeft: 20, paddingRight: 20, borderRadius: 16, border: 'none', background: COLORS.bg, color: COLORS.text, cursor: 'pointer', flexShrink: 0 }}
        >
          Скачать отчёт
        </button>
      </div>

      {/* Campaign banner */}
      <Banner
        type={campaign.active ? 'done' : 'info'}
        title={`Кампания по планированию ${campaign.year}`}
        subtitle={campaign.active
          ? 'Активна — сотрудники могут распределять дни отпуска'
          : 'Не активна — планирование закрыто'}
      />

      {/* Stats cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {STATS.map(s => (
          <div key={s.label} style={CARD_STYLE}>
            <div style={{ fontSize: 14, color: COLORS.secondary, fontFamily: "'MTSCompact', sans-serif", lineHeight: '20px', marginBottom: 8 }}>
              {s.label}
            </div>
            <div style={{ fontSize: 28, fontWeight: 500, color: s.color, fontFamily: "'MTSWide', sans-serif", lineHeight: '32px' }}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Progress */}
      <div style={CARD_STYLE}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <span style={{ fontSize: 17, fontWeight: 500, color: COLORS.text, fontFamily: "'MTSCompact', sans-serif", lineHeight: '24px' }}>
            Прогресс согласования
          </span>
          <span style={{ fontSize: 14, color: COLORS.secondary, fontFamily: "'MTSCompact', sans-serif" }}>
            3 240 из 6 500
          </span>
        </div>
        <div style={{ height: 8, background: COLORS.bg, borderRadius: 4, overflow: 'hidden', display: 'flex' }}>
          <div style={{ width: `${PROGRESS_PCT}%`, background: '#26CD58' }} />
          <div style={{ width: `${PENDING_PCT}%`, background: '#FFBB00' }} />
        </div>
        <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: 9999, background: '#26CD58', flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: COLORS.secondary, fontFamily: "'MTSCompact', sans-serif" }}>Согласованы {PROGRESS_PCT}%</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: 9999, background: '#FFBB00', flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: COLORS.secondary, fontFamily: "'MTSCompact', sans-serif" }}>На согласовании {PENDING_PCT}%</span>
          </div>
        </div>
      </div>

    </div>
  )
}
