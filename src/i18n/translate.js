import { LOCALE } from './locale'

const T = {
  // Shell / navigation
  'Отпуск': 'Vacation',
  'главная': 'Home',
  'отпуск': 'Vacation',
  'уведомления раздела': 'Notifications',
  'Мой отпуск': 'My vacation',
  'Планы коллег': "Colleagues' plans",

  // Status labels (StatusBadge components)
  'Черновик': 'Draft',
  'На согласовании': 'Pending approval',
  'Согласование переноса': 'Reschedule pending',
  'Ознакомление': 'Acknowledgement',
  'Согласован': 'Approved',
  'Отклонена': 'Rejected',
  'Отменена': 'Cancelled',
  'Запланировано': 'Planned',
  'Активно': 'Active',
  'Завершено': 'Completed',

  // Common
  'Ежегодный основной оплачиваемый': 'Annual paid leave',
  'Руководитель': 'Manager',
  'Период высокой нагрузки на команду': 'High team workload period',

  // Employee dashboard
  'Основной отпуск': 'Main vacation',
  'Дополнительный отпуск': 'Additional vacation',
  'Мои отпуска': 'My vacations',
  'Для создания заявки выделите период, выбирая даты прямо в календаре.':
    'To create a request, select a period by choosing dates directly in the calendar.',
  'Пересечения': 'Overlaps',
  'отметка пересечений': 'overlap marker',
  'Добавить сотрудника': 'Add employee',
  '2027 – планирование': '2027 – planning',
  'Распределено': 'Distributed',
  'Периоды отпуска': 'Vacation periods',
  'Для создания плана на отпуск начните выделять периоды, выбирая даты прямо в календаре. Условия, которые необходимо выполнить, чтобы отправить план на согласование:':
    'To create a vacation plan, start selecting periods by choosing dates directly in the calendar. Conditions that must be met to submit the plan for approval:',
  'Один из периодов отпуска должен быть не меньше 14 дней': 'One of the vacation periods must be at least 14 days',
  'Необходимо распределить минимум 28 дней отпуска. Максимум – 40 дней отпуска.':
    'A minimum of 28 vacation days must be distributed. Maximum – 40 days.',
  'Плановый отпуск': 'Planned vacation',
  'отправить на согласование': 'submit for approval',
  'накопленный': 'accumulated',
  'из': 'of',

  // Toasts
  'Выбранный период пересекается с существующим': 'The selected period overlaps with an existing one',
  'У вас больше нет доступных дней отпуска': 'You have no more available vacation days',
  'Выбранный период превышает остаток дней отпуска': 'The selected period exceeds your remaining vacation days',
  'Заявка направлена на согласование': 'Request sent for approval',

  // Colleagues page
  'Поиск по сотрудникам': 'Search employees',
  'Показывать черновики': 'Show drafts',
  'Год': 'Year',
  'Месяц': 'Month',
  'Нет сотрудников для отображения': 'No employees to display',
  'черновик': 'draft',
  'на согласовании': 'pending approval',
  'согласован': 'approved',
  'ознакомление': 'acknowledgement',
  'пересечения': 'overlaps',
  'пересечения с коллегами': 'overlaps with colleagues',
  'пересекается: ': 'overlaps: ',
  'Сотрудник': 'Employee',
  ' (вы)': ' (you)',

  // RequestModal
  'Перенести плановый отпуск': 'Reschedule planned vacation',
  'Отправить на согласование': 'Send for approval',
  'Заявка на перенос планового отпуска': 'Request to reschedule planned vacation',
  'Внеплановый отпуск': 'Unplanned vacation',
  'Тип отпуска': 'Vacation type',
  'Старый период': 'Old period',
  'Новый период': 'New period',
  'Количество дней отпуска': 'Number of vacation days',
  'Период': 'Period',
  'Доступно переносов': 'Reschedules available',
  'Причина отклонения': 'Rejection reason',
  'До начала отпуска осталось менее 10 дней — перенос недоступен':
    'Less than 10 days left until the vacation starts — reschedule unavailable',
  'Согласующий': 'Approver',
  'Дополнительный согласующий': 'Additional approver',
  'ПЕРЕНЕСТИ ОТПУСК': 'RESCHEDULE VACATION',
  'ОТОЗВАТЬ ЗАЯВКУ': 'WITHDRAW REQUEST',
  'ОТМЕНИТЬ ОТПУСК': 'CANCEL VACATION',
  'Заявка отозвана': 'Request withdrawn',
  'Отпуск отменён': 'Vacation cancelled',
  'Заявка на перенос отозвана': 'Reschedule request withdrawn',
  'Заявка на перенос направлена': 'Reschedule request sent',
  'Перенос планового отпуска': 'Reschedule of planned vacation',

  // NewRequestModal
  'Отпуск без сохранения з.п.': 'Unpaid leave',
  'Учебный оплачиваемый': 'Paid study leave',
  'Учебный без сохранения з.п.': 'Unpaid study leave',
  'Не списывается из баланса': 'Not deducted from balance',
  'Заявка на внеплановый отпуск': 'Unplanned vacation request',
  'дд.мм.гггг – дд.мм.гггг': 'dd.mm.yyyy – dd.mm.yyyy',
  'Введите комментарий': 'Enter a comment',
  'Необязательно': 'Optional',
  'Добавить дополнительного согласующего': 'Add an additional approver',
  'Выберите тип отпуска': 'Select vacation type',
  'Заместитель': 'Substitute',
  'Добавьте заместителя': 'Add a substitute',
  'Комментарий': 'Comment',
  'До 255 символов': 'Up to 255 characters',
  'Выберите согласующего': 'Select an approver',
  'ОТПРАВИТЬ НА СОГЛАСОВАНИЕ': 'SEND FOR APPROVAL',
  'отпуска (праздники не считаются)': 'vacation (holidays not counted)',

  // PlanSubmitModal
  'Планы на отпуск 2027': '2027 vacation plans',
  'Добавьте дополнительного согласующего': 'Add an additional approver',
  'СОЗДАТЬ ЗАЯВКИ': 'CREATE REQUESTS',
  'ОТМЕНА': 'CANCEL',

  // VacationCalculatorModal
  'Калькулятор отпуска': 'Vacation calculator',
  'Текущий остаток': 'Current balance',
  'Рассчитать на дату': 'Calculate for date',
  'Выберите дату': 'Select a date',
  'Дата должна быть позже сегодняшней': 'The date must be later than today',
  'К выбранной дате накопится': 'By the selected date you will accumulate',
  'Закрыть': 'Close',

  // CalendarRange / CalendarSingle / YearCalendar / Select
  'Применить': 'Apply',
  'Дней отпуска:': 'Vacation days:',
  'Сбросить': 'Reset',
  'Отпуска коллег': "Colleagues' vacations",
  'Начните вводить имя…': 'Start typing a name…',
  'Ничего не найдено': 'Nothing found',
  'Нет вариантов': 'No options',
  'СБРОСИТЬ': 'RESET',
  'ПРИМЕНИТЬ': 'APPLY',

  // RequestModal / NewRequestModal / PlanSubmitModal / VacationCalculatorModal — extra fragments & templates
  'Плановый': 'Planned',
  'Период отпуска пересекается с': 'The vacation period overlaps with',
  'Количество дней нового периода должно совпадать с текущим —': 'The number of days in the new period must match the current one —',
  'Укажите период': 'Specify a period',
  'Недостаточно дней: нужно': 'Not enough days: need',
  ', доступно': ', available',
  'За счёт накопленного ежегодного основного оплачиваемого отпуска:': 'From accumulated annual paid leave:',
  'отпуска': 'of vacation',
  'Расчёт ведётся от текущего остатка отпуска. За каждый полный месяц начисляется {n} календарных дня.':
    'The calculation is based on your current vacation balance. For each full month, {n} calendar days are accrued.',
  'сейчас +': 'now +',
  'накопится за': 'will accrue over',

  // ManagerPage
  'Входящие заявки': 'Incoming requests',
  'отклонён': 'rejected',
  'Нет заявок для отображения': 'No requests to display',
  'Заявка на плановый отпуск': 'Planned vacation request',
  'Согласовать': 'Approve',
  'Отклонить': 'Reject',
  'СОГЛАСОВАТЬ': 'APPROVE',
  'ОТКЛОНИТЬ': 'REJECT',
  'Отклонить заявку': 'Reject request',
  'Укажите причину отклонения': 'Please specify a rejection reason',
  'Отмена': 'Cancel',
  'Статистика по кампании': 'Campaign statistics',
  'Скачайте подробный отчет по планированию отпусков ваших сотрудников.':
    'Download a detailed report on your employees’ vacation planning.',
  'Подано заявок': 'Requests submitted',
  'Согласованы': 'Approved',
  'Не создан план отпуска': 'No vacation plan created',
  'СКАЧАТЬ ОТЧЁТ': 'DOWNLOAD REPORT',
  'Таблица': 'Table',
  'График': 'Chart',
  'Все подразделения': 'All departments',
  'Все заявки': 'All requests',
  'Все годы': 'All years',
  'Скачать отчёт': 'Download report',
  '№ заявки': 'Request No.',
  'Подразделение': 'Department',
  'Должность': 'Position',
  'Период отпуска': 'Vacation period',
  'Статус': 'Status',
  'Действия': 'Actions',
  'Нет заявок': 'No requests',
  'Заявка согласована': 'Request approved',
  'Заявка отклонена': 'Request rejected',
}

