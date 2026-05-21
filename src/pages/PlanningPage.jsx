import { useState, useMemo } from 'react'
import {
  Typography, Alert, Card, Row, Col, Button, Space, Tag, Tooltip,
  Segmented, Select, Result, List, DatePicker,
} from 'antd'
import { CalendarOutlined, CloseOutlined, CheckOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import 'dayjs/locale/ru'
import { useApp } from '../context/AppContext'
import { countVacationDays, toKey, fmtDate, pluralDays } from '../utils/dateUtils'
import { COLLEAGUES } from '../data/mockData'

dayjs.locale('ru')

const DEFAULT_APPROVER = { name: 'Дмитрий Соколов', role: 'Руководитель' }
const EXTRA_APPROVER_OPTIONS = COLLEAGUES.filter(c => !c.me).map(c => ({
  value: String(c.id),
  label: c.name,
}))

const TODAY = new Date('2026-05-19T00:00:00')

const MONTH_NAMES = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
]
const DAY_SHORT = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

const PLAN_LABELS = [
  { value: 'draft',    label: 'Черновик' },
  { value: 'pending',  label: 'На согласовании' },
  { value: 'approved', label: 'Согласован' },
]

function getHighlightedSet(segments) {
  const set = new Set()
  for (const s of segments) {
    const cur = new Date(s.startDate + 'T00:00:00')
    const end = new Date(s.endDate + 'T00:00:00')
    while (cur <= end) {
      set.add(toKey(cur))
      cur.setDate(cur.getDate() + 1)
    }
  }
  return set
}

function MonthMini({
  year, month, highlighted, hlBg = '#6366f1', hlText = '#ffffff',
  interactive = false, selectionStart = null, hoverDate = null,
  onDateClick, onDateHover,
}) {
  const first = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0).getDate()
  let startDow = first.getDay()
  startDow = startDow === 0 ? 6 : startDow - 1

  const cells = Array(startDow).fill(null)
  for (let d = 1; d <= lastDay; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)

  const selMin = selectionStart && hoverDate
    ? (selectionStart < hoverDate ? selectionStart : hoverDate)
    : null
  const selMax = selectionStart && hoverDate
    ? (selectionStart < hoverDate ? hoverDate : selectionStart)
    : null

  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 600, color: '#4b5563', marginBottom: 4 }}>
        {MONTH_NAMES[month]}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
        {DAY_SHORT.map(d => (
          <span key={d} style={{ fontSize: 9, color: '#9ca3af', textAlign: 'center', lineHeight: '16px' }}>
            {d}
          </span>
        ))}
        {cells.map((day, i) => {
          if (!day) return <span key={`n${i}`} style={{ lineHeight: '20px' }} />
          const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const isHl = highlighted.has(key)
          const isWeekend = (i % 7) >= 5
          const isSelStart = interactive && key === selectionStart
          const inPreview = interactive && selMin && selMax && key >= selMin && key <= selMax

          let bg = 'transparent'
          let textColor = isWeekend ? '#d1d5db' : '#4b5563'
          let fw = 400

          if (isHl) {
            bg = hlBg; textColor = hlText; fw = 500
          } else if (isSelStart) {
            bg = '#6366f1'; textColor = '#ffffff'; fw = 600
          } else if (inPreview) {
            bg = '#eef2ff'; textColor = '#4f46e5'; fw = 500
          }

          return (
            <span
              key={i}
              style={{
                fontSize: 10,
                textAlign: 'center',
                lineHeight: '20px',
                borderRadius: 2,
                background: bg,
                color: textColor,
                fontWeight: fw,
                cursor: interactive ? 'pointer' : 'default',
                userSelect: 'none',
              }}
              onClick={interactive ? () => onDateClick?.(key) : undefined}
              onMouseEnter={interactive ? () => onDateHover?.(key) : undefined}
            >
              {day}
            </span>
          )
        })}
      </div>
    </div>
  )
}

function segStatus(seg) {
  const start = new Date(seg.startDate + 'T00:00:00')
  const end   = new Date(seg.endDate   + 'T00:00:00')
  if (TODAY > end)    return 'past'
  if (TODAY >= start) return 'ongoing'
  return 'upcoming'
}

function daysUntilStart(seg) {
  const start = new Date(seg.startDate + 'T00:00:00')
  return Math.ceil((start - TODAY) / 86400000)
}

