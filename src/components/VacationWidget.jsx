import { UPCOMING_VACATION } from '../data/mockData'

function getDaysUntil(date) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diff = date - today
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

function formatDate(date) {
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })
}

export default function VacationWidget() {
  const vacation = UPCOMING_VACATION
  const daysUntil = getDaysUntil(vacation.startDate)
  const duration = Math.ceil((vacation.endDate - vacation.startDate) / (1000 * 60 * 60 * 24)) + 1

  return (
    <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-500 text-white p-6 min-h-[180px] flex flex-col justify-between">
      {/* Decorative circles */}
      <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10" />
      <div className="absolute -bottom-12 -left-6 w-48 h-48 rounded-full bg-white/5" />

      <div className="relative">
        <p className="text-sm font-medium text-white/70 uppercase tracking-wider">Ближайший отпуск</p>
        <p className="text-lg font-semibold mt-1">
          {formatDate(vacation.startDate)} — {formatDate(vacation.endDate)}
        </p>
        <p className="text-sm text-white/70 mt-0.5">{duration} дней</p>
      </div>

      <div className="relative flex items-end justify-between">
        <div>
          <p className="text-5xl font-bold leading-none">{daysUntil}</p>
          <p className="text-sm text-white/80 mt-1">
            {daysUntil === 1 ? 'день до отпуска' : daysUntil < 5 ? 'дня до отпуска' : 'дней до отпуска'}
          </p>
        </div>

        {/* Cover image placeholder */}
        <button className="flex flex-col items-center gap-1 group">
          <div className="w-14 h-14 rounded-xl bg-white/20 border-2 border-dashed border-white/40 flex items-center justify-center group-hover:bg-white/30 transition-colors">
            <svg className="w-6 h-6 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <span className="text-xs text-white/60">Обложка</span>
        </button>
      </div>
    </div>
  )
}
