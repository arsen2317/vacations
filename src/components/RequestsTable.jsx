import { useState } from 'react'
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

export default function RequestsTable({ onSelectRequest }) {
  const { requests } = useApp()
  const [filter, setFilter] = useState('all')

  const filtered = filter === 'all'
    ? requests
    : requests.filter(r => r.status === filter)

  return (
    <div className="bg-white rounded-2xl border border-gray-100">
      {/* Filter tabs */}
      <div className="flex gap-1 p-4 border-b border-gray-100 overflow-x-auto">
        {FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === f.key
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="py-12 text-center text-gray-400 text-sm">
          Заявок в этом статусе нет
        </div>
      ) : (
        <div className="divide-y divide-gray-50">
          {filtered.map(req => (
            <button
              key={req.id}
              onClick={() => onSelectRequest(req)}
              className="w-full flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors text-left"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-gray-900 truncate">{req.typeLabel}</p>
                  <span className="text-xs text-gray-400 shrink-0">#{req.id}</span>
                </div>
                <p className="text-sm text-gray-500 mt-0.5">
                  {formatDateRange(req.startDate, req.endDate)} · {req.days} дн.
                </p>
                {req.type === 'planned' && req.rescheduleCount !== undefined && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    Переносов: {req.rescheduleCount}/{req.rescheduleLimit ?? 2}
                  </p>
                )}
              </div>
              <StatusBadge status={req.status} />
              <svg className="w-4 h-4 text-gray-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
