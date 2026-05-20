import { useState } from 'react'
import { Modal, Button, Descriptions, Alert, Select, Input, Space, Typography } from 'antd'
import StatusBadge from './StatusBadge'
import { COLLEAGUES } from '../data/mockData'

function formatDate(date) {
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
}

const APPROVER_OPTIONS = [
  { value: '', label: 'Не назначать' },
  ...COLLEAGUES.filter(c => !c.me).map(c => ({ value: String(c.id), label: c.name })),
]

export default function RequestModal({ request, onClose, onReschedule }) {
  const [showCancelForm, setShowCancelForm] = useState(false)
  const [cancelExtraApprover, setCancelExtraApprover] = useState('')
  const [cancelComment, setCancelComment] = useState('')

  if (!request) return null

  const status = request.status
  const rescheduleCount = request.rescheduleCount ?? 0
  const rescheduleLimit = request.rescheduleLimit ?? 2
  const canReschedule =
    request.type === 'planned' &&
    (status === 'approved' || status === 'pending') &&
    rescheduleCount < rescheduleLimit &&
    onReschedule
  const canCancel = status === 'approved' || status === 'pending'

  function handleClose() {
    setShowCancelForm(false)
    setCancelExtraApprover('')
    setCancelComment('')
    onClose()
  }

  const descItems = [
    {
      key: 'period',
      label: 'Период',
      children: `${formatDate(request.startDate)} — ${formatDate(request.endDate)}`,
    },
    {
      key: 'days',
      label: 'Количество дней',
      children: `${request.days} дн.`,
    },
    ...(request.approver ? [{
      key: 'approver',
      label: 'Согласующий',
      children: (
        <>
          {request.approver.name}
          <Typography.Text type="secondary"> · {request.approver.role}</Typography.Text>
        </>
      ),
    }] : []),
    ...(request.type === 'planned' && request.rescheduleCount !== undefined ? [{
      key: 'reschedule',
      label: 'Переносов использовано',
      children: `${request.rescheduleCount} / ${request.rescheduleLimit ?? 2}`,
    }] : []),
  ]

  return (
    <Modal
      open={true}
      onCancel={handleClose}
      title={
        <div>
          <Typography.Text
            type="secondary"
            style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block' }}
          >
            Заявка #{request.id}
          </Typography.Text>
          <span style={{ fontSize: 16, fontWeight: 600 }}>{request.typeLabel}</span>
        </div>
      }
      footer={null}
      width={480}
    >
      <Space direction="vertical" style={{ width: '100%' }} size={16}>
        <StatusBadge status={request.status} />

        <Descriptions column={1} size="small" items={descItems} />

        {status === 'rejected' && request.rejectionComment && (
          <Alert
            type="error"
            message="Причина отклонения"
            description={request.rejectionComment}
          />
        )}

        {showCancelForm ? (
          <Space direction="vertical" style={{ width: '100%' }} size={12}>
            <Alert
              type="warning"
              message="Отмена планового отпуска"
              description="Запрос будет направлен на согласование руководителю"
            />
            {request.approver && (
              <Descriptions column={1} size="small" items={[{
                key: 'approver',
                label: 'Согласующий',
                children: (
                  <>
                    {request.approver.name}
                    <Typography.Text type="secondary"> · {request.approver.role}</Typography.Text>
                  </>
                ),
              }]} />
            )}
            <div>
              <Typography.Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
                Дополнительный согласующий{' '}
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>(необязательно)</Typography.Text>
              </Typography.Text>
              <Select
                value={cancelExtraApprover}
                onChange={setCancelExtraApprover}
                options={APPROVER_OPTIONS}
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <Typography.Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
                Комментарий{' '}
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>(необязательно)</Typography.Text>
              </Typography.Text>
              <Input.TextArea
                value={cancelComment}
                onChange={e => setCancelComment(e.target.value)}
                rows={2}
                placeholder="Причина отмены"
              />
            </div>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => setShowCancelForm(false)}>Назад</Button>
              <Button type="primary" danger onClick={handleClose}>
                Подтвердить отмену
              </Button>
            </Space>
          </Space>
        ) : (
          <Space direction="vertical" style={{ width: '100%' }} size={8}>
            {canReschedule && (
              <Button type="primary" block onClick={onReschedule}>
                Перенести отпуск
              </Button>
            )}
            {canCancel && (
              <Button
                danger
                block
                onClick={() => request.type === 'planned' ? setShowCancelForm(true) : handleClose()}
              >
                Отменить заявку
              </Button>
            )}
          </Space>
        )}
      </Space>
    </Modal>
  )
}
