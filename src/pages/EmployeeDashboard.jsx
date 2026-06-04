import { useState } from 'react'
import { useApp } from '../context/AppContext'
import CampaignBanner from '../components/CampaignBanner'
import RequestsTable from '../components/RequestsTable'
import RequestModal from '../components/RequestModal'
import NewRequestModal from '../components/NewRequestModal'
import { COLORS } from '../ds/index'

export default function EmployeeDashboard({ onGoToPlanning, onGoToTeam, onGoToHR }) {
  const { role, campaign, subordinates } = useApp()
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [showNewRequest, setShowNewRequest] = useState(false)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 24 }}>

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
      />
      {showNewRequest && <NewRequestModal onClose={() => setShowNewRequest(false)} />}
    </div>
  )
}
