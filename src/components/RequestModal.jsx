import { useApp } from '../context/AppContext'
import { COLLEAGUES } from '../data/mockData'
import StatusBadge from './StatusBadge'

function formatDate(date) {
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function RequestModal({ request, onClose }) {
  const { setRequests } = useApp()

  if (!request) return null

  const canCancel = request.status === 'approved' || request.status === 'pending'

  const extraApproverName = request.extraApprover
    ? COLLEAGUES.find(c => String(c.id) === String(request.extraApprover))?.name
    : null

  function handleCancel() {
    setRequests(prev => prev.map(r =>
      r.id === request.id ? { ...r, status: 'cancelled' } : r
    ))
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md p-6 shadow-2xl">
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
          {extraApproverName && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Доп. согласующий</span>
              <span className="font-medium text-gray-900">{extraApproverName}</span>
            </div>
          )}
          {request.comment && (
            <div className="flex flex-col gap-1 text-sm">
              <span className="text-gray-500">Комментарий</span>
              <span className="text-gray-700 bg-gray-50 rounded-lg px-3 py-2">{request.comment}</span>
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

        {/* Actions */}
        {canCancel && (
          <button
            onClick={handleCancel}
            className="w-full py-2.5 rounded-xl border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 transition-colors"
          >
            Отменить заявку
          </button>
        )}
      </div>
    </div>
  )
}
