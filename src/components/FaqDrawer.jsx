import { COLORS, Drawer } from '../ds/index'
import { LOCALE } from '../i18n/locale'
import { t } from '../i18n/translate'

const questions = {
  ru: [
    [
      'Сколько дней отпуска мне доступно?',
      'Вам положены 28 дней по ТК и до 3 дополнительных дней в зависимости от категории. Вместе с накопленными ранее днями можно запланировать не более 40 дней за год. При этом хотя бы один отпуск в течение года должен быть не короче 14 дней.',
    ],
    [
      'Как запланировать отпуск?',
      'Во вкладке «Мой отпуск» выберите раздел планирования и на календаре выберите периоды отпуска. Когда все дни будут распределены, вы сможете отправить заявку на согласование. После решения руководителя вам придёт письмо: если отпуска согласованы, подтвердите ознакомление в Личных сервисах, а если нет — скорректируйте даты по его комментарию.',
    ],
    [
      'Как перенести отпуск?',
      'На вкладке «Мой отпуск» нажмите на нужный период отпуска и нажмите на кнопку «Перенести отпуск», выберите новые даты и отправьте их на согласование. Перенести один отпуск можно не более двух раз и не позднее чем за 14 дней до его начала. Новый период отпуска должен совпадать по продолжительности со старым периодом.',
    ],
    [
      'Когда отпуск появится в календаре?',
      'Отпуск отобразится в календаре на следующий день после того, как его согласует ваш непосредственный руководитель.',
    ],
    [
      'Что нужно сделать перед началом отпуска?',
      'За 17 дней до отпуска вам придёт письмо на почту — в нём нужно подтвердить отпуск или перенести его. Это важно, потому что за 10 дней данные передаются в 1С и начинается оформление отпускного документа.',
    ],
  ],
  en: [
    [
      'How many vacation days can I take?',
      'You are entitled to 28 days under the Labour Code and up to 3 additional days depending on your category. Including days carried over, you can plan up to 40 days per year. At least one vacation period during the year must last 14 days or more.',
    ],
    [
      'How do I plan a vacation?',
      'In “My vacation”, open the planning section and select your vacation periods in the calendar. Once all days have been allocated, you can submit the request for approval. You will receive an email when your manager decides. If the periods are approved, acknowledge the decision in Personal Services. If changes are needed, adjust your dates based on your manager’s feedback.',
    ],
    [
      'How do I reschedule a vacation?',
      'In “My vacation”, open the vacation period, choose “Reschedule vacation”, select your new dates and submit them for approval. You can reschedule the same vacation up to two times and no later than 14 days before it begins. The new period must be the same length as the original.',
    ],
    [
      'When will my vacation appear in the calendar?',
      'Your vacation will appear in the calendar on the day after your direct manager approves it.',
    ],
    [
      'What do I need to do before my vacation starts?',
      'You will receive an email 17 days before your vacation asking you to confirm or reschedule it. Ten days before your vacation, the information is sent to 1C and preparation of your vacation paperwork begins.',
    ],
  ],
}

export default function FaqDrawer({ onClose }) {
  return (
    <Drawer
      title={t('Частые вопросы')}
      onClose={onClose}
      focusOnOpen
      actions={[{ label: t('Подробнее об отпусках'), type: 'secondary' }]}
    >
      <ol
        role="list"
        tabIndex={0}
        style={{ display: 'grid', gap: 20, margin: 0, padding: 0, listStyle: 'none', color: COLORS.text }}
      >
        {questions[LOCALE].map(([question, answer], index) => (
          <li key={question} style={{ display: 'grid', gridTemplateColumns: '24px minmax(0, 1fr)', gap: 12 }}>
            <span
              aria-hidden="true"
              style={{ height: 24, borderRadius: '50%', background: COLORS.bg, display: 'grid', placeItems: 'center', fontSize: 14, lineHeight: '20px', fontWeight: 700 }}
            >
              {index + 1}
            </span>
            <div>
              <h2 style={{ margin: '0 0 8px', fontSize: 17, lineHeight: '24px', fontWeight: 500 }}>
                {question}
              </h2>
              <p style={{ margin: 0, fontSize: 14, lineHeight: '20px' }}>{answer}</p>
            </div>
          </li>
        ))}
      </ol>
    </Drawer>
  )
}
