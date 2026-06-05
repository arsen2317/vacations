import { useState } from 'react'
import { COLLEAGUES } from '../data/mockData'
import { BTN_STYLE, PersonAvatar, SelectField } from '../ds/index'

const MONTH_GEN = ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря']

const DEFAULT_APPROVER = { name: 'Дмитрий Соколов', role: 'Руководитель', avatar: '/avatars/egor.webp' }
const APPROVER_OPTIONS = COLLEAGUES.filter(c => !c.me).map(c => ({ id: String(c.id), name: c.name, avatar: c.avatar }))

function formatSegmentDate(iso) {
  const d = new Date(iso + 'T00:00:00')
  return `${d.getDate()} ${MONTH_GEN[d.getMonth()]}`
}

function pluralDays(n) {
  if (n % 10 === 1 && n % 100 !== 11) return 'день'
  if (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)) return 'дня'
  return 'дней'
}

// "Дмитрий Соколов" → "Соколов Д."
function formatNameShort(name) {
  if (!name) return '—'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0]
  const surname = parts[parts.length - 1]
  const initials = parts.slice(0, -1).map(p => p[0].toUpperCase() + '.').join('')
  return `${surname} ${initials}`
}

// "Дмитрий Соколов" → "Соколов Дмитрий"
function formatSurnameFirst(name) {
  if (!name) return name
  const parts = name.trim().split(/\s+/)
  if (parts.length <= 1) return name
  return `${parts[parts.length - 1]} ${parts.slice(0, -1).join(' ')}`
}

function SectionLabel({ children }) {
  return (
    <span style={{
      fontSize: 14, fontFamily: "'MTSCompact', sans-serif", fontWeight: 500,
      lineHeight: '20px', color: '#626C77', textTransform: 'uppercase', letterSpacing: '0.05em',
    }}>
      {children}
    </span>
  )
}

