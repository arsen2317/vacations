import { useState } from 'react'
import { Table, Typography } from 'antd'
import StatusBadge from './StatusBadge'
import { Chip, COLORS, BTN_STYLE } from '../ds/index'
import { useApp } from '../context/AppContext'

function formatDateRange(start, end) {
  const opts = { day: 'numeric', month: 'long' }
  return `${start.toLocaleDateString('ru-RU', opts)} — ${end.toLocaleDateString('ru-RU', opts)}`
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

export default function RequestsTable({ onSelectRequest, onNewRequest }) {
  const { requests } = useApp()
  const [filter, setFilter] = useState('all')

  const filtered = filter === 'all' ? requests : requests.filter(r => r.status === filter)

  const columns = [
    {
      title: '№ заявки',
      key: 'id',
      render: (_, r) => (
        <Typography.Text style={{ fontSize: 14, color: COLORS.text }}>
          {r.id}
        </Typography.Text>
      ),
    },
    {
      title: 'Тип',
      key: 'type',
      render: (_, r) => (
        <>
          <Typography.Text style={{ fontSize: 14, color: COLORS.text }}>
            {r.typeFullName || r.typeLabel}
          </Typography.Text>
          <Typography.Text style={{ fontSize: 12, color: COLORS.secondary, display: 'block' }}>
            {r.planCategory || (r.type === 'planned' ? 'Плановый' : 'Внеплановый')}
          </Typography.Text>
        </>
      ),
    },
    {
      title: 'Период',
      key: 'period',
      render: (_, r) => (
        <>
          <Typography.Text style={{ fontSize: 14, color: COLORS.text }}>
            {formatDateRange(r.startDate, r.endDate)}
          </Typography.Text>
          <Typography.Text style={{ fontSize: 12, color: COLORS.secondary, display: 'block' }}>
            {r.days} дней
          </Typography.Text>
        </>
      ),
    },
    {
      title: 'Переносы',
      key: 'reschedule',
      responsive: ['md'],
      render: (_, r) => (
        <Typography.Text style={{ color: COLORS.secondary }}>
          {r.type === 'planned' && r.rescheduleCount !== undefined
            ? `${r.rescheduleCount} / ${r.rescheduleLimit ?? 2}`
            : '—'
          }
        </Typography.Text>
      ),
    },
    {
      title: 'Статус',
      key: 'status',
      render: (_, r) => <StatusBadge status={r.status} />,
    },
    {
      title: 'Действия',
      key: 'actions',
      render: () => (
        <button
          style={{
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            color: COLORS.secondary,
            fontSize: 20,
            padding: '4px 8px',
            borderRadius: 8,
            lineHeight: 1,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          ···
        </button>
      ),
    },
  ]

  return (
    <div style={{ background: '#fff', borderRadius: 8, border: `1px solid ${COLORS.stroke}`, overflow: 'hidden' }}>
      <div style={{
        padding: '12px 16px',
        borderBottom: `1px solid ${COLORS.stroke}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {FILTERS.map(f => (
            <Chip
              key={f.key}
              active={filter === f.key}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </Chip>
          ))}
        </div>
        {onNewRequest && (
          <button
            onClick={onNewRequest}
            style={{
              ...BTN_STYLE,
              background: '#0066FF',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
              padding: '12px 24px',
              borderRadius: 8,
              flexShrink: 0,
            }}
          >
            + НОВАЯ ЗАЯВКА
          </button>
        )}
      </div>
      <Table
        dataSource={filtered}
        columns={columns}
        rowKey="id"
        pagination={false}
        size="middle"
        onRow={r => ({ onClick: () => onSelectRequest(r), style: { cursor: 'pointer' } })}
        locale={{ emptyText: 'Заявок в этом статусе нет' }}
      />
    </div>
  )
}
