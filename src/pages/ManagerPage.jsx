import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { fmtDate, pluralDays } from '../utils/dateUtils'

const STATUS_UI = {
  draft:    { label: 'Черновик',         cls: 'bg-gray-100 text-gray-600' },
  pending:  { label: 'На согласовании',  cls: 'bg-amber-100 text-amber-700' },
  approved: { label: 'Согласован',       cls: 'bg-green-100 text-green-700' },
  rejected: { label: 'Отклонён',         cls: 'bg-red-100 text-red-700' },
}

export default function ManagerPage() {
  const { subordinates, setSubordinates, campaign } = useApp()
  const [expandedId, setExpandedId] = useState(null)
  const [comment, setComment] = useState('')
  const [commentError, setCommentError] = useState('')

  const sorted = [...subordinates].sort((a, b) => {
    if (a.planStatus === 'pending' && b.planStatus !== 'pending') return -1
    if (a.planStatus !== 'pending' && b.planStatus === 'pending') return 1
    return 0
  })

  const pendingCount  = subordinates.filter(s => s.planStatus === 'pending').length
  const approvedCount = subordinates.filter(s => s.planStatus === 'approved').length
  const draftCount    = subordinates.filter(s => s.planStatus === 'draft').length

  function toggleExpand(id) {
    if (expandedId === id) {
      setExpandedId(null)
      setComment('')
      setCommentError('')
    } else {
      setExpandedId(id)
      setComment('')
      setCommentError('')
    }
  }

  function handleApprove(id) {
    setSubordinates(prev =>
      prev.map(s => s.id === id ? { ...s, planStatus: 'approved' } : s)
    )
    setExpandedId(null)
    setComment('')
    setCommentError('')
  }

  function handleReject(id) {
    if (!comment.trim()) {
      setCommentError('Комментарий обязателен при отклонении')
      return
    }
    setSubordinates(prev =>
      prev.map(s => s.id === id ? { ...s, planStatus: 'rejected', rejectionComment: comment } : s)
    )
    setExpandedId(null)
    setComment('')
    setCommentError('')
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-5">
      <h1 className="text-lg font-semibold text-gray-900">
        Команда — планирование отпуска на {campaign.year} год
      </h1>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold text-amber-700">{pendingCount}</p>
          <p className="text-xs text-amber-600 mt-1">На согласовании</p>
        </div>
        <div className="bg-green-50 border border-green-100 rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold text-green-700">{approvedCount}</p>
          <p className="text-xs text-green-600 mt-1">Согласованы</p>
        </div>
        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold text-gray-600">{draftCount}</p>
          <p className="text-xs text-gray-500 mt-1">В черновике</p>
        </div>
      </div>

      {/* Subordinates list */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">Сотрудники</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {sorted.map(sub => {
            const { label, cls } = STATUS_UI[sub.planStatus] ?? STATUS_UI.draft
            const isExpanded = expandedId === sub.id
            const isPending  = sub.planStatus === 'pending'

            return (
              <div key={sub.id}>
                <div className="flex items-center px-5 py-4 gap-4">
                  <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 text-sm font-semibold text-indigo-600">
                    {sub.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{sub.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{sub.position}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${cls}`}>
                        {label}
                      </span>
                      {sub.planStatus === 'pending' && (
                        <span className="text-[11px] text-gray-400">
                          {sub.distributedDays}/{sub.totalDays} дн. распределено
                        </span>
                      )}
                    </div>
                  </div>
                  {isPending && (
                    <button
                      onClick={() => toggleExpand(sub.id)}
                      className={`shrink-0 text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors ${
                        isExpanded
                          ? 'bg-gray-100 border-gray-200 text-gray-600'
                          : 'border-indigo-200 text-indigo-600 hover:bg-indigo-50'
                      }`}
                    >
                      {isExpanded ? 'Скрыть' : 'Рассмотреть'}
                    </button>
                  )}
                </div>

                {isExpanded && (
                  <div className="mx-5 mb-4 p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-3">
                    {sub.segments?.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-gray-600 mb-2">Отрезки отпуска:</p>
                        <div className="space-y-1">
                          {sub.segments.map((seg, i) => (
                            <div key={i} className="flex items-center gap-2 text-xs text-gray-600">
                              <span className="text-gray-300 w-4 text-right shrink-0">{i + 1}.</span>
                              <span>{fmtDate(seg.startDate)} — {fmtDate(seg.endDate)}</span>
                              <span className="text-gray-400">({pluralDays(seg.days)})</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="text-xs font-semibold text-gray-600 block mb-1.5">
                        Комментарий{' '}
                        <span className="font-normal text-gray-400">(обязателен при отклонении)</span>
                      </label>
                      <textarea
                        value={comment}
                        onChange={e => { setComment(e.target.value); setCommentError('') }}
                        rows={2}
                        placeholder="Введите комментарий..."
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white placeholder-gray-300"
                      />
                      {commentError && <p className="text-xs text-red-500 mt-1">{commentError}</p>}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(sub.id)}
                        className="flex-1 py-2 text-sm font-medium rounded-lg bg-green-600 hover:bg-green-700 text-white transition-colors"
                      >
                        Одобрить
                      </button>
                      <button
                        onClick={() => handleReject(sub.id)}
                        className="flex-1 py-2 text-sm font-medium rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                      >
                        Отклонить
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
