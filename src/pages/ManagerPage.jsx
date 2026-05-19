import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { fmtDate, pluralDays } from '../utils/dateUtils'

const STATUS_UI = {
  draft:    { label: 'Черновик',        cls: 'bg-gray-100 text-gray-600'   },
  pending:  { label: 'На согласовании', cls: 'bg-amber-100 text-amber-700' },
  approved: { label: 'Согласован',      cls: 'bg-green-100 text-green-700' },
  rejected: { label: 'Отклонён',        cls: 'bg-red-100 text-red-700'     },
}

export default function ManagerPage() {
  const { subordinates, setSubordinates, campaign } = useApp()
  const [rejectingId, setRejectingId] = useState(null)
  const [rejectComment, setRejectComment] = useState('')
  const [rejectError, setRejectError] = useState('')

  const counts = {
    total:    subordinates.length,
    pending:  subordinates.filter(e => e.planStatus === 'pending').length,
    approved: subordinates.filter(e => e.planStatus === 'approved').length,
    draft:    subordinates.filter(e => e.planStatus === 'draft').length,
  }

  function approve(id) {
    setSubordinates(prev => prev.map(e => e.id === id ? { ...e, planStatus: 'approved', rejectComment: null } : e))
  }

  function startReject(id) {
    setRejectingId(id)
    setRejectComment('')
    setRejectError('')
  }

  function confirmReject(id) {
    if (!rejectComment.trim()) {
      setRejectError('Укажите причину отклонения')
      return
    }
    setSubordinates(prev => prev.map(e =>
      e.id === id ? { ...e, planStatus: 'rejected', rejectComment: rejectComment.trim() } : e,
    ))
    setRejectingId(null)
    setRejectComment('')
    setRejectError('')
  }

  // Sort: pending first, then approved, then rest
  const sorted = [...subordinates].sort((a, b) => {
    const order = { pending: 0, approved: 1, draft: 2, rejected: 3 }
    return (order[a.planStatus] ?? 2) - (order[b.planStatus] ?? 2)
  })

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="mb-5">
        <h1 className="text-lg font-semibold text-gray-900">Команда</h1>
        <p className="text-sm text-gray-500 mt-0.5">Планы отпусков подчинённых на {campaign.year} год</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Всего сотрудников',  value: counts.total,    cls: 'text-gray-900'  },
          { label: 'На согласовании',    value: counts.pending,  cls: 'text-amber-600' },
          { label: 'Согласовано',        value: counts.approved, cls: 'text-green-600' },
          { label: 'Черновик',           value: counts.draft,    cls: 'text-gray-400'  },
        ].map((stat, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-xl px-4 py-3">
            <p className={`text-2xl font-bold ${stat.cls}`}>{stat.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {counts.pending > 0 && (
        <div className="flex items-center gap-2 mb-3">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          <p className="text-xs font-semibold text-amber-700">
            {counts.pending === 1 ? '1 план ожидает согласования' : `${counts.pending} плана ожидают согласования`}
          </p>
        </div>
      )}

      {/* Employee list */}
      <div className="space-y-3">
        {sorted.map(emp => {
          const statusUI = STATUS_UI[emp.planStatus] || STATUS_UI.draft
          const isPending = emp.planStatus === 'pending'
          const isRejecting = rejectingId === emp.id

          return (
            <div
              key={emp.id}
              className={`bg-white border rounded-xl overflow-hidden transition-shadow ${
                isPending ? 'border-amber-200 shadow-sm shadow-amber-50' : 'border-gray-200'
              }`}
            >
              {/* Header row */}
              <div className="flex items-center px-4 py-3 gap-3">
                <div
                  className={`w-9 h-9 rounded-full ${emp.colorClass} flex items-center justify-center text-white text-sm font-semibold shrink-0`}
                >
                  {emp.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{emp.name}</p>
                  <span className={`inline-block mt-0.5 text-[11px] font-medium px-1.5 py-0.5 rounded-full ${statusUI.cls}`}>
                    {statusUI.label}
                  </span>
                </div>

                {isPending && !isRejecting && (
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => approve(emp.id)}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors"
                    >
                      Одобрить
                    </button>
                    <button
                      onClick={() => startReject(emp.id)}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Отклонить
                    </button>
                  </div>
                )}
              </div>

              {/* Segments */}
              {emp.segments.length > 0 ? (
                <div className="border-t border-gray-100 divide-y divide-gray-50">
                  {emp.segments.map((seg, i) => (
                    <div key={i} className="flex items-center px-4 py-2 gap-3">
                      <span className="text-xs text-gray-300 w-4 shrink-0 text-right">{i + 1}</span>
                      <p className="text-sm text-gray-700">
                        {fmtDate(seg.startDate)} — {fmtDate(seg.endDate)}
                      </p>
                      <span className="text-xs text-gray-400 ml-auto">{pluralDays(seg.days)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border-t border-gray-100 px-4 py-2.5">
                  <p className="text-xs text-gray-400">Отрезки не добавлены</p>
                </div>
              )}

              {/* Reject form */}
              {isRejecting && (
                <div className="border-t border-red-100 bg-red-50 px-4 py-3">
                  <p className="text-xs font-semibold text-red-700 mb-2">Причина отклонения</p>
                  <textarea
                    value={rejectComment}
                    onChange={e => { setRejectComment(e.target.value); setRejectError('') }}
                    placeholder="Укажите причину..."
                    rows={2}
                    className="w-full px-3 py-2 text-sm border border-red-200 rounded-lg bg-white resize-none focus:outline-none focus:ring-2 focus:ring-red-300"
                  />
                  {rejectError && <p className="text-xs text-red-500 mt-1">{rejectError}</p>}
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => confirmReject(emp.id)}
                      className="flex-1 py-1.5 text-sm font-medium rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
                    >
                      Отклонить план
                    </button>
                    <button
                      onClick={() => { setRejectingId(null); setRejectError('') }}
                      className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      Отмена
                    </button>
                  </div>
                </div>
              )}

              {/* Rejection comment display */}
              {emp.planStatus === 'rejected' && emp.rejectComment && (
                <div className="border-t border-red-100 bg-red-50 px-4 py-2">
                  <p className="text-xs text-red-600">
                    <span className="font-medium">Причина отклонения: </span>
                    {emp.rejectComment}
                  </p>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