const SEG_STATUS_TAG = {
  past:     { label: 'Прошёл',    color: 'default'    },
  ongoing:  { label: 'Идёт',      color: 'processing' },
  upcoming: { label: 'Предстоит', color: 'blue'       },
}

function CalendarCard({ year, highlighted, hlBg, hlText }) {
  return (
    <Card
      title={`Календарь ${year}`}
      styles={{ body: { padding: 16, maxHeight: 480, overflowY: 'auto' } }}
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px 16px' }}>
        {Array.from({ length: 12 }, (_, m) => (
          <MonthMini key={m} year={year} month={m} highlighted={highlighted} hlBg={hlBg} hlText={hlText} />
        ))}
      </div>
    </Card>
  )
}

function PendingView({ segments, year }) {
  const highlighted = useMemo(() => getHighlightedSet(segments), [segments])
  return (
    <Space direction="vertical" style={{ width: '100%' }} size={16}>
      <Typography.Title level={4} style={{ margin: 0 }}>
        Планирование отпуска на {year} год
      </Typography.Title>

      <Alert
        type="warning"
        showIcon
        message="Ожидает согласования"
        description="План отправлен руководителю. Ожидайте ответа."
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Отправленные отрезки" styles={{ body: { padding: 0 } }}>
            {segments.length === 0 ? (
              <div style={{ padding: '40px 0', textAlign: 'center' }}>
                <Typography.Text type="secondary">Нет отрезков</Typography.Text>
              </div>
            ) : (
              <List
                dataSource={segments}
                renderItem={(seg, i) => (
                  <List.Item style={{ padding: '12px 16px', alignItems: 'flex-start' }}>
                    <Typography.Text
                      type="secondary"
                      style={{ width: 20, flexShrink: 0, textAlign: 'right', fontSize: 12, marginRight: 8, lineHeight: '22px' }}
                    >
                      {i + 1}
                    </Typography.Text>
                    <div>
                      <Typography.Text style={{ fontSize: 14, fontWeight: 500, display: 'block' }}>
                        {fmtDate(seg.startDate)} — {fmtDate(seg.endDate)}
                      </Typography.Text>
                      <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                        {pluralDays(seg.days)}
                      </Typography.Text>
                    </div>
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <CalendarCard year={year} highlighted={highlighted} hlBg="#fde68a" hlText="#92400e" />
        </Col>
      </Row>
    </Space>
  )
}

function ApprovedView({ segments, year, reschedules, setReschedules }) {
  const [expandedId, setExpandedId] = useState(null)
  const [rRange, setRRange] = useState(null)
  const [rError, setRError] = useState('')
  const highlighted = useMemo(() => getHighlightedSet(segments), [segments])

  function openReschedule(id) {
    if (expandedId === id) {
      setExpandedId(null)
    } else {
      setExpandedId(id)
      setRRange(null)
      setRError('')
    }
  }

  function submitReschedule(seg) {
    setRError('')
    if (!rRange?.[0] || !rRange?.[1]) { setRError('Укажите обе даты'); return }
    const start = rRange[0].toDate()
    const end   = rRange[1].toDate()
    for (const s of segments) {
      if (s.id === seg.id) continue
      const sStart = new Date(s.startDate + 'T00:00:00')
      const sEnd   = new Date(s.endDate   + 'T00:00:00')
      if (start <= sEnd && end >= sStart) {
        setRError('Период пересекается с другим отрезком'); return
      }
    }
    setReschedules(prev => ({
      ...prev,
      [seg.id]: {
        count: prev[seg.id]?.count ?? 0,
        pending: { startDate: rRange[0].format('YYYY-MM-DD'), endDate: rRange[1].format('YYYY-MM-DD') },
      },
    }))
    setExpandedId(null)
  }

  return (
    <Space direction="vertical" style={{ width: '100%' }} size={16}>
      <div>
        <Typography.Title level={4} style={{ margin: 0 }}>
          Согласованный план на {year} год
        </Typography.Title>
        <Typography.Text type="secondary" style={{ fontSize: 13 }}>
          Перенос возможен за 10 и более дней до начала — не более 2 переносов на отрезок
        </Typography.Text>
      </div>

      <Alert
        type="success"
        showIcon
        message="План согласован"
        description={`Руководитель одобрил ваш план отпуска на ${year} год`}
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Отрезки отпуска" styles={{ body: { padding: 0 } }}>
            {segments.map((seg, i) => {
              const status = segStatus(seg)
              const { label: statusLabel, color: statusColor } = SEG_STATUS_TAG[status]
              const rInfo    = reschedules[seg.id] ?? { count: 0, pending: null }
              const daysLeft = daysUntilStart(seg)
              const canReschedule =
                status === 'upcoming' && daysLeft >= 10 && rInfo.count < 2 && !rInfo.pending

              let cantReason = null
              if (!canReschedule) {
                if (status === 'past')         cantReason = 'Отрезок уже прошёл'
                else if (status === 'ongoing')  cantReason = 'Отрезок уже начался'
                else if (daysLeft < 10)         cantReason = 'Менее 10 дней до начала'
                else if (rInfo.count >= 2)      cantReason = 'Исчерпан лимит переносов (2/2)'
                else if (rInfo.pending)         cantReason = 'Перенос уже на согласовании'
              }

              const isExpanded = expandedId === seg.id

              return (
                <div key={seg.id} style={{ borderBottom: '1px solid #fafafa' }}>
                  <div style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', gap: 8 }}>
                    <Typography.Text type="secondary" style={{ width: 20, flexShrink: 0, textAlign: 'right', fontSize: 12 }}>
                      {i + 1}
                    </Typography.Text>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Typography.Text style={{ fontSize: 14, fontWeight: 500, display: 'block' }}>
                        {fmtDate(seg.startDate)} — {fmtDate(seg.endDate)}
                      </Typography.Text>
                      <Space size={4} wrap style={{ marginTop: 2 }}>
                        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                          {pluralDays(seg.days)}
                        </Typography.Text>
                        <Tag color={statusColor} style={{ marginInlineEnd: 0, fontSize: 11 }}>
                          {statusLabel}
                        </Tag>
                        {rInfo.count > 0 && (
                          <Typography.Text type="secondary" style={{ fontSize: 11 }}>
                            Переносов: {rInfo.count}/2
                          </Typography.Text>
                        )}
                        {rInfo.pending && (
                          <Tag color="gold" style={{ marginInlineEnd: 0, fontSize: 11 }}>
                            Перенос на согласовании
                          </Tag>
                        )}
                      </Space>
                      {rInfo.pending && (
                        <Typography.Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 2 }}>
                          Новые даты: {fmtDate(rInfo.pending.startDate)} — {fmtDate(rInfo.pending.endDate)}
                        </Typography.Text>
                      )}
                    </div>
                    <div style={{ flexShrink: 0 }}>
                      {canReschedule ? (
                        <Button
                          size="small"
                          type="primary"
                          ghost={!isExpanded}
                          onClick={() => openReschedule(seg.id)}
                        >
                          {isExpanded ? 'Закрыть' : 'Перенести'}
                        </Button>
                      ) : (
                        <Tooltip title={cantReason}>
                          <span>
                            <Button size="small" disabled>Перенести</Button>
                          </span>
                        </Tooltip>
                      )}
                    </div>
                  </div>

                  {isExpanded && (
                    <Card
                      size="small"
                      style={{ margin: '0 16px 12px', background: '#f5f3ff', borderColor: '#e0e7ff' }}
                      styles={{ body: { padding: 12 } }}
                    >
                      <Space direction="vertical" style={{ width: '100%' }} size={8}>
                        <Typography.Text style={{ fontSize: 12, fontWeight: 600, color: '#4f46e5' }}>
                          Новые даты для отрезка
                        </Typography.Text>
                        <DatePicker.RangePicker
                          value={rRange}
                          onChange={v => { setRRange(v); setRError('') }}
                          disabledDate={d => d.year() !== year}
                          format="DD.MM.YYYY"
                          style={{ width: '100%' }}
                          placeholder={['Начало', 'Окончание']}
                          status={rError ? 'error' : ''}
                        />
                        {rError && (
                          <Typography.Text type="danger" style={{ fontSize: 12 }}>{rError}</Typography.Text>
                        )}
                        <Space>
                          <Button type="primary" size="small" onClick={() => submitReschedule(seg)}>
                            Отправить на согласование
                          </Button>
                          <Button size="small" onClick={() => { setExpandedId(null); setRError('') }}>
                            Отмена
                          </Button>
                        </Space>
                      </Space>
                    </Card>
                  )}
                </div>
              )
            })}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <CalendarCard year={year} highlighted={highlighted} hlBg="#4ade80" hlText="#ffffff" />
        </Col>
      </Row>
    </Space>
  )
}

export default function PlanningPage({ onGoToRequests }) {
  const {
    campaign, role, segments, setSegments, draftSaved, setDraftSaved,
    planStatus, setPlanStatus, approvedSegments, reschedules, setReschedules,
  } = useApp()
  const [newRange, setNewRange] = useState(null)
  const [addError, setAddError] = useState('')
  const [showApproverStep, setShowApproverStep] = useState(false)
  const [planExtraApprover, setPlanExtraApprover] = useState(undefined)
  const [selectionStart, setSelectionStart] = useState(null)
  const [hoverDate, setHoverDate] = useState(null)

  const year = campaign.year
  const distributedDays = useMemo(
    () => segments.reduce((acc, s) => acc + s.days, 0),
    [segments],
  )
  const remainingDays = campaign.totalDays - distributedDays
  const hasLongSegment = segments.some(s => s.days >= 14)
  const canSubmit = remainingDays === 0 && hasLongSegment
  const highlighted = useMemo(() => getHighlightedSet(segments), [segments])
  const progressPct = Math.round((distributedDays / campaign.totalDays) * 100)

  const previewDays = useMemo(() => {
    if (!newRange?.[0] || !newRange?.[1]) return null
    try {
      return countVacationDays(newRange[0].toDate(), newRange[1].toDate())
    } catch { return null }
  }, [newRange])

  const demoSwitcher = (
    <div style={{ marginBottom: 20 }}>
      <Space size={8} align="center">
        <Segmented
          value={planStatus}
          onChange={setPlanStatus}
          options={PLAN_LABELS}
          size="small"
        />
        <Typography.Text type="secondary" style={{ fontSize: 11 }}>демо</Typography.Text>
      </Space>
    </div>
  )

  if (!campaign.active) {
    return (
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '24px 16px' }}>
        <Result
          icon={<CalendarOutlined style={{ fontSize: 56, color: '#d9d9d9' }} />}
          title="Кампания по планированию не активна"
          subTitle={
            role === 'employee'
              ? 'Распределение дней отпуска доступно только в период активной кампании. Если вам нужен отпуск прямо сейчас — оформите внеплановую заявку.'
              : 'Распределение дней отпуска доступно только в период активной кампании. Следите за уведомлениями — HR-админ сообщит о её начале.'
          }
          extra={role === 'employee' ? (
            <Button type="primary" onClick={onGoToRequests}>
              Подать внеплановую заявку
            </Button>
          ) : null}
        />
      </div>
    )
  }

  if (planStatus === 'pending') {
    return (
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '24px 16px' }}>
        {demoSwitcher}
        <PendingView segments={segments} year={year} />
      </div>
    )
  }

  if (planStatus === 'approved') {
    return (
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '24px 16px' }}>
        {demoSwitcher}
        <ApprovedView
          segments={approvedSegments}
          year={year}
          reschedules={reschedules}
          setReschedules={setReschedules}
        />
      </div>
    )
  }

  function tryAddSegment(startStr, endStr) {
    setAddError('')
    const start = new Date(startStr + 'T00:00:00')
    const end   = new Date(endStr   + 'T00:00:00')
    if (start.getFullYear() !== year || end.getFullYear() !== year) {
      setAddError(`Даты должны быть в ${year} году`); return false
    }
    for (const s of segments) {
      const sStart = new Date(s.startDate + 'T00:00:00')
      const sEnd   = new Date(s.endDate   + 'T00:00:00')
      if (start <= sEnd && end >= sStart) {
        setAddError('Период пересекается с существующим отрезком'); return false
      }
    }
    const days = countVacationDays(start, end)
    if (days > remainingDays) {
      setAddError(`Отрезок займёт ${pluralDays(days)}, осталось только ${pluralDays(remainingDays)}`); return false
    }
    const seg = { id: Date.now(), startDate: startStr, endDate: endStr, days }
    setSegments(prev => [...prev, seg].sort((a, b) => a.startDate.localeCompare(b.startDate)))
    setDraftSaved(false)
    return true
  }

  function addSegment() {
    if (!newRange?.[0] || !newRange?.[1]) { setAddError('Укажите обе даты'); return }
    if (tryAddSegment(newRange[0].format('YYYY-MM-DD'), newRange[1].format('YYYY-MM-DD'))) {
      setNewRange(null)
    }
  }

  function handleCalendarClick(dateStr) {
    if (!dateStr.startsWith(String(year))) return
    if (!selectionStart) {
      setSelectionStart(dateStr)
      setHoverDate(dateStr)
      setAddError('')
    } else {
      const start = selectionStart < dateStr ? selectionStart : dateStr
      const end   = selectionStart < dateStr ? dateStr : selectionStart
      setSelectionStart(null)
      setHoverDate(null)
      tryAddSegment(start, end)
    }
  }

  function removeSegment(id) {
    setSegments(prev => prev.filter(s => s.id !== id))
    setDraftSaved(false)
  }

  const submitBlockers = []
  if (remainingDays > 0) submitBlockers.push(`нераспределено ${pluralDays(remainingDays)}`)
  if (!hasLongSegment)   submitBlockers.push('нет отрезка ≥ 14 дней')

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '24px 16px' }}>
      {demoSwitcher}

      <Space direction="vertical" style={{ width: '100%' }} size={16}>
        <div>
          <Typography.Title level={4} style={{ margin: 0 }}>
            Планирование отпуска на {year} год
          </Typography.Title>
          <Typography.Text type="secondary" style={{ fontSize: 13 }}>
            Один из отрезков должен быть не менее 14 дней
          </Typography.Text>
        </div>

        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card styles={{ body: { padding: 0 } }}>

              {/* Progress header */}
              <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid #f0f0f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <Typography.Text strong>Отрезки отпуска</Typography.Text>
                  <Typography.Text style={{ fontSize: 12, color: remainingDays === 0 ? '#52c41a' : '#d48806' }}>
                    {remainingDays === 0 ? 'Все дни распределены ✓' : `Осталось: ${pluralDays(remainingDays)}`}
                  </Typography.Text>
                </div>
                <div style={{ height: 6, background: '#f0f0f0', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    borderRadius: 3,
                    width: `${progressPct}%`,
                    background: remainingDays === 0 ? '#52c41a' : '#6366f1',
                    transition: 'width 0.3s',
                  }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                  <Typography.Text type="secondary" style={{ fontSize: 11 }}>
                    {distributedDays} из {campaign.totalDays} дней
                  </Typography.Text>
                  <Typography.Text type="secondary" style={{ fontSize: 11 }}>{progressPct}%</Typography.Text>
                </div>
              </div>

              {/* Segments list */}
              {segments.length === 0 ? (
                <div style={{ padding: '40px 0', textAlign: 'center' }}>
                  <Typography.Text type="secondary">Нет добавленных отрезков</Typography.Text>
                </div>
              ) : segments.map((seg, i) => (
                <div
                  key={seg.id}
                  style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', gap: 8, borderBottom: '1px solid #fafafa' }}
                >
                  <Typography.Text type="secondary" style={{ width: 20, flexShrink: 0, textAlign: 'right', fontSize: 12 }}>
                    {i + 1}
                  </Typography.Text>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Typography.Text style={{ fontSize: 14, fontWeight: 500, display: 'block' }}>
                      {fmtDate(seg.startDate)} — {fmtDate(seg.endDate)}
                    </Typography.Text>
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                      {pluralDays(seg.days)}
                      {seg.days >= 14 && (
                        <Typography.Text style={{ fontSize: 12, color: '#52c41a', fontWeight: 500, marginLeft: 8 }}>
                          ✓ ≥ 14 дней
                        </Typography.Text>
                      )}
                    </Typography.Text>
                  </div>
                  <Button
                    type="text"
                    size="small"
                    icon={<CloseOutlined />}
                    onClick={() => removeSegment(seg.id)}
                    style={{ color: '#bfbfbf', flexShrink: 0 }}
                  />
                </div>
              ))}

              {/* Add segment form */}
              <div style={{ borderTop: '1px solid #f0f0f0', background: '#fafafa', padding: 16 }}>
                <Typography.Text style={{ fontSize: 12, fontWeight: 500, display: 'block', marginBottom: 8 }}>
                  Добавить отрезок
                </Typography.Text>
                <div style={{ display: 'flex', gap: 8 }}>
                  <DatePicker.RangePicker
                    value={newRange}
                    onChange={v => { setNewRange(v); setAddError('') }}
                    disabledDate={d => d.year() !== year}
                    format="DD.MM.YYYY"
                    style={{ flex: 1 }}
                    placeholder={['Начало', 'Окончание']}
                    status={addError ? 'error' : ''}
                  />
                  <Button onClick={addSegment}>+</Button>
                </div>
                {previewDays !== null && !addError && (
                  <Typography.Text style={{ fontSize: 12, color: '#6366f1', display: 'block', marginTop: 4 }}>
                    {pluralDays(previewDays)} отпуска (праздники не считаются)
                    {previewDays > remainingDays && (
                      <Typography.Text style={{ fontSize: 12, color: '#d48806' }}> — превышает остаток</Typography.Text>
                    )}
                  </Typography.Text>
                )}
                {addError && (
                  <Typography.Text type="danger" style={{ fontSize: 12, display: 'block', marginTop: 4 }}>
                    {addError}
                  </Typography.Text>
                )}
              </div>

              {/* Action buttons */}
              {showApproverStep ? (
                <div style={{ borderTop: '1px solid #f0f0f0', padding: 16 }}>
                  <Space direction="vertical" style={{ width: '100%' }} size={12}>
                    <Typography.Text strong style={{ fontSize: 12 }}>Согласующий</Typography.Text>
                    <div style={{
                      padding: '8px 12px',
                      border: '1px solid #d9d9d9',
                      borderRadius: 6,
                      background: '#fafafa',
                    }}>
                      <Typography.Text strong style={{ fontSize: 14, display: 'block' }}>
                        {DEFAULT_APPROVER.name}
                      </Typography.Text>
                      <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                        {DEFAULT_APPROVER.role}
                      </Typography.Text>
                    </div>
                    <div>
                      <Typography.Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
                        Дополнительный согласующий{' '}
                        <Typography.Text type="secondary" style={{ fontSize: 12 }}>(необязательно)</Typography.Text>
                      </Typography.Text>
                      <Select
                        value={planExtraApprover}
                        onChange={setPlanExtraApprover}
                        placeholder="Не назначать"
                        allowClear
                        options={EXTRA_APPROVER_OPTIONS}
                        style={{ width: '100%' }}
                      />
                    </div>
                    <Row gutter={8}>
                      <Col span={16}>
                        <Button
                          type="primary"
                          block
                          onClick={() => { setPlanStatus('pending'); setShowApproverStep(false) }}
                        >
                          Отправить
                        </Button>
                      </Col>
                      <Col span={8}>
                        <Button block onClick={() => setShowApproverStep(false)}>Отмена</Button>
                      </Col>
                    </Row>
                  </Space>
                </div>
              ) : (
                <div style={{ borderTop: '1px solid #f0f0f0', padding: '12px 16px', display: 'flex', gap: 8 }}>
                  <Button
                    style={{ flex: 1 }}
                    icon={draftSaved ? <CheckOutlined /> : undefined}
                    onClick={() => setDraftSaved(true)}
                  >
                    {draftSaved ? 'Черновик сохранён' : 'Сохранить черновик'}
                  </Button>
                  <Tooltip title={!canSubmit ? submitBlockers.join(' · ') : undefined}>
                    <span style={{ flex: 1 }}>
                      <Button
                        type="primary"
                        block
                        disabled={!canSubmit}
                        onClick={() => setShowApproverStep(true)}
                      >
                        Отправить на согласование
                      </Button>
                    </span>
                  </Tooltip>
                </div>
              )}
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card
              title={
                <span>
                  Календарь {year}
                  {!selectionStart && (
                    <Typography.Text type="secondary" style={{ fontSize: 12, fontWeight: 400, marginLeft: 8 }}>
                      нажмите для выбора дат
                    </Typography.Text>
                  )}
                </span>
              }
              styles={{ body: { padding: 16, maxHeight: 480, overflowY: 'auto' } }}
            >
              <div
                style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px 16px' }}
                onMouseLeave={() => setHoverDate(null)}
              >
                {Array.from({ length: 12 }, (_, m) => (
                  <MonthMini
                    key={m}
                    year={year}
                    month={m}
                    highlighted={highlighted}
                    hlBg="#dbeafe"
                    hlText="#2563eb"
                    interactive
                    selectionStart={selectionStart}
                    hoverDate={hoverDate}
                    onDateClick={handleCalendarClick}
                    onDateHover={setHoverDate}
                  />
                ))}
              </div>
              {selectionStart && (
                <div style={{ marginTop: 12, borderTop: '1px solid #f0f0f0', paddingTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography.Text style={{ fontSize: 12, color: '#6366f1' }}>
                    Начало: {fmtDate(selectionStart)} · Нажмите на дату окончания
                  </Typography.Text>
                  <Button
                    type="link"
                    size="small"
                    style={{ padding: 0, height: 'auto' }}
                    onClick={() => { setSelectionStart(null); setHoverDate(null) }}
                  >
                    Отмена
                  </Button>
                </div>
              )}
            </Card>
          </Col>
        </Row>
      </Space>
    </div>
  )
}
