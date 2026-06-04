import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import CampaignBanner from '../components/CampaignBanner'
import RequestsTable from '../components/RequestsTable'
import RequestModal from '../components/RequestModal'
import NewRequestModal from '../components/NewRequestModal'
import { COLORS } from '../ds/index'

function Toast({ message, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 4000)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <div style={{
      position: 'fixed',
      bottom: 32,
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 2000,
      background: '#1D2023',
      color: '#FAFAFA',
      borderRadius: 16,
      padding: '14px 24px',
      fontSize: 15,
      fontFamily: "'MTSCompact', sans-serif",
      lineHeight: '22px',
      boxShadow: '0px 8px 24px rgba(0,0,0,0.20)',
      pointerEvents: 'none',
      whiteSpace: 'nowrap',
    }}>
      {message}
    </div>
  )
}

export default function EmployeeDashboard({ onGoToPlanning, onGoToTeam, onGoToHR }) {
  const { role, campaign, subordinates } = useApp()
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [showNewRequest, setShowNewRequest] = useState(false)
  const [toast, setToast] = useState(null)

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
      {showNewRequest && (
        <NewRequestModal
          onClose={() => setShowNewRequest(false)}
          onSubmitted={() => {
            setShowNewRequest(false)
            setToast('Заявка направлена на согласование')
          }}
        />
      )}
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </div>
  )
}
