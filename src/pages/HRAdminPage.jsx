import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { ALL_EMPLOYEES } from '../data/mockData'

const STATUS_FILTER_OPTIONS = [
  { key: 'all',      label: 'Все' },
  { key: 'approved', label: 'Согласованы' },
  { key: 'pending',  label: 'На согласовании' },
  { key: 'draft',    label: 'Черновик' },
]

const STATUS_UI = {
  approved: { label: 'Согласован',        cls: 'bg-green-100 text-green-700' },
  pending:  { label: 'На согласовании',   cls: 'bg-amber-100 text-amber-700' },
  draft:    { label: 'Черновик',          cls: 'bg-gray-100 text-gray-600' },
}

const TEAMS = [...new Set(ALL_EMPLOYEES.map(e => e.team))]

export default function HRAdminPage() {
  const { campaign, setCampaign } = useApp()
  const [showConfirm, setShowConfirm] = useState(false)
  const [statusFilter, setStatusFilter] = useState('all')

  const total         = ALL_EMPLOYEES.length
  const approvedCount = ALL_EMPLOYEES.filter(e => e.planStatus === 'approved').length
  const pendingCount  = ALL_EMPLOYEES.filter(e => e.planStatus === 'pending').length
  const draftCount    = ALL_EMPLOYEES.filter(e => e.planStatus === 'draft').length

  const progressPct = Math.round((approvedCount / total) * 100)
  const pendingPct  = Math.round((pendingCount  / total) * 100)

  const filtered = statusFilter === 'all'
    ? ALL_EMPLOYEES
    : ALL_EMPLOYEES.filter(e => e.planStatus === statusFilter)

  const byTeam = TEAMS
    .map(team => ({ team, employees: filtered.filter(e => e.team === team) }))
    .filter(g => g.employees.length > 0)

  function handleToggle() {
    if (campaign.active) {
      setShowConfirm(true)
    } else {
      setCampaign(prev => ({ ...prev, active: true }))
    }
  }

  function confirmDeactivate() {
    setCampaign(prev => ({ ...prev, active: false }))
    setShowConfirm(false)
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-5">
      <h1 className="text-lg font-semibold text-gray-900">
        HR-панель — кампания {campaign.year}
      </h1>

      {/* Campaign control */}
      <div className={`rounded-2xl border p-5 ${
        campaign.active ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
      }`}>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className={`text-sm font-semibold ${
              campaign.active ? 'text-green-800' : 'text-gray-700'
            }`}>
              Кампания по планированию {campaign.year}
            </p>
            <p className={`text-xs mt-0.5 ${
              campaign.active ? 'text-green-600' : 'text-gray-500'
            }`}>
              {campaign.active
                ? 'Активна — сотрудники могут распределять дни отпуска'
                : 'Не активна — планирование закрыто'}
            </p>
          </div>
          <button
            onClick={handleToggle}
            className={`shrink-0 px-4 py-2 text-sm font-medium rounded-xl transition-colors ${
              campaign.active
                ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
                : 'bg-[#0066ff] text-white hover:bg-[#0052cc]'
            }`}
          >
            {campaign.active ? 'Завершить кампанию' : 'Запустить кампанию'}
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-gray-100 rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{total}</p>
          <p className="text-xs text-gray-500 mt-1">Всего сотрудников</p>
        </div>
        <div className="bg-green-50 border border-green-100 rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold text-green-700">{approvedCount}</p>
          <p className="text-xs text-green-600 mt-1">Согласованы</p>
        </div>
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold text-amber-700">{pendingCount}</p>
          <p className="text-xs text-amber-600 mt-1">На согласовании</p>
        </div>
        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold text-gray-600">{draftCount}</p>
          <p className="text-xs text-gray-500 mt-1">Черновики</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-900">Прогресс согласования</h2>
          <span className="text-sm text-gray-500">{approvedCount} из {total}</span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden flex">
          <div
            className="h-full bg-green-500 transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
          <div
            className="h-full bg-amber-400 transition-all duration-500"
            style={{ width: `${pendingPct}%` }}
          />
        </div>
        <div className="flex gap-4 mt-2">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
            <span className="text-xs text-gray-500">Согласованы {progressPct}%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span className="text-xs text-gray-500">На согласовании {pendingPct}%</span>
          </div>
        </div>
      </div>

      {/* Employee list by team */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">По командам</h2>
          <div className="flex gap-1">
            {STATUS_FILTER_OPTIONS.map(opt => (
              <button
                key={opt.key}
                onClick={() => setStatusFilter(opt.key)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                  statusFilter === opt.key
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {byTeam.length === 0 ? (
          <div className="py-10 text-center text-sm text-gray-400">
            Нет сотрудников с этим статусом
          </div>
        ) : (
          byTeam.map(({ team, employees }) => (
            <div key={team}>
              <div className="px-5 py-2 bg-gray-50 border-b border-gray-100">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{team}</p>
              </div>
              <div className="divide-y divide-gray-50">
                {employees.map(emp => {
                  const sc = STATUS_UI[emp.planStatus] ?? STATUS_UI.draft
                  return (
                    <div key={emp.id} className="flex items-center px-5 py-3 gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 text-sm font-semibold text-indigo-600">
                        {emp.name[0]}
                      </div>
                      <p className="flex-1 text-sm text-gray-800">{emp.name}</p>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${sc.cls}`}>
                        {sc.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Confirm deactivation dialog */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowConfirm(false)}
          />
          <div className="relative bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl mx-4">
            <h3 className="text-base font-semibold text-gray-900 mb-2">Завершить кампанию?</h3>
            <p className="text-sm text-gray-500 mb-6">
              После завершения сотрудники не смогут изменять планы отпуска.
              Это действие можно отменить, запустив кампанию заново.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-2.5 text-sm font-medium rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={confirmDeactivate}
                className="flex-1 py-2.5 text-sm font-medium rounded-xl bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                Завершить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
