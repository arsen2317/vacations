import { useState } from 'react'
import { Alert, Button, Row, Col, Typography } from 'antd'
import { PlusOutlined, TeamOutlined, CalendarOutlined } from '@ant-design/icons'
import { useApp } from '../context/AppContext'
import CampaignBanner from '../components/CampaignBanner'
import VacationWidget from '../components/VacationWidget'
import BalanceCard from '../components/BalanceCard'
import RequestsTable from '../components/RequestsTable'
import RequestModal from '../components/RequestModal'
import NewRequestModal from '../components/NewRequestModal'

function ManagerSummaryCard({ subordinates, onGoToTeam }) {
  const pendingCount = subordinates.filter(s => s.planStatus === 'pending').length
  const plural = pendingCount === 1 ? 'план ожидает' : pendingCount < 5 ? 'плана ожидают' : 'планов ожидают'
  return (
    <Alert
      type="warning"
      showIcon
      icon={<TeamOutlined />}
      message={pendingCount > 0 ? `${pendingCount} ${plural} согласования` : 'Нет планов, ожидающих согласования'}
      description="Планы отпуска от сотрудников вашей команды"
      action={
        pendingCount > 0 && (
          <Button size="small" onClick={onGoToTeam}>
            Перейти к согласованию
          </Button>
        )
      }
    />
  )
}

function HRSummaryCard({ campaign, onGoToHR }) {
  return (
    <Alert
      type={campaign.active ? 'success' : 'info'}
      showIcon
      icon={<CalendarOutlined />}
      message={`Кампания ${campaign.year}: ${campaign.active ? 'активна' : 'не активна'}`}
      description={campaign.active ? 'Сотрудники распределяют дни отпуска' : 'Распределение дней завершено или не начато'}
      action={
        <Button size="small" type="primary" onClick={onGoToHR}>
          HR-панель
        </Button>
      }
    />
  )
}

export default function EmployeeDashboard({ onGoToPlanning, onGoToTeam, onGoToHR }) {
  const { role, campaign, subordinates } = useApp()
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [showNewRequest, setShowNewRequest] = useState(false)

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {role === 'manager' && (
          <ManagerSummaryCard subordinates={subordinates} onGoToTeam={onGoToTeam} />
        )}
        {role === 'hr_admin' && (
          <HRSummaryCard campaign={campaign} onGoToHR={onGoToHR} />
        )}

        <CampaignBanner onGoToPlanning={onGoToPlanning} />

        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <VacationWidget />
          </Col>
          <Col xs={24} sm={12} style={{ marginTop: 0 }}>
            <BalanceCard />
          </Col>
        </Row>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography.Title level={5} style={{ margin: 0 }}>Мои заявки</Typography.Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setShowNewRequest(true)}
          >
            Новая заявка
          </Button>
        </div>

        <RequestsTable onSelectRequest={setSelectedRequest} />

        <RequestModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onReschedule={() => { setSelectedRequest(null); onGoToPlanning() }}
        />
        {showNewRequest && <NewRequestModal onClose={() => setShowNewRequest(false)} />}
      </div>
    </div>
  )
}
