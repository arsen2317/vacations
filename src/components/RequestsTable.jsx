import { useState } from 'react'
import { Table, Button, Space, Typography } from 'antd'
import StatusBadge from './StatusBadge'
import { useApp } from '../context/AppContext'

function formatDateRange(start, end) {
  const opts = { day: 'numeric', month: 'short' }
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

const COLUMNS = [
  {
    title: 'Тип',
    key: 'type',
    render: (_, r) => (
      <>
        <Typography.Text style={{ fontSize: 14 }}>{r.typeLabel}</Typography.Text>
        <Typography.Text type="secondary" style={{ fontSize: 12, display: 'block' }}>#{r.id}</Typography.Text>
      </>
    ),
  },
  {
    title: 'Период',
    key: 'period',
    render: (_, r) => (
      <>
        <Typography.Text style={{ fontSize: 14 }}>{formatDateRange(r.startDate, r.endDate)}</Typography.Text>
        <Typography.Text type="secondary" style={{ fontSize: 12, display: 'block' }}>{r.days} дн.</Typography.Text>
      </>
    ),
  },
  {
    title: 'Переносов',
    key: 'reschedule',
    responsive: ['md'],
    render: (_, r) => r.type === 'planned' && r.rescheduleCount !== undefined
      ? `${r.rescheduleCount} / ${r.rescheduleLimit ?? 2}`
      : '—',
  },
  {
    title: 'Статус',
    key: 'status',
    render: (_, r) => <StatusBadge status={r.status} />,
  },
]

export default function RequestsTable({ onSelectRequest }) {
  const { requests } = useApp()
  const [filter, setFilter] = useState('all')

  const filtered = filter === 'all' ? requests : requests.filter(r => r.status === filter)

  return (
    <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #f0f0f0', overflow: 'hidden' }}>
      <div style={{ padding: '10px 16px', borderBottom: '1px solid #f0f0f0' }}>
        <Space wrap size={[4, 4]}>
          {FILTERS.map(f => (
            <Button
              key={f.key}
              size="small"
              type={filter === f.key ? 'primary' : 'text'}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </Button>
          ))}
        </Space>
      </div>
      <Table
        dataSource={filtered}
        columns={COLUMNS}
        rowKey="id"
        pagination={false}
        size="middle"
        onRow={r => ({ onClick: () => onSelectRequest(r), style: { cursor: 'pointer' } })}
        locale={{ emptyText: 'Заявок в этом статусе нет' }}
      />
    </div>
  )
}
