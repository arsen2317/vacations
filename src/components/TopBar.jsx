import { Avatar, Segmented, Typography } from 'antd'
import { useApp } from '../context/AppContext'
import { CURRENT_USER } from '../data/mockData'

const ROLES = [
  { value: 'employee', label: 'Сотрудник' },
  { value: 'manager', label: 'Руководитель' },
  { value: 'hr_admin', label: 'HR-админ' },
]

export default function TopBar() {
  const { role, setRole, setActiveTab } = useApp()

  function handleRoleChange(value) {
    setRole(value)
    setActiveTab('home')
  }

  return (
    <header style={{
      background: '#fff',
      borderBottom: '1px solid #f0f0f0',
      position: 'sticky',
      top: 0,
      zIndex: 40,
    }}>
      <div style={{
        maxWidth: 960,
        margin: '0 auto',
        padding: '0 16px',
        height: 56,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar style={{ backgroundColor: '#6366f1', flexShrink: 0 }}>
            {CURRENT_USER.name.charAt(0)}
          </Avatar>
          <div>
            <Typography.Text strong style={{ display: 'block', lineHeight: 1.3, fontSize: 14 }}>
              {CURRENT_USER.name}
            </Typography.Text>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              {CURRENT_USER.team}
            </Typography.Text>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>Роль:</Typography.Text>
          <Segmented
            size="small"
            options={ROLES}
            value={role}
            onChange={handleRoleChange}
          />
        </div>
      </div>
    </header>
  )
}
