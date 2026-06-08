import { useState, useMemo } from 'react'
import { useApp } from '../context/AppContext'
import { ALL_EMPLOYEES } from '../data/mockData'
import { COLORS, BTN_STYLE, Banner, Chip, SelectField, StatusBadge } from '../ds/index'

const STATUS_FILTER_OPTIONS = [
  { id: 'all',      name: 'Все' },
  { id: 'approved', name: 'Согласованы' },
  { id: 'pending',  name: 'На согласовании' },
  { id: 'draft',    name: 'Черновик' },
]

const STATUS_LABEL = {
  draft:    'Черновик',
  pending:  'На согласовании',
  approved: 'Согласован',
}

const TEAMS = [...new Set(ALL_EMPLOYEES.map(e => e.team))]

const TEAM_OPTIONS = [
  { id: 'all', name: 'Все подразделения' },
  ...TEAMS.map(t => ({ id: t, name: t })),
]

const CARD_STYLE = {
  background: '#fff',
  borderRadius: 20,
  padding: 24,
  outline: `1px ${COLORS.stroke} solid`,
  outlineOffset: '-1px',
}

const TH = {
  padding: '12px 16px', fontSize: 13, fontWeight: 400, color: COLORS.secondary,
  textAlign: 'left', fontFamily: "'MTSCompact', sans-serif",
  background: '#F2F3F7', whiteSpace: 'nowrap',
}
const TD = {
  padding: '16px', fontSize: 14, color: COLORS.text,
  fontFamily: "'MTSCompact', sans-serif", verticalAlign: 'middle',
  borderTop: `1px ${COLORS.stroke} solid`,
}

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

