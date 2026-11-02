import { useState } from 'react'
import RequestsTable from '../components/RequestsTable'
import RequestModal from '../components/RequestModal'
import Toast from '../components/Toast'
import { t } from '../i18n/translate'

export default function RequestsPage() {
  const [selected, setSelected] = useState(null) // { request, reschedule }
  const [toast, setToast] = useState(null)

  return (
    <div style={{ paddingTop: 36 }}>
      <h1 style={{ margin: '0 0 24px', fontSize: 32, fontWeight: 500, color: '#1D2023', lineHeight: '36px', fontFamily: "'MTSWide', sans-serif" }}>
        {t('Все заявки')}
      </h1>

      <RequestsTable
        onSelectRequest={request => setSelected({ request, reschedule: false })}
        onReschedule={request => setSelected({ request, reschedule: true })}
      />

      <RequestModal
        key={selected ? `${selected.request.id}-${selected.reschedule}` : 'none'}
        request={selected?.request ?? null}
        initialReschedule={selected?.reschedule}
        onClose={() => setSelected(null)}
        onAction={msg => { setSelected(null); setToast(msg) }}
      />

      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </div>
  )
}
