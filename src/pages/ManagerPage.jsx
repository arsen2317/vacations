import { useState } from 'react'
import { Card, Row, Col, Statistic, List, Avatar, Tag, Button, Input, Typography, Space } from 'antd'
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
  const [expandedId, setExpandedId] = useState(null)
  const [comment, setComment] = useState('')
  const [commentError, setCommentError] = useState('')

  const sorted = [...subordinates].sort((a, b) => {
    if (a.planStatus === 'pending' && b.planStatus !== 'pending') return -1
    if (a.planStatus !== 'pending' && b.planStatus === 'pending') return 1
    return 0
  })

  const pendingCount  = subordinates.filter(s => s.planStatus === 'pending').length
  const approvedCount = subordinates.filter(s => s.planStatus === 'approved').length
  const draftCount    = subordinates.filter(s => s.planStatus === 'draft').length

  function toggleExpand(id) {
    setExpandedId(prev => prev === id ? null : id)
    setComment('')
    setCommentError('')
  }

  function handleApprove(id) {
    setSubordinates(prev => prev.map(s => s.id === id ? { ...s, planStatus: 'approved' } : s))
    setExpandedId(null)
    setComment('')
    setCommentError('')
  }

  function handleReject(id) {
    if (!comment.trim()) {
      setCommentError('Комментарий обязателен при отклонении')
      return
    }
    setSubordinates(prev => prev.map(s => s.id === id ? { ...s, planStatus: 'rejected', rejectionComment: comment } : s))
    setExpandedId(null)
    setComment('')
    setCommentError('')
  }

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '24px 16px' }}>
      <Space direction="vertical" style={{ width: '100%' }} size={20}>

        <Typography.Title level={4} style={{ margin: 0 }}>
          Команда — планирование отпуска на {campaign.year} год
        </Typography.Title>

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
          <List
            dataSource={sorted}
            renderItem={sub => {
              const { label, color } = STATUS_TAG[sub.planStatus] ?? STATUS_TAG.draft
              const isExpanded = expandedId === sub.id
              const isPending  = sub.planStatus === 'pending'

              return (
                <List.Item
                  key={sub.id}
                  style={{ flexDirection: 'column', alignItems: 'stretch', padding: '12px 20px' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Avatar style={{ background: '#e0e7ff', color: '#4f46e5', flexShrink: 0 }}>
                      {sub.name[0]}
                    </Avatar>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Typography.Text strong style={{ display: 'block' }}>{sub.name}</Typography.Text>
                      <Typography.Text type="secondary" style={{ fontSize: 12 }}>{sub.position}</Typography.Text>
                      <div style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Tag color={color} style={{ marginInlineEnd: 0 }}>{label}</Tag>
                        {isPending && (
                          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                            {sub.distributedDays}/{sub.totalDays} дн. распределено
                          </Typography.Text>
                        )}
                      </div>
                    </div>
                    {isPending && (
                      <Button
                        size="small"
                        type="primary"
                        ghost={!isExpanded}
                        onClick={() => toggleExpand(sub.id)}
                      >
                        {isExpanded ? 'Скрыть' : 'Рассмотреть'}
                      </Button>
                    )}
                  </div>

                  {isExpanded && (
                    <Card
                      size="small"
                      style={{ marginTop: 12, background: '#fafafa' }}
                      styles={{ body: { padding: 12 } }}
                    >
                      <Space direction="vertical" style={{ width: '100%' }} size={12}>
                        {sub.segments?.length > 0 && (
                          <div>
                            <Typography.Text
                              type="secondary"
                              style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}
                            >
                              Отрезки отпуска:
                            </Typography.Text>
                            <Space direction="vertical" size={2}>
                              {sub.segments.map((seg, i) => (
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
                          <Typography.Text
                            type="secondary"
                            style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}
                          >
                            Комментарий{' '}
                            <Typography.Text type="secondary" style={{ fontWeight: 400, fontSize: 12 }}>
                              (обязателен при отклонении)
                            </Typography.Text>
                          </Typography.Text>
                          <Input.TextArea
                            value={comment}
                            onChange={e => { setComment(e.target.value); setCommentError('') }}
                            rows={2}
                            placeholder="Введите комментарий..."
                            status={commentError ? 'error' : ''}
                          />
                          {commentError && (
                            <Typography.Text type="danger" style={{ fontSize: 12 }}>
                              {commentError}
                            </Typography.Text>
                          )}
                        </div>

                        <Row gutter={8}>
                          <Col span={12}>
                            <Button
                              block
                              type="primary"
                              style={{ background: '#52c41a', borderColor: '#52c41a' }}
                              onClick={() => handleApprove(sub.id)}
                            >
                              Одобрить
                            </Button>
                          </Col>
                          <Col span={12}>
                            <Button block danger onClick={() => handleReject(sub.id)}>
                              Отклонить
                            </Button>
                          </Col>
                        </Row>
                      </Space>
                    </Card>
                  )}
                </List.Item>
              )
            }}
          />
        </Card>

      </Space>
    </div>
  )
}
