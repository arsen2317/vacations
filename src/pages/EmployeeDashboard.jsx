import { useState } from 'react'
import { useApp } from '../context/AppContext'
import CampaignBanner from '../components/CampaignBanner'
import VacationWidget from '../components/VacationWidget'
import BalanceCard from '../components/BalanceCard'
import RequestsTable from '../components/RequestsTable'
import RequestModal from '../components/RequestModal'
import NewRequestModal from '../components/NewRequestModal'

function ManagerSummaryCard({ subordinates, onGoToTeam }) {
  const pendingCount = subordinates.filter(s => s.planStatus === 'pending').length
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-4">
      <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
        <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-amber-800">
          {pendingCount > 0
            ? `${pendingCount} ${pendingCount === 1 ? 'план ожидает' : pendingCount < 5 ? 'плана ожидают' : 'планов ожидают'} согласования`
            : 'Нет планов, ожидающих согласования'}
        </p>
        <p className="text-xs text-amber-600 mt-0.5">Планы отпуска от сотрудников вашей команды</p>
      </div>
      {pendingCount > 0 && (
        <button
          onClick={onGoToTeam}
          className="shrink-0 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium rounded-lg transition-colors"
        >
          Перейти к согласованию
        </button>
      )}
    </div>
  )
}

function HRSummaryCard({ campaign, onGoToHR }) {
  return (
    <div className={`border rounded-2xl p-4 flex items-center gap-4 ${
      campaign.active ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
    }`}>
      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
        campaign.active ? 'bg-green-100' : 'bg-gray-100'
      }`}>
        <svg className={`w-5 h-5 ${campaign.active ? 'text-green-600' : 'text-gray-400'}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold ${campaign.active ? 'text-green-800' : 'text-gray-700'}`}>
          Кампания {campaign.year}: {campaign.active ? 'активна' : 'не активна'}
        </p>
        <p className={`text-xs mt-0.5 ${campaign.active ? 'text-green-600' : 'text-gray-500'}`}>
          {campaign.active
            ? 'Сотрудники распределяют дни отпуска'
            : 'Распределение дней завершено или не начато'}
        </p>
      </div>
      <button
        onClick={onGoToHR}
        className="shrink-0 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg transition-colors"
      >
        HR-панель
      </button>
    </div>
  )
}

export default function EmployeeDashboard({ onGoToPlanning, onGoToTeam, onGoToHR }) {
  const { role, campaign, subordinates } = useApp()
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [showNewRequest, setShowNewRequest] = useState(false)

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-5">
      {role === 'manager' && (
        <ManagerSummaryCard subordinates={subordinates} onGoToTeam={onGoToTeam} />
      )}
      {role === 'hr_admin' && (
        <HRSummaryCard campaign={campaign} onGoToHR={onGoToHR} />
      )}
      <CampaignBanner onGoToPlanning={onGoToPlanning} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <VacationWidget />
        <BalanceCard />
      </div>
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-900">Мои заявки</h2>
        <button
          onClick={() => setShowNewRequest(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Новая заявка
        </button>
      </div>
      <RequestsTable onSelectRequest={setSelectedRequest} />
      <RequestModal request={selectedRequest} onClose={() => setSelectedRequest(null)} />
      {showNewRequest && <NewRequestModal onClose={() => setShowNewRequest(false)} />}
    </div>
  )
}