export function t(ru) {
  if (LOCALE !== 'en') return ru
  return T[ru] ?? ru
}

export const MONTH_NAMES = LOCALE === 'en'
  ? ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  : ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь']

export const MONTH_GEN = LOCALE === 'en'
  ? MONTH_NAMES
  : ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря']

export const MONTHS_SHORT = LOCALE === 'en'
  ? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  : ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек']

// Lowercase two-letter weekday abbreviations (calendar headers)
export const WEEKDAYS = LOCALE === 'en'
  ? ['mo', 'tu', 'we', 'th', 'fr', 'sa', 'su']
  : ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс']

// Capitalized weekday abbreviations
export const WD = LOCALE === 'en'
  ? ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']
  : ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

export function pluralDays(n) {
  if (LOCALE === 'en') return n === 1 ? 'day' : 'days'
  const mod10 = n % 10, mod100 = n % 100
  if (mod100 >= 11 && mod100 <= 14) return 'дней'
  if (mod10 === 1) return 'день'
  if (mod10 >= 2 && mod10 <= 4) return 'дня'
  return 'дней'
}

export function pluralMonths(n) {
  if (LOCALE === 'en') return n === 1 ? 'month' : 'months'
  if (n % 10 === 1 && n % 100 !== 11) return 'месяц'
  if (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)) return 'месяца'
  return 'месяцев'
}

