import { useState, useMemo } from 'react'
import {
  Card, Row, Col, Statistic, Button, Typography, Space, Tag,
  Table, Dropdown, Modal, Input, Select,
} from 'antd'
import { CheckOutlined, CloseOutlined, MoreOutlined, DownloadOutlined } from '@ant-design/icons'
import { useApp } from '../context/AppContext'
import { fmtDate, pluralDays } from '../utils/dateUtils'

const STATUS_TAG = {
  draft:    { label: 'Черновик',        color: 'default'  },
  pending:  { label: 'На согласовании', color: 'gold'     },
  approved: { label: 'Согласован',      color: 'success'  },
  rejected: { label: 'Отклонён',        color: 'error'    },
}

export default function ManagerPage() {
  const { subordinates, setSubordinates, campaign } = useApp()
  const [selectedTeam, setSelectedTeam] = useState('all')
  const [rejectTarget, setRejectTarget] = useState(null)
  const [rejectComment, setRejectComment] = useState('')
  const [rejectError, setRejectError] = useState('')

  const teams = useMemo(() => [...new Set(subordinates.map(s => s.team).filter(Boolean))], [subordinates])
  const teamOptions = [
    { value: 'all', label: 'Все подразделения' },
    ...teams.map(t => ({ value: t, label: t })),
  ]

  const displayed = useMemo(() => {
    const base = selectedTeam === 'all' ? subordinates : subordinates.filter(s => s.team === selectedTeam)
    return [...base].sort((a, b) => {
      if (a.planStatus === 'pending' && b.planStatus !== 'pending') return -1
      if (a.planStatus !== 'pending' && b.planStatus === 'pending') return 1
      return 0
    })
  }, [subordinates, selectedTeam])

  const pendingCount  = subordinates.filter(s => s.planStatus === 'pending').length
  const approvedCount = subordinates.filter(s => s.planStatus === 'approved').length
  const draftCount    = subordinates.filter(s => s.planStatus === 'draft').length

  function downloadReport() {
    const headers = ['Сотрудник', 'Подразделение', 'Должность', 'Статус', 'Распределено дней']
    const rows = displayed.map(sub => [
      sub.name,
      sub.team ?? '',
      sub.position,
      STATUS_TAG[sub.planStatus]?.label ?? sub.planStatus,
      `${sub.distributedDays}/${sub.totalDays}`,
    ])
    const csv = [headers, ...rows]
      .map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
      .join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `team-report-${campaign.year}.csv`; a.click()
    URL.revokeObjectURL(url)
  }

  function handleApprove(id) {
    setSubordinates(prev => prev.map(s => s.id === id ? { ...s, planStatus: 'approved' } : s))
  }

  function openRejectModal(sub) {
    setRejectTarget(sub)
    setRejectComment('')
    setRejectError('')
  }

  function closeRejectModal() {
    setRejectTarget(null)
    setRejectComment('')
    setRejectError('')
  }

  function confirmReject() {
    if (!rejectComment.trim()) {
      setRejectError('Комментарий обязателен при отклонении')
      return
    }
    setSubordinates(prev =>
      prev.map(s => s.id === rejectTarget.id
        ? { ...s, planStatus: 'rejected', rejectionComment: rejectComment }
        : s
      )
    )
    closeRejectModal()
  }

  const columns = [
    {
      title: 'Сотрудник',
      key: 'employee',
      render: (_, sub) => (
        <div>
          <Typography.Text strong style={{ display: 'block' }}>{sub.name}</Typography.Text>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>{sub.position}</Typography.Text>
        </div>
      ),
    },
    {
      title: 'Подразделение',
      dataIndex: 'team',
      key: 'team',
      responsive: ['md'],
    },
    {
      title: 'Статус',
      key: 'status',
      render: (_, sub) => {
        const sc = STATUS_TAG[sub.planStatus] ?? STATUS_TAG.draft
        return <Tag color={sc.color} style={{ marginInlineEnd: 0 }}>{sc.label}</Tag>
      },
    },
    {
      title: 'Распределено',
      key: 'days',
      responsive: ['sm'],
      render: (_, sub) => (
        <Typography.Text type="secondary" style={{ fontSize: 13 }}>
          {sub.distributedDays}/{sub.totalDays} дн.
        </Typography.Text>
      ),
    },
    {
      key: 'actions',
      width: 48,
      render: (_, sub) => {
        if (sub.planStatus !== 'pending') return null
        return (
          <Dropdown
            menu={{
              items: [
                { key: 'approve', label: 'Одобрить', icon: <CheckOutlined /> },
                { key: 'reject',  label: 'Отклонить', icon: <CloseOutlined />, danger: true },
              ],
              onClick: ({ key }) => {
                if (key === 'approve') handleApprove(sub.id)
                if (key === 'reject')  openRejectModal(sub)
              },
            }}
            trigger={['click']}
          >
            <Button type="text" size="small" icon={<MoreOutlined />} />
          </Dropdown>
        )
      },
    },
  ]

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '24px 16px' }}>
      <Space direction="vertical" style={{ width: '100%' }} size={20}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <Typography.Title level={4} style={{ margin: 0 }}>
            Команда — планирование отпуска на {campaign.year} год
          </Typography.Title>
          <Space>
            <Select
              value={selectedTeam}
              onChange={setSelectedTeam}
              options={teamOptions}
              style={{ minWidth: 220 }}
            />
            <Button icon={<DownloadOutlined />} onClick={downloadReport}>
              Скачать отчёт
            </Button>
          </Space>
        </div>

        <Row gutter={16}>
          <Col span={8}>
            <Card>
              <Statistic title="На согласовании" value={pendingCount} valueStyle={{ color: '#d48806' }} />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic title="Согласованы" value={approvedCount} valueStyle={{ color: '#52c41a' }} />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic title="В черновике" value={draftCount} valueStyle={{ color: '#8c8c8c' }} />
            </Card>
          </Col>
        </Row>

        <Card title="Сотрудники" styles={{ body: { padding: 0 } }}>
          <Table
            dataSource={displayed}
            columns={columns}
            rowKey="id"
            pagination={false}
            size="middle"
            expandable={{
              expandedRowRender: sub => (
                sub.segments?.length > 0 ? (
                  <Space direction="vertical" size={4} style={{ paddingLeft: 8 }}>
                    <Typography.Text type="secondary" style={{ fontSize: 12, fontWeight: 600 }}>
                      Отрезки отпуска:
                    </Typography.Text>
                    {sub.segments.map((seg, i) => (
                      <Typography.Text key={i} style={{ fontSize: 13 }}>
                        <Typography.Text type="secondary">{i + 1}.{' '}</Typography.Text>
                        {fmtDate(seg.startDate)} — {fmtDate(seg.endDate)}
                        <Typography.Text type="secondary"> ({pluralDays(seg.days)})</Typography.Text>
                      </Typography.Text>
                    ))}
                  </Space>
                ) : (
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>Нет отрезков</Typography.Text>
                )
              ),
              rowExpandable: sub => (sub.segments?.length > 0),
            }}
          />
        </Card>

      </Space>

      <Modal
        open={!!rejectTarget}
        onCancel={closeRejectModal}
        title={`Отклонить план — ${rejectTarget?.name ?? ''}`}
        footer={[
          <Button key="cancel" onClick={closeRejectModal}>Отмена</Button>,
          <Button key="confirm" type="primary" danger onClick={confirmReject}>Отклонить</Button>,
        ]}
      >
        <Space direction="vertical" style={{ width: '100%', marginTop: 8 }} size={16}>
          {rejectTarget?.segments?.length > 0 && (
            <div>
              <Typography.Text type="secondary" style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>
                Отрезки отпуска:
              </Typography.Text>
              <Space direction="vertical" size={2}>
                {rejectTarget.segments.map((seg, i) => (
                  <Typography.Text key={i} style={{ fontSize: 13 }}>
                    <Typography.Text type="secondary">{i + 1}.{' '}</Typography.Text>
                    {fmtDate(seg.startDate)} — {fmtDate(seg.endDate)}
                    <Typography.Text type="secondary"> ({pluralDays(seg.days)})</Typography.Text>
                  </Typography.Text>
                ))}
              </Space>
            </div>
          )}
          <div>
            <Typography.Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
              Комментарий <Typography.Text type="danger" style={{ fontSize: 12 }}>*</Typography.Text>
            </Typography.Text>
            <Input.TextArea
              value={rejectComment}
              onChange={e => { setRejectComment(e.target.value); setRejectError('') }}
              rows={3}
              placeholder="Причина отклонения"
              status={rejectError ? 'error' : ''}
            />
            {rejectError && (
              <Typography.Text type="danger" style={{ fontSize: 12 }}>{rejectError}</Typography.Text>
            )}
          </div>
        </Space>
      </Modal>
    </div>
  )
}
