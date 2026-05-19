import { useApp } from '../context/AppContext'

export default function CampaignBanner() {
  const { campaign } = useApp()
  const remaining = campaign.totalDays - campaign.distributedDays

  if (campaign.active) {
    return (
      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex items-start gap-3">
        <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0 animate-pulse" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-indigo-800">
            Идёт кампания по планированию отпусков на {campaign.year} год
          </p>
          <p className="text-sm text-indigo-600 mt-0.5">
            Нераспределено: <span className="font-semibold">{remaining} из {campaign.totalDays} дней</span>
            {remaining > 0
              ? ' — распределите все дни и отправьте план на согласование'
              : ' — все дни распределены, можно отправлять на согласование'
            }
          </p>
        </div>
        <button className="shrink-0 text-sm font-medium text-indigo-700 bg-indigo-100 hover:bg-indigo-200 transition-colors px-3 py-1.5 rounded-lg">
          Перейти к планированию
        </button>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-start gap-3">
      <div className="w-2 h-2 rounded-full bg-gray-400 mt-1.5 shrink-0" />
      <div>
        <p className="text-sm font-semibold text-gray-700">
          Кампания по планированию не активна
        </p>
        <p className="text-sm text-gray-500 mt-0.5">
          Внеплановые заявки доступны в любое время
        </p>
      </div>
    </div>
  )
}