export default function PlanSubmitModal({ segments, onClose, onSubmit }) {
  const [changeApprover, setChangeApprover] = useState(false)
  const [approverOverride, setApproverOverride] = useState('')
  const [extraApprover, setExtraApprover] = useState('')
  const [pickingExtra, setPickingExtra] = useState(false)

  const approverColleague = approverOverride ? COLLEAGUES.find(c => String(c.id) === approverOverride) : null
  const approverName   = approverColleague?.name   ?? DEFAULT_APPROVER.name
  const approverAvatar = approverColleague?.avatar ?? DEFAULT_APPROVER.avatar

  const extraApproverColleague = extraApprover ? APPROVER_OPTIONS.find(o => o.id === extraApprover) : null

  function handleSubmit() {
    onSubmit({
      approver: { name: approverName, role: 'Руководитель', avatar: approverAvatar },
      extraApprover: extraApproverColleague ? formatSurnameFirst(extraApproverColleague.name) : undefined,
    })
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ width: 560, maxHeight: '90vh', background: '#fff', borderRadius: 32, display: 'flex', flexDirection: 'column', overflow: 'hidden', fontFamily: "'MTSCompact', sans-serif" }}
      >
        {/* Header */}
        <div style={{ padding: '28px 20px 0', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexShrink: 0, gap: 12 }}>
          <div style={{ fontSize: 20, fontWeight: 500, fontFamily: "'MTSWide', sans-serif", color: '#1D2023', lineHeight: '24px' }}>
            Планы на отпуск 2027
          </div>
          <button
            onClick={onClose}
            style={{ flexShrink: 0, border: 'none', background: '#F2F3F7', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 12, padding: 4 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M6.29289 16.2929C5.90237 16.6834 5.90237 17.3166 6.29289 17.7071C6.68342 18.0976 7.31658 18.0976 7.70711 17.7071L11.9999 13.4143L16.2929 17.7073C16.6834 18.0978 17.3166 18.0978 17.7071 17.7073C18.0976 17.3167 18.0976 16.6836 17.7071 16.293L13.4141 12.0001L17.7071 7.70711C18.0976 7.31658 18.0976 6.68342 17.7071 6.29289C17.3166 5.90237 16.6834 5.90237 16.2929 6.29289L11.9999 10.5859L7.70711 6.29304C7.31658 5.90252 6.68342 5.90252 6.2929 6.29304C5.90237 6.68357 5.90237 7.31673 6.29289 7.70726L10.5857 12.0001L6.29289 16.2929Z" fill="#1D2023"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="modal-scroll" style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 20, overflowY: 'auto' }}>

          {/* Periods list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <SectionLabel>Периоды отпуска</SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {segments.map(seg => (
                <div key={seg.id} style={{ paddingTop: 10, paddingBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ color: '#1D2023', fontSize: 17, fontFamily: "'MTSCompact', sans-serif", fontWeight: 500, lineHeight: '24px' }}>
                    {formatSegmentDate(seg.startDate)} – {formatSegmentDate(seg.endDate)}
                  </div>
                  <div style={{ color: '#626C77', fontSize: 14, fontFamily: "'MTSCompact', sans-serif", fontWeight: 400, lineHeight: '20px' }}>
                    {seg.days} {pluralDays(seg.days)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Согласующий */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <SectionLabel>Согласующий</SectionLabel>
            {changeApprover ? (
              <SelectField
                value={approverOverride}
                options={APPROVER_OPTIONS}
                placeholder="Выберите согласующего"
                onChange={v => { setApproverOverride(v); setChangeApprover(false) }}
                searchable
              />
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <PersonAvatar src={approverAvatar} size={52} />
                  <div>
                    <div style={{ fontSize: 17, lineHeight: '24px', color: '#1D2023', fontFamily: "'MTSCompact', sans-serif" }}>{formatNameShort(approverName)}</div>
                    <div style={{ fontSize: 14, lineHeight: '20px', color: '#626C77', fontFamily: "'MTSCompact', sans-serif" }}>{DEFAULT_APPROVER.role}</div>
                  </div>
                </div>
                <button
                  onClick={() => setChangeApprover(true)}
                  style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path fillRule="evenodd" clipRule="evenodd" d="M13.4788 0.00746568C12.8251 0.0598684 12.4177 0.412273 11.6029 1.11708C10.2959 2.24773 8.44909 3.88863 6.94648 5.39079C5.44386 6.89294 3.80245 8.73915 2.67146 10.0458C2.36674 10.3978 2.12788 10.6738 1.95063 10.9264C1.62569 11.3329 1.3956 12.0901 1.04235 13.2527L0.514634 14.9895C0.0352647 16.5671 -0.20442 17.356 0.219899 17.7802C0.644215 18.2044 1.43328 17.9647 3.01141 17.4855L4.74876 16.958C5.98041 16.584 6.75726 16.3481 7.14413 15.9914C7.37696 15.8205 7.633 15.599 7.95112 15.3238C9.25816 14.1932 11.1049 12.5523 12.6076 11.0501C14.1102 9.54797 15.7516 7.70176 16.8826 6.39512C17.5876 5.58061 17.9401 5.17335 17.9925 4.5198C18.045 3.86626 17.8198 3.50177 17.3694 2.77279C17.1126 2.35721 16.8011 1.93356 16.4335 1.56604C16.0658 1.19852 15.6421 0.887124 15.2264 0.630439C14.4972 0.180188 14.1326 -0.044937 13.4788 0.00746568ZM3.52706 12.1618C3.52875 12.1586 3.53037 12.1553 3.53037 12.1553L3.55327 12.1267L3.58928 12.0753C3.69511 11.9245 3.85677 11.7342 4.18498 11.3551C5.30704 10.0587 6.91096 8.25596 8.36174 6.80562C8.92296 6.24458 9.53693 5.66063 10.1539 5.09052L12.9079 7.84366C12.3376 8.46047 11.7535 9.07425 11.1923 9.63529C9.7415 11.0856 7.93817 12.6891 6.64145 13.8108C6.30277 14.1038 6.11386 14.2653 5.95974 14.3784L5.86948 14.4447L5.83526 14.4762C5.80512 14.4918 5.7214 14.5337 5.55359 14.5973C5.23461 14.7182 4.80697 14.8491 4.16704 15.0435L2.42973 15.571L2.95744 13.8342C3.14021 13.2327 3.26737 12.8169 3.3848 12.4988C3.46465 12.2825 3.51381 12.1875 3.52706 12.1618ZM14.2529 6.35858C14.6566 5.90447 15.0343 5.47262 15.3691 5.08586C15.5507 4.87603 15.6844 4.72134 15.7954 4.58529C15.8863 4.474 15.9421 4.39913 15.9773 4.34739C15.9645 4.32261 15.9473 4.29098 15.9246 4.2511C15.8623 4.14167 15.7843 4.01494 15.6665 3.82424C15.4664 3.50036 15.2472 3.20983 15.0182 2.98087C14.7892 2.75192 14.4986 2.53283 14.1746 2.33278C13.9838 2.21499 13.8571 2.13703 13.7476 2.07474C13.7077 2.05205 13.6761 2.03491 13.6513 2.02203C13.5995 2.0573 13.5246 2.11309 13.4133 2.2039C13.2772 2.31493 13.1225 2.44857 12.9126 2.63014C12.5257 2.96481 12.0937 3.34236 11.6395 3.74593L14.2529 6.35858Z" fill="#8D969F"/>
                  </svg>
                </button>
              </div>
            )}
          </div>

          {/* Дополнительный согласующий */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <SectionLabel>Дополнительный согласующий</SectionLabel>
            {extraApproverColleague ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <PersonAvatar src={extraApproverColleague.avatar} size={52} />
                  <div>
                    <div style={{ fontSize: 17, lineHeight: '24px', color: '#1D2023', fontFamily: "'MTSCompact', sans-serif" }}>{formatSurnameFirst(extraApproverColleague.name)}</div>
                  </div>
                </div>
                <button
                  onClick={() => setExtraApprover('')}
                  style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M0.292893 10.2929C-0.0976311 10.6834 -0.0976311 11.3166 0.292893 11.7071C0.683418 12.0976 1.31658 12.0976 1.70711 11.7071L5.99993 7.41429L10.2929 11.7073C10.6834 12.0978 11.3166 12.0978 11.7071 11.7073C12.0976 11.3167 12.0976 10.6836 11.7071 10.293L7.41414 6.00007L11.7071 1.70711C12.0976 1.31658 12.0976 0.683417 11.7071 0.292893C11.3166 -0.0976313 10.6834 -0.0976309 10.2929 0.292894L5.99992 4.58586L1.70711 0.293045C1.31658 -0.0974801 0.683419 -0.0974798 0.292895 0.293044C-0.0976297 0.683569 -0.0976293 1.31673 0.292895 1.70726L4.58571 6.00007L0.292893 10.2929Z" fill="#8D969F"/>
                  </svg>
                </button>
              </div>
            ) : pickingExtra ? (
              <SelectField
                value={extraApprover}
                options={APPROVER_OPTIONS}
                placeholder="Выберите согласующего"
                onChange={v => { setExtraApprover(v); setPickingExtra(false) }}
                searchable
              />
            ) : (
              <button
                onClick={() => setPickingExtra(true)}
                style={{ paddingTop: 10, paddingBottom: 10, display: 'flex', alignItems: 'center', gap: 12, background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left' }}
              >
                <div style={{ width: 52, height: 52, borderRadius: 16, flexShrink: 0, background: '#F2F3F7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M7 15C7 15.5523 7.44772 16 8 16C8.55229 16 9 15.5523 9 15V9H15C15.5523 9 16 8.55229 16 8C16 7.44772 15.5523 7 15 7H9V1C9 0.447715 8.55228 0 8 0C7.44771 0 7 0.447715 7 1L7 7H1C0.447715 7 0 7.44771 0 8C0 8.55228 0.447715 9 1 9H7L7 15Z" fill="#007CFF"/>
                  </svg>
                </div>
                <span style={{ fontSize: 17, lineHeight: '24px', color: '#0070E5', fontFamily: "'MTSCompact', sans-serif" }}>
                  Добавьте дополнительного согласующего
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{ paddingTop: 32, paddingBottom: 20, paddingLeft: 20, paddingRight: 20, flexShrink: 0, display: 'flex', gap: 12 }}>
          <button
            onClick={handleSubmit}
            style={{ flex: 1, height: 52, background: '#0066FF', color: '#fff', border: 'none', borderRadius: 16, cursor: 'pointer', ...BTN_STYLE }}
          >
            СОЗДАТЬ ЗАЯВКИ
          </button>
          <button
            onClick={onClose}
            style={{ flex: 1, height: 52, background: '#F2F3F7', color: '#1D2023', border: 'none', borderRadius: 16, cursor: 'pointer', ...BTN_STYLE }}
          >
            ОТМЕНА
          </button>
        </div>
      </div>
    </div>
  )
}
