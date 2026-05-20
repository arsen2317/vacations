import { useState, useMemo } from 'react'
import { Modal, Form, Select, DatePicker, Input, Button, Result, Typography } from 'antd'
import dayjs from 'dayjs'
import 'dayjs/locale/ru'
import { useApp } from '../context/AppContext'
import { countVacationDays, pluralDays } from '../utils/dateUtils'
import { COLLEAGUES } from '../data/mockData'

dayjs.locale('ru')

const REQUEST_TYPES = [
  { value: 'annual',       label: 'Ежегодный оплачиваемый',                 desc: 'Списывается из баланса основного отпуска', deductsBalance: true  },
  { value: 'unpaid',       label: 'Без сохранения зарплаты',                 desc: 'Не списывается из баланса',                deductsBalance: false },
  { value: 'study_paid',   label: 'Учебный оплачиваемый',                    desc: 'Не списывается из баланса',                deductsBalance: false },
  { value: 'study_unpaid', label: 'Учебный без сохранения зарплаты',         desc: 'Не списывается из баланса',                deductsBalance: false },
]

const TYPE_LABEL_MAP = {
  annual:       'Внеплановый — ежегодный оплачиваемый',
  unpaid:       'Внеплановый — без сохранения зарплаты',
  study_paid:   'Внеплановый — учебный оплачиваемый',
  study_unpaid: 'Внеплановый — учебный без сохранения зарплаты',
}

const DEFAULT_APPROVER = { name: 'Дмитрий Соколов', role: 'Руководитель' }

const EXTRA_APPROVER_OPTIONS = COLLEAGUES.filter(c => !c.me).map(c => ({
  value: String(c.id),
  label: c.name,
}))

const APPROVER_OPTIONS = COLLEAGUES.filter(c => !c.me).map(c => ({
  value: String(c.id),
  label: c.name,
}))

export default function NewRequestModal({ onClose }) {
  const { requests, setRequests, balance, setBalance } = useApp()
  const [type, setType] = useState(undefined)
  const [dateRange, setDateRange] = useState(null)
  const [comment, setComment] = useState('')
  const [extraApprover, setExtraApprover] = useState(undefined)
  const [changeApprover, setChangeApprover] = useState(false)
  const [approverOverride, setApproverOverride] = useState(undefined)
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)

  const selectedType = REQUEST_TYPES.find(t => t.value === type)

  const previewDays = useMemo(() => {
    if (!dateRange?.[0] || !dateRange?.[1]) return null
    try {
      return countVacationDays(dateRange[0].toDate(), dateRange[1].toDate())
    } catch {
      return null
    }
  }, [dateRange])

  function validate() {
    const errs = {}
    if (!type) errs.type = 'Выберите тип отпуска'
    if (!dateRange?.[0] || !dateRange?.[1]) errs.dates = 'Укажите период'
    if (selectedType?.deductsBalance && previewDays !== null && previewDays > balance.main) {
      errs.dates = `Недостаточно дней: нужно ${pluralDays(previewDays)}, доступно ${pluralDays(balance.main)}`
    }
    return errs
  }

  function handleSubmit() {
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    const approverName = approverOverride
      ? (COLLEAGUES.find(c => String(c.id) === approverOverride)?.name ?? DEFAULT_APPROVER.name)
      : DEFAULT_APPROVER.name
    const newReq = {
      id: Date.now(),
      type: 'unplanned',
      typeLabel: TYPE_LABEL_MAP[type],
      startDate: dateRange[0].toDate(),
      endDate: dateRange[1].toDate(),
      days: previewDays,
      status: 'pending',
      approver: { name: approverName, role: 'Руководитель' },
      comment: comment || undefined,
      extraApprover: extraApprover || undefined,
    }
    setRequests(prev => [newReq, ...prev])
    if (selectedType.deductsBalance) {
      setBalance(prev => ({ ...prev, main: Math.max(0, prev.main - previewDays) }))
    }
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <Modal open={true} onCancel={onClose} footer={null} width={480}>
        <Result
          status="success"
          title="Заявка отправлена"
          subTitle={`Заявка передана на согласование руководителю${extraApprover ? ' и дополнительному согласующему' : ''}.`}
          extra={[
            <Button key="close" type="primary" onClick={onClose}>Закрыть</Button>,
          ]}
        />
      </Modal>
    )
  }

  return (
    <Modal open={true} onCancel={onClose} title="Новая заявка" footer={null} width={480}>
      <Form layout="vertical" style={{ marginTop: 8 }}>

        <Form.Item
          label="Тип отпуска"
          validateStatus={errors.type ? 'error' : ''}
          help={errors.type}
        >
          <Select
            value={type}
            onChange={v => { setType(v); setErrors(e => ({ ...e, type: undefined })) }}
            placeholder="Выберите тип отпуска"
            options={REQUEST_TYPES.map(t => ({ value: t.value, label: t.label }))}
          />
          {selectedType && (
            <Typography.Text type="secondary" style={{ fontSize: 12, marginTop: 4, display: 'block' }}>
              {selectedType.desc}
            </Typography.Text>
          )}
        </Form.Item>

        <Form.Item
          label="Период"
          validateStatus={errors.dates ? 'error' : ''}
          help={
            errors.dates
              ? errors.dates
              : previewDays !== null
                ? `${pluralDays(previewDays)} отпуска (праздники не считаются)${selectedType?.deductsBalance ? ` · Баланс: ${balance.main} дн.` : ''}`
                : undefined
          }
        >
          <DatePicker.RangePicker
            value={dateRange}
            onChange={v => { setDateRange(v); setErrors(e => ({ ...e, dates: undefined })) }}
            format="DD.MM.YYYY"
            style={{ width: '100%' }}
            placeholder={['Начало', 'Окончание']}
          />
        </Form.Item>

        <Form.Item
          label={
            <>Комментарий{' '}
              <Typography.Text type="secondary" style={{ fontWeight: 400, fontSize: 14 }}>(необязательно)</Typography.Text>
            </>
          }
        >
          <Input.TextArea
            value={comment}
            onChange={e => setComment(e.target.value)}
            rows={3}
            placeholder="Причина или дополнительная информация"
          />
        </Form.Item>

        <Form.Item
          label={
            <>Дополнительный согласующий{' '}
              <Typography.Text type="secondary" style={{ fontWeight: 400, fontSize: 14 }}>(необязательно)</Typography.Text>
            </>
          }
        >
          <Select
            value={extraApprover}
            onChange={setExtraApprover}
            placeholder="Не назначать"
            allowClear
            options={EXTRA_APPROVER_OPTIONS}
          />
        </Form.Item>

        <Form.Item label="Согласующий">
          {!changeApprover ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 12px',
              border: '1px solid #d9d9d9',
              borderRadius: 6,
              background: '#fafafa',
            }}>
              <div>
                <Typography.Text strong style={{ display: 'block', fontSize: 14 }}>
                  {DEFAULT_APPROVER.name}
                </Typography.Text>
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  {DEFAULT_APPROVER.role}
                </Typography.Text>
              </div>
              <Button type="link" size="small" onClick={() => setChangeApprover(true)} style={{ padding: 0 }}>
                Изменить
              </Button>
            </div>
          ) : (
            <Select
              value={approverOverride}
              onChange={setApproverOverride}
              placeholder={`По умолчанию — ${DEFAULT_APPROVER.name}`}
              allowClear
              options={APPROVER_OPTIONS}
            />
          )}
        </Form.Item>

        <Button type="primary" block onClick={handleSubmit}>
          Отправить на согласование
        </Button>

      </Form>
    </Modal>
  )
}
