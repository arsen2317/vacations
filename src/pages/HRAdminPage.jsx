import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { ALL_EMPLOYEES } from '../data/mockData'

const STATUS_UI = {
  approved: { label: 'Согласован',        cls: 'bg-green-100 text-green-700'  },
  pending:  { label: 'На согласовании',   cls: 'bg-amber-100 text-amber-700'  },
  draft:    { label: 'Черновик',          cls: 'bg-gray-100 text-gray-600'    },
  none:     { label: 'Без плана',         cls: 'bg-gray-100 text-gray-400'    },
}

function getInitials(name) {
  return name.split(' ').map(p => p[0]).join('').slice(0, 2)
}

export default function HRAdminPage() {
  const { campaign, setCampaign } = useApp()
  const [employees] = useState(ALL_EMPLOYEES)
  const [statusFilter, setStatusFilter] = useState('all')
  const [confirmToggle, setConfirmToggle] = useState(false)

  const stats = {
    total:    employees.length,
    approved: employees.filter(e => e.planStatus === 'approved').length,
    pending:  employees.filter(e => e.planStatus === 'pending').length,
    draft:    employees.filter(e => e.planStatus === 'draft').length,
    none:     employees.filter(e => !e.planStatus).length,
  }
  const submitted    = stats.approved + stats.pending
  const notSubmitted = stats.draft + stats.none
  const progressPct  = Math.round((stats.approved / stats.total) * 100)

  const filtered = statusFilter === 'all'
    ? employees
    : statusFilter === 'none'
    ? employees.filter(e => !e.planStatus)
    : employees.filter(e => e.planStatus === statusFilter)

  const byTeam = filtered.reduce((acc, emp) => {
    if (!acc[emp.team]) acc[emp.team] = []
    acc[emp.team].push(emp)
    return acc
  }, {})

  function toggleCampaign() {
    setCampaign(prev => ({ ...prev, active: !prev.active }))
    setConfirmToggle(false)
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Campaign control block */}
      <div className="bg-white border border-gray-200 rounded-xl px-5 py-4 mb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              Кампания по планированию {campaign.year}
            </h2>
            <div className="flex items-center gap-2 mt-1.5">
              <span
                className={`inline-flex items-center gap-1.5 text-sm ${
                  campaign.active ? 'text-green-700' : 'text-gray-500'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    campaign.active ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                  }`}
                />
                {campaign.active ? 'Активна' : 'Не активна'}
              </span>
            </div>
            {campaign.active && (
              <p className="text-xs text-gray-400 mt-1">
                Сотрудники могут подавать и редактировать планы отпусков
              </p>
            )}
            {!campaign.active && (
              <p className="text-xs text-gray-400 mt-1">
                Планирование отпусков недоступно для сотрудников
              </p>
            )}
          </div>

          <div className="shrink-0">
            {!confirmToggle ? (
              <button
                onClick={() => setConfirmToggle(true)}
                className={`px-4 py-2 text-sm font-medium rounded-xl transition-colors ${
                  campaign.active
                    ? 'bg-white border border-red-200 text-red-600 hover:bg-red-50'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {campaign.active ? 'Завершить кампанию' : 'Запустить кампанию'}
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-600">Подтвердить?</span>
                <button
                  onClick={toggleCampaign}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    campaign.active
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  Да
                </button>
                <button
                  onClick={() => setConfirmToggle(false)}
                  className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Отмена
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Всего сотрудников',  value: stats.total,    cls: 'text-gray-900'  },
          { label: 'Планы согласованы',  value: stats.approved, cls: 'text-green-600' },
          { label: 'На рассмотрении',    value: stats.pending,  cls: 'text-amber-600' },
          { label: 'Не сдали план',      value: notSubmitted,   cls: 'text-gray-400'  },
        ].map((stat, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-xl px-4 py-3">
            <p className={`text-2xl font-bold ${stat.cls}`}>{stat.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Готовность планов</span>
          <span className="text-sm text-gray-500">{submitted} из {stats.total} сдали план</span>
        </div>
        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden flex">
          <div
            className="h-full bg-green-500 transition-all duration-500"
            style={{ width: `${(stats.approved / stats.total) * 100}%` }}
          />
          <div
            className="h-full bg-amber-400 transition-all duration-500"
            style={{ width: `${(stats.pending / stats.total) * 100}%` }}
          />
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
          <span className="text-xs text-green-600 flex items-center gap-1">
            <span className="w-2 h-2 rounded-sm bg-green-500 inline-block" />
            Согласовано: {stats.approved}
          </span>
          <span className="text-xs text-amber-600 flex items-center gap-1">
            <span className="w-2 h-2 rounded-sm bg-amber-400 inline-block" />
            На рассмотрении: {stats.pending}
          </span>
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <span className="w-2 h-2 rounded-sm bg-gray-200 inline-block" />
            Не сдали: {notSubmitted}
          </span>
          <span className="text-xs font-medium text-gray-700 ml-auto">{progressPct}% согласовано</span>
        </div>
      </div>

      {/* Filter + employee list */}
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <h3 className="text-sm font-semibold text-gray-900">Все сотрудники</h3>
        <div className="flex gap-1.5 flex-wrap">
          {[
            { key: 'all',      label: 'Все'              },
            { key: 'approved', label: 'Согласован'       },
            { key: 'pending',  label: 'На согласовании'  },
            { key: 'draft',    label: 'Черновик'         },
            { key: 'none',     label: 'Без плана'        },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setStatusFilter(f.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                statusFilter === f.key
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {Object.keys(byTeam).length === 0 && (
        <div className="bg-white border border-gray-200 rounded-xl px-4 py-10 text-center">
          <p className="text-sm text-gray-400">Нет сотрудников с выбранным статусом</p>
        </div>
      )}

      <div className="space-y-3">
        {Object.entries(byTeam).map(([team, emps]) => (
          <div key={team} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
              <p className="text-xs font-semibold text-gray-600">{team}</p>
              <span className="text-xs text-gray-400">{emps.length} чел.</span>
            </div>
            <div className="divide-y divide-gray-50">
              {emps.map(emp => {
                const statusKey = emp.planStatus || 'none'
                const { label, cls } = STATUS_UI[statusKey] || STATUS_UI.none
                return (
                  <div key={emp.id} className="flex items-center px-4 py-2.5 gap-3">
                    <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 text-xs font-semibold shrink-0">
                      {getInitials(emp.name)}
                    </div>
                    <p className="flex-1 text-sm text-gray-800">{emp.name}</p>
                    <span className={`text-[11px] font-medium px-1.5 py-0.5 rounded-full ${cls}`}>
                      {label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
