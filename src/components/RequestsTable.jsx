import { useState } from 'react'
import StatusBadge from './StatusBadge'
import { Chip, COLORS, BTN_STYLE } from '../ds/index'
import { useApp } from '../context/AppContext'

const PAGE_SIZE = 10

function formatDateRange(start, end) {
  const dayMonth = { day: 'numeric', month: 'long' }
  const s = start.toLocaleDateString('ru-RU', dayMonth)
  const e = end.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
  return `${s} – ${e}`
}

const FILTERS = [
  { key: 'all',       label: 'Все' },
  { key: 'approved',  label: 'Согласованные' },
  { key: 'pending',   label: 'На согласовании' },
  { key: 'reviewing', label: 'На ознакомлении' },
  { key: 'draft',     label: 'Черновики' },
  { key: 'rejected',  label: 'Отклонённые' },
  { key: 'cancelled', label: 'Отменённые' },
]

const TH = {
  padding: '12px 16px',
  fontSize: 13,
  fontWeight: 400,
  color: COLORS.secondary,
  textAlign: 'left',
  fontFamily: "'MTSCompact', sans-serif",
  borderBottom: `1px solid ${COLORS.stroke}`,
  whiteSpace: 'nowrap',
}

const TD = {
  padding: '16px',
  fontSize: 14,
  color: COLORS.text,
  fontFamily: "'MTSCompact', sans-serif",
  borderBottom: `1px solid ${COLORS.stroke}`,
  verticalAlign: 'middle',
}

function PaginationDots() {
  return <span style={{ color: COLORS.secondary, padding: '0 4px' }}>...</span>
}

function PageBtn({ page, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: 36,
        height: 36,
        borderRadius: '50%',
        border: 'none',
        background: active ? COLORS.text : 'transparent',
        color: active ? '#fff' : COLORS.text,
        fontSize: 14,
        fontFamily: "'MTSCompact', sans-serif",
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: active ? 500 : 400,
      }}
    >
      {page}
    </button>
  )
}

function ArrowBtn({ dir, disabled, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: 36,
        height: 36,
        borderRadius: '50%',
        border: 'none',
        background: 'transparent',
        color: disabled ? COLORS.hint : COLORS.text,
        fontSize: 16,
        cursor: disabled ? 'default' : 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {dir === 'prev' ? '‹' : '›'}
    </button>
  )
}

function Pagination({ page, total, onPage }) {
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  if (totalPages <= 1) return null

  const pages = []
  for (let i = 1; i <= totalPages; i++) pages.push(i)

  const visible = pages.filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)

  const items = []
  let prev = null
  for (const p of visible) {
    if (prev !== null && p - prev > 1) items.push('dots' + prev)
    items.push(p)
    prev = p
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', gap: 2 }}>
      <ArrowBtn dir="prev" disabled={page === 1} onClick={() => onPage(page - 1)} />
      {items.map(item =>
        typeof item === 'string'
          ? <PaginationDots key={item} />
          : <PageBtn key={item} page={item} active={item === page} onClick={() => onPage(item)} />
      )}
      <ArrowBtn dir="next" disabled={page === totalPages} onClick={() => onPage(page + 1)} />
    </div>
  )
}

export default function RequestsTable({ onSelectRequest, onNewRequest }) {
  const { requests } = useApp()
  const [filter, setFilter] = useState('all')
  const [page, setPage] = useState(1)

  const filtered = filter === 'all' ? requests : requests.filter(r => r.status === filter)
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function handleFilter(key) {
    setFilter(key)
    setPage(1)
  }

  return (
    <div style={{ background: '#fff', borderRadius: 12, overflow: 'hidden' }}>
      <div style={{
        padding: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        flexWrap: 'wrap',
        borderBottom: `1px solid ${COLORS.stroke}`,
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {FILTERS.map(f => (
            <Chip key={f.key} active={filter === f.key} onClick={() => handleFilter(f.key)}>
              {f.label}
            </Chip>
          ))}
        </div>
        {onNewRequest && (
          <button
            onClick={onNewRequest}
            style={{
              ...BTN_STYLE,
              background: COLORS.blue,
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
              padding: '12px 24px',
              borderRadius: 8,
              flexShrink: 0,
              whiteSpace: 'nowrap',
            }}
          >
            НОВАЯ ЗАЯВКА
          </button>
        )}
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: '11%' }} />
            <col style={{ width: '34%' }} />
            <col style={{ width: '22%' }} />
            <col style={{ width: '9%' }} />
            <col style={{ width: '16%' }} />
            <col style={{ width: '8%' }} />
          </colgroup>
          <thead>
            <tr>
              <th style={TH}>№ заявки</th>
              <th style={TH}>Тип</th>
              <th style={TH}>Период</th>
              <th style={{ ...TH, textAlign: 'center' }}>Переносы</th>
              <th style={TH}>Статус</th>
              <th style={{ ...TH, textAlign: 'center' }}>Действия</th>
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ ...TD, textAlign: 'center', color: COLORS.secondary, padding: '32px 16px' }}>
                  Заявок в этом статусе нет
                </td>
              </tr>
            ) : paged.map((r, i) => (
              <tr
                key={r.id}
                onClick={() => onSelectRequest(r)}
                style={{ cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.background = '#FAFAFA'}
                onMouseLeave={e => e.currentTarget.style.background = ''}
              >
                <td style={{ ...TD, borderBottom: i === paged.length - 1 ? 'none' : TD.borderBottom }}>
                  <span style={{ fontSize: 14, color: COLORS.text }}>{r.id}</span>
                </td>
                <td style={{ ...TD, borderBottom: i === paged.length - 1 ? 'none' : TD.borderBottom }}>
                  <div style={{ fontSize: 14, color: COLORS.text, lineHeight: '20px' }}>
                    {r.typeFullName || r.typeLabel}
                  </div>
                  <div style={{ fontSize: 12, color: COLORS.secondary, lineHeight: '16px', marginTop: 2 }}>
                    {r.planCategory || (r.type === 'planned' ? 'Плановый' : 'Внеплановый')}
                  </div>
                </td>
                <td style={{ ...TD, borderBottom: i === paged.length - 1 ? 'none' : TD.borderBottom }}>
                  <div style={{ fontSize: 14, color: COLORS.text, lineHeight: '20px' }}>
                    {formatDateRange(r.startDate, r.endDate)}
                  </div>
                  <div style={{ fontSize: 12, color: COLORS.secondary, lineHeight: '16px', marginTop: 2 }}>
                    {r.days} дней
                  </div>
                </td>
                <td style={{ ...TD, textAlign: 'center', borderBottom: i === paged.length - 1 ? 'none' : TD.borderBottom }}>
                  <span style={{ color: COLORS.secondary }}>
                    {r.type === 'planned' && r.rescheduleCount > 0
                      ? `${r.rescheduleCount} / ${r.rescheduleLimit ?? 2}`
                      : '—'}
                  </span>
                </td>
                <td style={{ ...TD, borderBottom: i === paged.length - 1 ? 'none' : TD.borderBottom }}>
                  <StatusBadge status={r.status} />
                </td>
                <td style={{ ...TD, textAlign: 'center', borderBottom: i === paged.length - 1 ? 'none' : TD.borderBottom }}>
                  <button
                    style={{
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer',
                      color: COLORS.secondary,
                      fontSize: 20,
                      padding: '4px 8px',
                      borderRadius: 6,
                      lineHeight: 1,
                      letterSpacing: '2px',
                    }}
                    onClick={e => e.stopPropagation()}
                  >
                    ···
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination page={page} total={filtered.length} onPage={setPage} />
    </div>
  )
}
