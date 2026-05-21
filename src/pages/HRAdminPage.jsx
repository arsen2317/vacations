import { useState } from 'react'
import { Typography, Alert, Row, Col, Card, Statistic, Button, Modal, Space, Tag, Table, Select } from 'antd'
import { DownloadOutlined } from '@ant-design/icons'
import { useApp } from '../context/AppContext'
import { ALL_EMPLOYEES } from '../data/mockData'

const STATUS_FILTER_OPTIONS = [
  { key: 'all',      label: 'Все' },
  { key: 'approved', label: 'Согласованы' },
  { key: 'pending',  label: 'На согласовании' },
  { key: 'draft',    label: 'Черновик' },
]

const STATUS_TAG = {
  approved: { label: 'Согласован',      color: 'success'  },
  pending:  { label: 'На согласовании', color: 'gold'     },
  draft:    { label: 'Черновик',        color: 'default'  },
}

const TEAMS = [...new Set(ALL_EMPLOYEES.map(e => e.team))]

const TEAM_OPTIONS = [
  { value: 'all', label: 'Все подразделения' },
  ...TEAMS.map(t => ({ value: t, label: t })),
]

export default function HRAdminPage() {
  const { campaign, setCampaign } = useApp()
  const [showConfirm, setShowConfirm] = useState(false)
  const [statusFilter, setStatusFilter] = useState('all')
  const [teamFilter, setTeamFilter] = useState('all')

  const baseEmployees = teamFilter === 'all'
    ? ALL_EMPLOYEES
    : ALL_EMPLOYEES.filter(e => e.team === teamFilter)

  const total         = baseEmployees.length
  const approvedCount = baseEmployees.filter(e => e.planStatus === 'approved').length
  const pendingCount  = baseEmployees.filter(e => e.planStatus === 'pending').length
  const draftCount    = baseEmployees.filter(e => e.planStatus === 'draft').length

  const progressPct = total ? Math.round((approvedCount / total) * 100) : 0
  const pendingPct  = total ? Math.round((pendingCount  / total) * 100) : 0

  const filtered = statusFilter === 'all'
    ? baseEmployees
    : baseEmployees.filter(e => e.planStatus === statusFilter)

  function downloadCsv(filename, headers, rows) {
    const csv = [headers, ...rows]
      .map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
      .join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = filename; a.click()
    URL.revokeObjectURL(url)
  }

  function downloadReport() {
    downloadCsv(
      `hr-report-${campaign.year}.csv`,
      ['№', 'Сотрудник', 'Подразделение', 'Статус'],
      filtered.map((emp, i) => [i + 1, emp.name, emp.team, STATUS_TAG[emp.planStatus]?.label ?? emp.planStatus]),
    )
  }

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
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '24px 16px' }}>
      <Space direction="vertical" style={{ width: '100%' }} size={20}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <Typography.Title level={4} style={{ margin: 0 }}>
            HR-панель — кампания {campaign.year}
          </Typography.Title>
          <Space>
            <Select
              value={teamFilter}
              onChange={setTeamFilter}
              options={TEAM_OPTIONS}
              style={{ minWidth: 220 }}
            />
            <Button icon={<DownloadOutlined />} onClick={downloadReport}>
              Скачать отчёт
            </Button>
          </Space>
        </div>

        <Alert
          type={campaign.active ? 'success' : 'info'}
          showIcon
          message={`Кампания по планированию ${campaign.year}`}
          description={campaign.active
            ? 'Активна — сотрудники могут распределять дни отпуска'
            : 'Не активна — планирование закрыто'}
          action={
            <Button
              size="small"
              danger={campaign.active}
              type={campaign.active ? 'default' : 'primary'}
              onClick={handleToggle}
            >
              {campaign.active ? 'Завершить кампанию' : 'Запустить кампанию'}
            </Button>
          }
        />

        <Row gutter={[12, 12]}>
          <Col xs={12} sm={6}>
            <Card>
              <Statistic title="Всего сотрудников" value={total} />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card>
              <Statistic title="Согласованы" value={approvedCount} valueStyle={{ color: '#52c41a' }} />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card>
              <Statistic title="На согласовании" value={pendingCount} valueStyle={{ color: '#d48806' }} />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card>
              <Statistic title="Черновики" value={draftCount} valueStyle={{ color: '#8c8c8c' }} />
            </Card>
          </Col>
        </Row>

        <Card>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <Typography.Text strong>Прогресс согласования</Typography.Text>
            <Typography.Text type="secondary">{approvedCount} из {total}</Typography.Text>
          </div>
          <div style={{ height: 10, background: '#f0f0f0', borderRadius: 5, overflow: 'hidden', display: 'flex' }}>
            <div style={{ width: `${progressPct}%`, background: '#52c41a', transition: 'width 0.5s' }} />
            <div style={{ width: `${pendingPct}%`, background: '#faad14', transition: 'width 0.5s' }} />
          </div>
          <Space style={{ marginTop: 8 }} size={16}>
            <Space size={6}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#52c41a', flexShrink: 0 }} />
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>Согласованы {progressPct}%</Typography.Text>
            </Space>
            <Space size={6}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#faad14', flexShrink: 0 }} />
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>На согласовании {pendingPct}%</Typography.Text>
            </Space>
          </Space>
        </Card>

        <Card
          title="Планы сотрудников"
          extra={
            <Space size={4}>
              {STATUS_FILTER_OPTIONS.map(opt => (
                <Button
                  key={opt.key}
                  size="small"
                  type={statusFilter === opt.key ? 'primary' : 'text'}
                  onClick={() => setStatusFilter(opt.key)}
                >
                  {opt.label}
                </Button>
              ))}
            </Space>
          }
          styles={{ body: { padding: 0 } }}
        >
          <Table
            dataSource={filtered}
            rowKey="id"
            pagination={false}
            size="middle"
            locale={{ emptyText: 'Нет сотрудников с этим статусом' }}
            columns={[
              {
                title: '№',
                key: 'index',
                width: 52,
                render: (_, __, i) => (
                  <Typography.Text type="secondary">{i + 1}</Typography.Text>
                ),
              },
              {
                title: 'Сотрудник',
                dataIndex: 'name',
                key: 'name',
              },
              {
                title: 'Подразделение',
                dataIndex: 'team',
                key: 'team',
                responsive: ['sm'],
              },
              {
                title: 'Статус',
                key: 'status',
                render: (_, emp) => {
                  const sc = STATUS_TAG[emp.planStatus] ?? STATUS_TAG.draft
                  return <Tag color={sc.color} style={{ marginInlineEnd: 0 }}>{sc.label}</Tag>
                },
              },
            ]}
          />
        </Card>

      </Space>

      <Modal
        open={showConfirm}
        onCancel={() => setShowConfirm(false)}
        title="Завершить кампанию?"
        footer={[
          <Button key="cancel" onClick={() => setShowConfirm(false)}>Отмена</Button>,
          <Button key="confirm" type="primary" danger onClick={confirmDeactivate}>Завершить</Button>,
        ]}
      >
        <Typography.Paragraph type="secondary" style={{ marginTop: 8 }}>
          После завершения сотрудники не смогут изменять планы отпуска.
          Это действие можно отменить, запустив кампанию заново.
        </Typography.Paragraph>
      </Modal>
    </div>
  )
}