const NAME_MAP = {
  'Алексей Морозов': 'Alexey Morozov',
  'Дмитрий Соколов': 'Dmitry Sokolov',
  'Мария Иванова': 'Maria Ivanova',
  'Анна Петрова': 'Anna Petrova',
  'Игорь Смирнов': 'Igor Smirnov',
  'Сергей Николаев': 'Sergey Nikolaev',
  'Елена Козлова': 'Elena Kozlova',
  'Ольга Васильева': 'Olga Vasilyeva',
  'Павел Морозов': 'Pavel Morozov',
  'Ирина Лебедева': 'Irina Lebedeva',
  // "Surname FirstName Patronymic" variants from ALL_EMPLOYEES
  'Иванова Мария Сергеевна': 'Maria Ivanova',
  'Петрова Анна Дмитриевна': 'Anna Petrova',
  'Николаев Сергей Олегович': 'Sergey Nikolaev',
  'Козлова Елена Александровна': 'Elena Kozlova',
  'Смирнов Игорь Павлович': 'Igor Smirnov',
  'Васильева Ольга Николаевна': 'Olga Vasilyeva',
}

export function tName(name) {
  if (LOCALE !== 'en' || !name) return name
  return NAME_MAP[name] ?? name
}

const TEAM_MAP = {
  'Продуктовая разработка': 'Product Development',
  'Дизайн': 'Design',
  'HR': 'HR',
}

export function tTeam(team) {
  if (LOCALE !== 'en' || !team) return team
  return TEAM_MAP[team] ?? team
}

const POSITION_MAP = {
  'Frontend-разработчик': 'Frontend Developer',
  'Backend-разработчик': 'Backend Developer',
  'QA-инженер': 'QA Engineer',
  'Аналитик': 'Analyst',
  'UI/UX-дизайнер': 'UI/UX Designer',
  'Графический дизайнер': 'Graphic Designer',
}

export function tPosition(position) {
  if (LOCALE !== 'en' || !position) return position
  return POSITION_MAP[position] ?? position
}