function ConfirmModal({ onCancel, onConfirm }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onCancel}>
      <div onClick={e => e.stopPropagation()} style={{ width: 440, background: '#fff', borderRadius: 32, display: 'flex', flexDirection: 'column', overflow: 'hidden', fontFamily: "'MTSCompact', sans-serif" }}>
        <div style={{ padding: '28px 28px 0' }}>
          <div style={{ fontSize: 20, fontWeight: 500, fontFamily: "'MTSWide', sans-serif", color: COLORS.text, lineHeight: '24px' }}>
            Завершить кампанию?
          </div>
        </div>
        <div style={{ padding: '16px 28px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Banner
            type="warning"
            title="После завершения сотрудники не смогут изменять планы отпуска"
            subtitle="Это действие можно отменить, запустив кампанию заново."
          />
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={onCancel}
              style={{ ...BTN_STYLE, flex: 1, height: 44, border: 'none', borderRadius: 16, cursor: 'pointer', background: COLORS.bg, color: COLORS.text }}
            >
              Отмена
            </button>
            <button
              onClick={onConfirm}
              style={{ ...BTN_STYLE, flex: 1, height: 44, border: 'none', borderRadius: 16, cursor: 'pointer', background: '#E30611', color: '#fff' }}
            >
              Завершить
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function HRAdminPage() {
  const { campaign, setCampaign } = useApp()
  const [showConfirm, setShowConfirm] = useState(false)
  const [statusFilter, setStatusFilter] = useState('all')
  const [teamFilter, setTeamFilter] = useState('all')

  const baseEmployees = teamFilter === 'all'
    ? ALL_EMPLOYEES
    : ALL_EMPLOYEES.filter(e => e.team === teamFilter)

  const total         = baseEmployees.length
  const approvedCount = baseEmployees.filter(e => e.planStatus === 'approved').length
  const pendingCount  = baseEmployees.filter(e => e.planStatus === 'pending').length
  const draftCount    = baseEmployees.filter(e => e.planStatus === 'draft').length

  const progressPct = total ? Math.round((approvedCount / total) * 100) : 0
  const pendingPct  = total ? Math.round((pendingCount  / total) * 100) : 0

  const filtered = statusFilter === 'all'
    ? baseEmployees
    : baseEmployees.filter(e => e.planStatus === statusFilter)

  function downloadReport() {
    downloadCsv(
      `hr-report-${campaign.year}.csv`,
      ['№', 'Сотрудник', 'Подразделение', 'Статус'],
      filtered.map((emp, i) => [i + 1, emp.name, emp.team, STATUS_LABEL[emp.planStatus] ?? emp.planStatus]),
    )
  }

  function handleToggle() {
    if (campaign.active) {
      setShowConfirm(true)
    } else {
      setCampaign(prev => ({ ...prev, active: true }))
    }
  }

  function confirmDeactivate() {
    setCampaign(prev => ({ ...prev, active: false }))
    setShowConfirm(false)
  }

  const stats = useMemo(() => ([
    { label: 'Всего сотрудников', value: total,         color: COLORS.text },
    { label: 'Согласованы',       value: approvedCount, color: '#007502' },
    { label: 'На согласовании',   value: pendingCount,  color: '#005CBD' },
    { label: 'Черновики',         value: draftCount,    color: COLORS.secondary },
  ]), [total, approvedCount, pendingCount, draftCount])

  return (
    <div style={{ maxWidth: 1080, margin: '0 auto', padding: '32px 16px 48px', display: 'flex', flexDirection: 'column', gap: 24, fontFamily: "'MTSCompact', sans-serif" }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ fontSize: 24, fontWeight: 500, color: COLORS.text, fontFamily: "'MTSWide', sans-serif", lineHeight: '28px' }}>
          HR-панель — кампания {campaign.year}
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ width: 240 }}>
            <SelectField value={teamFilter} options={TEAM_OPTIONS} onChange={setTeamFilter} />
          </div>
          <button
            onClick={downloadReport}
            style={{ ...BTN_STYLE, height: 44, paddingLeft: 20, paddingRight: 20, borderRadius: 16, border: 'none', background: COLORS.bg, color: COLORS.text, cursor: 'pointer', flexShrink: 0 }}
          >
            Скачать отчёт
          </button>
        </div>
      </div>

      {/* Campaign status */}
      <div style={{ ...CARD_STYLE, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 320px' }}>
          <Banner
            type={campaign.active ? 'done' : 'info'}
            title={`Кампания по планированию ${campaign.year}`}
            subtitle={campaign.active
              ? 'Активна — сотрудники могут распределять дни отпуска'
              : 'Не активна — планирование закрыто'}
          />
        </div>
        <button
          onClick={handleToggle}
          style={{
            ...BTN_STYLE, height: 44, paddingLeft: 20, paddingRight: 20, borderRadius: 16, border: 'none', cursor: 'pointer', flexShrink: 0,
            background: campaign.active ? COLORS.bg : COLORS.blue,
            color: campaign.active ? COLORS.text : '#fff',
          }}
        >
          {campaign.active ? 'Завершить кампанию' : 'Запустить кампанию'}
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {stats.map(s => (
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
            {approvedCount} из {total}
          </span>
        </div>
        <div style={{ height: 8, background: COLORS.bg, borderRadius: 4, overflow: 'hidden', display: 'flex' }}>
          <div style={{ width: `${progressPct}%`, background: '#26CD58', transition: 'width 0.3s' }} />
          <div style={{ width: `${pendingPct}%`, background: '#FFBB00', transition: 'width 0.3s' }} />
        </div>
        <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: 9999, background: '#26CD58', flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: COLORS.secondary, fontFamily: "'MTSCompact', sans-serif" }}>Согласованы {progressPct}%</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: 9999, background: '#FFBB00', flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: COLORS.secondary, fontFamily: "'MTSCompact', sans-serif" }}>На согласовании {pendingPct}%</span>
          </div>
        </div>
      </div>

      {/* Employee plans table */}
      <div style={CARD_STYLE}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
          <span style={{ fontSize: 20, fontWeight: 500, color: COLORS.text, fontFamily: "'MTSWide', sans-serif", lineHeight: '24px' }}>
            Планы сотрудников
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            {STATUS_FILTER_OPTIONS.map(opt => (
              <Chip key={opt.id} active={statusFilter === opt.id} onClick={() => setStatusFilter(opt.id)}>
                {opt.name}
              </Chip>
            ))}
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <colgroup>
              <col style={{ width: 56 }} />
              <col />
              <col />
              <col style={{ width: 180 }} />
            </colgroup>
            <thead>
              <tr>
                <th style={{ ...TH, borderRadius: '12px 0 0 12px' }}>№</th>
                <th style={TH}>Сотрудник</th>
                <th style={TH}>Подразделение</th>
                <th style={{ ...TH, borderRadius: '0 12px 12px 0' }}>Статус</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={4} style={{ ...TD, textAlign: 'center', color: COLORS.secondary, padding: 32, borderTop: 'none' }}>Нет сотрудников с этим статусом</td></tr>
              ) : filtered.map((emp, i) => (
                <tr key={emp.id}>
                  <td style={TD}>{i + 1}</td>
                  <td style={TD}>{emp.name}</td>
                  <td style={TD}>{emp.team}</td>
                  <td style={TD}><StatusBadge type={emp.planStatus} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showConfirm && (
        <ConfirmModal
          onCancel={() => setShowConfirm(false)}
          onConfirm={confirmDeactivate}
        />
      )}
    </div>
  )
}
