import { useState } from 'react'
import StatusBadge from './StatusBadge'
import { COLLEAGUES } from '../data/mockData'

function formatDate(date) {
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
}

const APPROVER_OPTIONS = COLLEAGUES.filter(c => !c.me)

export default function RequestModal({ request, onClose, onReschedule }) {
  const [showCancelForm, setShowCancelForm] = useState(false)
  const [cancelExtraApprover, setCancelExtraApprover] = useState('')
  const [cancelComment, setCancelComment] = useState('')

  if (!request) return null

  const status = request.status
  const rescheduleCount = request.rescheduleCount ?? 0
  const rescheduleLimit = request.rescheduleLimit ?? 2
  const canReschedule =
    request.type === 'planned' &&
    (status === 'approved' || status === 'pending') &&
    rescheduleCount < rescheduleLimit &&
    onReschedule

  function handleCancel() {
    if (request.type === 'planned') {
      setShowCancelForm(true)
    } else {
      onClose()
    }
  }

  const canCancel = status === 'approved' || status === 'pending'

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md p-6 shadow-2xl max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Заявка #{request.id}</p>
            <h2 className="text-lg font-semibold text-gray-900">{request.typeLabel}</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Status */}
        <div className="flex items-center gap-2 mb-5">
          <StatusBadge status={request.status} />
        </div>

        {/* Details */}
        <div className="space-y-3 mb-5">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Период</span>
            <span className="font-medium text-gray-900">
              {formatDate(request.startDate)} — {formatDate(request.endDate)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Количество дней</span>
            <span className="font-medium text-gray-900">{request.days} дн.</span>
          </div>
          {request.approver && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Согласующий</span>
              <span className="font-medium text-gray-900">
                {request.approver.name}
                <span className="text-gray-400 font-normal"> · {request.approver.role}</span>
              </span>
            </div>
          )}
          {request.type === 'planned' && request.rescheduleCount !== undefined && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Переносов использовано</span>
              <span className="font-medium text-gray-900">
                {request.rescheduleCount}/{request.rescheduleLimit ?? 2}
              </span>
            </div>
          )}
        </div>

        {/* Rejection comment */}
        {request.status === 'rejected' && request.rejectionComment && (
          <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-5">
            <p className="text-xs font-semibold text-red-600 uppercase tracking-wider mb-1">Причина отклонения</p>
            <p className="text-sm text-red-800">{request.rejectionComment}</p>
          </div>
        )}

        {/* Cancel form */}
        {showCancelForm ? (
          <div className="space-y-3">
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
              <p className="text-sm font-semibold text-amber-800">Отмена планового отпуска</p>
              <p className="text-xs text-amber-600 mt-0.5">Запрос будет направлен на согласование руководителю</p>
            </div>
            {request.approver && (
              <div className="text-sm">
                <p className="text-xs text-gray-500 mb-1">Согласующий</p>
                <p className="font-medium text-gray-800">
                  {request.approver.name}
                  <span className="text-gray-400 font-normal"> · {request.approver.role}</span>
                </p>
              </div>
            )}
            <div>
              <label className="text-xs text-gray-500 block mb-1">
                Дополнительный согласующий <span className="text-gray-400">(необязательно)</span>
              </label>
              <select
                value={cancelExtraApprover}
                onChange={e => setCancelExtraApprover(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
              >
                <option value="">Не назначать</option>
                {APPROVER_OPTIONS.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">
                Комментарий <span className="text-gray-400">(необязательно)</span>
              </label>
              <textarea
                value={cancelComment}
                onChange={e => setCancelComment(e.target.value)}
                rows={2}
                placeholder="Причина отмены"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300 placeholder-gray-300"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors"
              >
                Подтвердить отмену
              </button>
              <button
                onClick={() => setShowCancelForm(false)}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Назад
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {canReschedule && (
              <button
                onClick={onReschedule}
                className="w-full py-2.5 rounded-xl bg-[#0066ff] hover:bg-[#0052cc] text-white text-sm font-medium transition-colors"
              >
                Перенести отпуск
              </button>
            )}
            {canCancel && (
              <button
                onClick={handleCancel}
                className="w-full py-2.5 rounded-xl border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 transition-colors"
              >
                Отменить заявку
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
