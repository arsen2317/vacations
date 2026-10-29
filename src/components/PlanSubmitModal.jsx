import { useState } from 'react'
import { COLLEAGUES } from '../data/mockData'
import { SelectField, Drawer } from '../ds/index'
import { LOCALE } from '../i18n/locale'
import { t, tName, MONTH_GEN_SHORT, pluralDays } from '../i18n/translate'

const DEFAULT_APPROVER = { name: 'Дмитрий Соколов', role: 'Руководитель', avatar: '/avatars/egor.webp' }
const APPROVER_OPTIONS = COLLEAGUES.filter(c => !c.me).map(c => ({
  id: String(c.id),
  name: c.name,
  avatar: c.avatar,
  role: c.name === DEFAULT_APPROVER.name ? DEFAULT_APPROVER.role : (c.position ?? c.team),
}))
const DEFAULT_APPROVER_ID = APPROVER_OPTIONS.find(o => o.name === DEFAULT_APPROVER.name)?.id ?? ''

function formatSegmentDate(iso) {
  const d = new Date(iso + 'T00:00:00')
  return `${d.getDate()} ${MONTH_GEN_SHORT[d.getMonth()]}`
}

// "Дмитрий Соколов" → "Соколов Дмитрий"
function formatSurnameFirst(name) {
  if (!name) return name
  const parts = name.trim().split(/\s+/)
  if (parts.length <= 1) return name
  return `${parts[parts.length - 1]} ${parts.slice(0, -1).join(' ')}`
}

export default function PlanSubmitModal({ segments, onClose, onSubmit }) {
  const [approver, setApprover] = useState(DEFAULT_APPROVER_ID)
  const [extraApprover, setExtraApprover] = useState('')

  const approverColleague = APPROVER_OPTIONS.find(o => o.id === approver)
  const approverName   = approverColleague?.name   ?? DEFAULT_APPROVER.name
  const approverAvatar = approverColleague?.avatar ?? DEFAULT_APPROVER.avatar

  const extraApproverColleague = extraApprover ? APPROVER_OPTIONS.find(o => o.id === extraApprover) : null
  const personOptions = APPROVER_OPTIONS.map(o => ({ ...o, name: tName(o.name), role: o.role ? t(o.role) : undefined }))
  const totalDays = segments.reduce((sum, seg) => sum + seg.days, 0)

  function handleSubmit() {
    onSubmit({
      approver: { name: approverName, role: 'Руководитель', avatar: approverAvatar },
      extraApprover: extraApproverColleague
        ? (LOCALE === 'en' ? tName(extraApproverColleague.name) : formatSurnameFirst(extraApproverColleague.name))
        : undefined,
    })
  }

  return (
    <Drawer
      title={t('Планы на отпуск 2027')}
      subtitle={`${t('Распределено')} ${totalDays} ${pluralDays(totalDays)} ${t('отпуска')}`}
      onClose={onClose}
      actions={[
        { label: t('создать заявки'), type: 'primary', onClick: handleSubmit },
        { label: t('отмена'), type: 'secondary', onClick: onClose },
      ]}
    >
      {/* Periods list */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ color: '#626C77', fontSize: 14, fontFamily: "'MTSCompact', sans-serif", lineHeight: '20px' }}>{t('Периоды отпуска')}</div>
        {segments.map(seg => (
          <div key={seg.id} style={{ padding: '10px 0', display: 'flex', flexDirection: 'column' }}>
            <div style={{ color: '#1D2023', fontSize: 17, fontFamily: "'MTSCompact', sans-serif", fontWeight: 500, lineHeight: '24px' }}>
              {formatSegmentDate(seg.startDate)} – {formatSegmentDate(seg.endDate)}
            </div>
            <div style={{ color: '#626C77', fontSize: 14, fontFamily: "'MTSCompact', sans-serif", lineHeight: '20px' }}>
              {seg.days} {pluralDays(seg.days)}
            </div>
          </div>
        ))}
      </div>

      <SelectField
        person
        label={t('Согласующий')}
        value={approver}
        options={personOptions}
        onChange={v => setApprover(v || DEFAULT_APPROVER_ID)}
        searchable
      />

      <SelectField
        person
        label={t('Дополнительный согласующий (необязательно)')}
        value={extraApprover}
        options={personOptions.filter(o => o.id !== approver)}
        onChange={setExtraApprover}
        searchable
      />
    </Drawer>
  )
}
