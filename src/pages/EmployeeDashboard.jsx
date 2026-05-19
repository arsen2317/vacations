import { useState } from 'react'
import CampaignBanner from '../components/CampaignBanner'
import VacationWidget from '../components/VacationWidget'
import BalanceCard from '../components/BalanceCard'
import RequestsTable from '../components/RequestsTable'
import RequestModal from '../components/RequestModal'

export default function EmployeeDashboard({ onGoToPlanning }) {
  const [selectedRequest, setSelectedRequest] = useState(null)

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-5">
      <CampaignBanner onGoToPlanning={onGoToPlanning} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <VacationWidget />
        <BalanceCard />
      </div>
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-900">Мои заявки</h2>
        <button className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Новая заявка
        </button>
      </div>
      <RequestsTable onSelectRequest={setSelectedRequest} />
      <RequestModal request={selectedRequest} onClose={() => setSelectedRequest(null)} />
    </div>
  )
}
