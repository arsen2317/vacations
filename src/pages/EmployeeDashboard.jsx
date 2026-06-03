import { useState } from 'react'
import { useApp } from '../context/AppContext'
import CampaignBanner from '../components/CampaignBanner'
import RequestsTable from '../components/RequestsTable'
import RequestModal from '../components/RequestModal'
import NewRequestModal from '../components/NewRequestModal'
import { COLORS, Banner } from '../ds/index'

function ManagerSummaryCard({ subordinates, onGoToTeam }) {
  const pendingCount = subordinates.filter(s => s.planStatus === 'pending').length
  const label = pendingCount === 1 ? 'план ожидает' : pendingCount < 5 ? 'плана ожидают' : 'планов ожидают'
  return (
    <div style={{ cursor: pendingCount > 0 ? 'pointer' : 'default' }} onClick={pendingCount > 0 ? onGoToTeam : undefined}>
      <Banner
        type="info"
        title={pendingCount > 0 ? `${pendingCount} ${label} согласования` : 'Нет планов, ожидающих согласования'}
        subtitle="Планы отпуска от сотрудников вашей команды"
      />
    </div>
  )
}

function HRSummaryCard({ campaign, onGoToHR }) {
  return (
    <div style={{ cursor: 'pointer' }} onClick={onGoToHR}>
      <Banner
        type="info"
        title={`Кампания ${campaign.year}: ${campaign.active ? 'активна' : 'не активна'}`}
        subtitle={campaign.active ? 'Сотрудники распределяют дни отпуска' : 'Распределение дней завершено или не начато'}
      />
    </div>
  )
}

export default function EmployeeDashboard({ onGoToPlanning, onGoToTeam, onGoToHR }) {
  const { role, campaign, subordinates } = useApp()
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [showNewRequest, setShowNewRequest] = useState(false)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 24 }}>
      {role === 'manager' && (
        <ManagerSummaryCard subordinates={subordinates} onGoToTeam={onGoToTeam} />
      )}
      {role === 'hr_admin' && (
        <HRSummaryCard campaign={campaign} onGoToHR={onGoToHR} />
      )}

      <CampaignBanner onGoToPlanning={onGoToPlanning} />

      <h2 style={{
        margin: '8px 0 0',
        fontSize: 20,
        fontWeight: 500,
        color: COLORS.text,
        lineHeight: '28px',
        fontFamily: "'MTSWide', sans-serif",
      }}>
        Мои заявки
      </h2>

      <RequestsTable
        onSelectRequest={setSelectedRequest}
        onNewRequest={() => setShowNewRequest(true)}
      />

      <RequestModal
        request={selectedRequest}
        onClose={() => setSelectedRequest(null)}
        onReschedule={() => { setSelectedRequest(null); onGoToPlanning() }}
      />
      {showNewRequest && <NewRequestModal onClose={() => setShowNewRequest(false)} />}
    </div>
  )
}
