import { useApp } from '../context/AppContext'
import { COLORS, BTN_STYLE, Banner } from '../ds/index'
import { t } from '../i18n/translate'

const cancellationStats = [
  { label: 'На согласовании', count: 1, unit: 'заявка', employees: 1, days: 3, detail: '1 сотрудник, 3 дня' },
  { label: 'Согласовано', count: 48, unit: 'заявки', employees: 42, days: 321, detail: '42 сотрудника, 321 день' },
  { label: 'Отклонено', count: 20, unit: 'заявок', employees: 17, days: 146, detail: '17 сотрудников, 146 дней' },
]

const planningStats = [
  { label: 'Отсутствует план', count: 1245, unit: 'сотрудников' },
  { label: 'На согласовании', count: 721, unit: 'заявка' },
  { label: 'На ознакомлении', count: 200, unit: 'заявок' },
  { label: 'План выгружен в 1С', count: 3900, unit: 'сотрудников' },
]

const cardStyle = {
  minWidth: 0, background: COLORS.white, borderRadius: 32,
  border: `1px solid ${COLORS.stroke}`,
  display: 'flex', flexDirection: 'column', gap: 20,
}
const titleStyle = {
  margin: 0, color: COLORS.text, fontFamily: "'MTSWide', sans-serif",
  fontSize: 24, fontWeight: 500, lineHeight: '28px',
}
const captionStyle = { margin: 0, fontSize: 17, lineHeight: '24px', color: COLORS.secondary }
const inlineButtonStyle = {
  display: 'inline-flex', alignItems: 'center', gap: 4, border: 0, padding: 0,
  background: 'none', color: '#0070E5', font: 'inherit', fontSize: 17,
  lineHeight: '24px', cursor: 'pointer', whiteSpace: 'nowrap',
}

function downloadCsv(filename, headers, rows) {
  const csv = [headers, ...rows]
    .map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
    .join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function ReportCard({ title, notice, onDownload, children, footer }) {
  return (
    <section style={{ ...cardStyle, padding: footer ? '32px 32px 20px' : '32px 32px 36px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, paddingBottom: 8 }}>
        <h2 style={titleStyle}>{title}</h2>
        <button type="button" style={inlineButtonStyle} onClick={onDownload}>
          <img src={`${import.meta.env.BASE_URL}icons/download-report.png`} width={16} height={16} alt="" />
          {t('Скачать отчёт')}
        </button>
      </div>
      <Banner type="info" title={<span style={{ color: COLORS.secondary }}>{notice}</span>} />
      {children}
      {footer}
    </section>
  )
}

function StatsList({ stats, highlightUnit = false }) {
  return (
    <dl style={{ display: 'grid', gap: 28, margin: 0 }}>
      {stats.map(({ label, count, unit, detail }) => (
        <div key={label} style={{ display: 'grid', gap: 8 }}>
          <dt style={captionStyle}>{label}</dt>
          <dd style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: detail ? 16 : 6, margin: 0, color: COLORS.text, fontSize: 17, lineHeight: '24px' }}>
            <strong style={{ fontSize: 24, fontWeight: 500, lineHeight: '28px' }}>{count}{highlightUnit && ` ${unit}`}</strong>
            {!highlightUnit && <span>{unit}</span>}
            {detail && <span>{detail}</span>}
          </dd>
        </div>
      ))}
    </dl>
  )
}

export default function HRAdminPage() {
  const { campaign, decemberCancellation, setDecemberCancellation } = useApp()

  function downloadCancellationReport() {
    downloadCsv(
      'hr-cancellations-2026.csv',
      ['Статус', 'Заявки', 'Сотрудники', 'Дни'],
      cancellationStats.map(({ label, count, employees, days }) => [label, count, employees, days]),
    )
  }

  function downloadPlanningReport() {
    downloadCsv(
      `hr-report-${campaign.year}.csv`,
      ['Показатель', 'Значение', 'Единица'],
      planningStats.map(({ label, count, unit }) => [label, count, unit]),
    )
  }

  return (
    <div style={{
      paddingTop: 32, paddingBottom: 48, display: 'grid', alignItems: 'start', gap: 32,
      gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 440px), 1fr))',
      fontFamily: "'MTSCompact', sans-serif",
    }}>
      <ReportCard
        title={<>Отмена отпусков<br />в декабре 2026 г.</>}
        notice={decemberCancellation
          ? 'Отмена включена — любой сотрудник может отменить свой плановый отпуск с датами начала и окончания до 31 декабря включительно'
          : 'Отмена отключена. Если включить эту опцию, то любой сотрудник сможет отменить свой плановый отпуск с датами начала и окончания до 31 декабря включительно'}
        onDownload={downloadCancellationReport}
        footer={(
          <button
            type="button"
            aria-pressed={decemberCancellation}
            onClick={() => setDecemberCancellation(enabled => !enabled)}
            style={{ ...BTN_STYLE, minHeight: 44, margin: '12px -12px 0', borderRadius: 16, border: 0, background: COLORS.bg, color: COLORS.text, cursor: 'pointer' }}
          >
            {decemberCancellation ? 'Отключить' : 'Включить'}
          </button>
        )}
      >
        {decemberCancellation && <StatsList stats={cancellationStats} highlightUnit />}
      </ReportCard>

      <ReportCard
        title={<>Статус планирования<br />отпусков на {campaign.year} г.</>}
        notice={campaign.active ? 'Кампания планирования отпусков активна' : 'Кампания планирования отпусков завершена'}
        onDownload={downloadPlanningReport}
      >
        <StatsList stats={planningStats} />
      </ReportCard>
    </div>
  )
}
