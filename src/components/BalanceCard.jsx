import { CURRENT_USER } from '../data/mockData'

export default function BalanceCard() {
  const { balanceDays, balanceExtra } = CURRENT_USER

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Остаток дней</p>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Основной оплачиваемый</p>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-gray-900">{balanceDays}</span>
            <span className="text-sm text-gray-500">дн.</span>
          </div>
        </div>

        <div className="h-px bg-gray-100" />

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Дополнительный</p>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-gray-900">{balanceExtra}</span>
            <span className="text-sm text-gray-500">дн.</span>
          </div>
        </div>
      </div>
    </div>
  )
}
