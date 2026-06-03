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
  background: COLORS.bg,
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
    <div>
      <div style={{
        padding: 0,
        marginBottom: 16,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        flexWrap: 'wrap',
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
              height: 44,
              padding: '0 24px',
              borderRadius: 16,
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
                    style={{ border: 'none', background: '#F2F3F7', cursor: 'pointer', width: 44, height: 44, borderRadius: 16, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: 10, flexShrink: 0 }}
                    onClick={e => e.stopPropagation()}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="4" viewBox="0 0 18 4" fill="none">
                      <path d="M0.0180118 1.53841C0.0612773 0.957075 0.08291 0.666409 0.37466 0.37466C0.666409 0.08291 0.957075 0.0612773 1.53841 0.0180118C1.6891 0.00679629 1.84455 0 2 0C2.15545 0 2.3109 0.00679629 2.46159 0.0180118C3.04293 0.0612773 3.33359 0.08291 3.62534 0.37466C3.91709 0.666409 3.93872 0.957075 3.98199 1.53841C3.9932 1.6891 4 1.84455 4 2C4 2.15545 3.9932 2.3109 3.98199 2.46159C3.93872 3.04293 3.91709 3.33359 3.62534 3.62534C3.33359 3.91709 3.04293 3.93872 2.46159 3.98199C2.3109 3.9932 2.15545 4 1.53841 3.98199C0.957075 3.93872 0.666409 3.91709 0.37466 3.62534C0.08291 3.33359 0.0612773 3.04293 0.0180118 2.46159C0.00679629 2.3109 0 2.15545 0 2C0 1.84455 0.00679629 1.6891 0.0180118 1.53841Z" fill="#1D2023"/>
                      <path d="M7.01801 1.53841C7.06128 0.957075 7.08291 0.666409 7.37466 0.37466C7.66641 0.08291 7.95707 0.0612773 8.53841 0.0180118C8.6891 0.00679629 8.84455 0 9 0C9.15545 0 9.3109 0.00679629 9.46159 0.0180118C10.0429 0.0612773 10.3336 0.08291 10.6253 0.37466C10.9171 0.666409 10.9387 0.957075 10.982 1.53841C10.9932 1.6891 11 1.84455 11 2C11 2.15545 10.9932 2.3109 10.982 2.46159C10.9387 3.04293 10.9171 3.33359 10.6253 3.62534C10.3336 3.91709 10.0429 3.93872 9.46159 3.98199C9.3109 3.9932 9.15545 4 9 4C8.84455 4 8.6891 3.9932 8.53841 3.98199C7.95707 3.93872 7.66641 3.91709 7.37466 3.62534C7.08291 3.33359 7.06128 3.04293 7.01801 2.46159C7.0068 2.3109 7 2.15545 7 2C7 1.84455 7.0068 1.6891 7.01801 1.53841Z" fill="#1D2023"/>
                      <path d="M14.3747 0.37466C14.0829 0.666409 14.0613 0.957075 14.018 1.53841C14.0068 1.6891 14 1.84455 14 2C14 2.15545 14.0068 2.3109 14.018 2.46159C14.0613 3.04293 14.0829 3.33359 14.3747 3.62534C14.6664 3.91709 14.9571 3.93872 15.5384 3.98199C15.6891 3.9932 15.8446 4 16 4C16.1554 4 16.3109 3.9932 16.4616 3.98199C17.0429 3.93872 17.3336 3.91709 17.6253 3.62534C17.9171 3.33359 17.9387 3.04293 17.982 2.46159C17.9932 2.3109 18 2.15545 18 2C18 1.84455 17.9932 1.6891 17.982 1.53841C17.9387 0.957075 17.9171 0.666409 17.6253 0.37466C17.3336 0.08291 17.0429 0.0612773 16.4616 0.0180118C16.3109 0.00679629 16.1554 0 16 0C15.8446 0 15.6891 0.00679629 15.5384 0.0180118C14.9571 0.0612773 14.6664 0.08291 14.3747 0.37466Z" fill="#1D2023"/>
                    </svg>
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
