export const CURRENT_USER = {
  id: 1,
  name: 'Алексей Морозов',
  role: 'employee',
  team: 'Продуктовая разработка',
  managerId: 2,
  balanceDays: 18,
  balanceExtra: 3,
}

export const CAMPAIGN = {
  active: true,
  year: 2026,
  totalDays: 28,
}

export const UPCOMING_VACATION = {
  startDate: new Date(2026, 6, 14),
  endDate: new Date(2026, 6, 27),
  status: 'approved',
}

export const MY_REQUESTS = [
  {
    id: 1,
    type: 'planned',
    typeLabel: 'Плановый',
    startDate: new Date(2026, 6, 14),
    endDate: new Date(2026, 6, 27),
    days: 14,
    status: 'approved',
  },
  {
    id: 2,
    type: 'planned',
    typeLabel: 'Плановый',
    startDate: new Date(2026, 8, 1),
    endDate: new Date(2026, 8, 14),
    days: 14,
    status: 'approved',
  },
  {
    id: 3,
    type: 'unplanned',
    typeLabel: 'Внеплановый — ежегодный оплачиваемый',
    startDate: new Date(2026, 11, 22),
    endDate: new Date(2026, 11, 26),
    days: 5,
    status: 'pending',
  },
  {
    id: 4,
    type: 'unplanned',
    typeLabel: 'Внеплановый — без сохранения зарплаты',
    startDate: new Date(2025, 9, 3),
    endDate: new Date(2025, 9, 5),
    days: 3,
    status: 'rejected',
    rejectionComment: 'Период высокой нагрузки на команду',
  },
  {
    id: 5,
    type: 'planned',
    typeLabel: 'Плановый',
    startDate: new Date(2025, 4, 5),
    endDate: new Date(2025, 4, 18),
    days: 14,
    status: 'approved',
  },
]

export const STATUS_CONFIG = {
  draft:     { label: 'Черновик',        color: 'bg-gray-100 text-gray-600' },
  pending:   { label: 'На согласовании', color: 'bg-amber-100 text-amber-700' },
  approved:  { label: 'Согласована',     color: 'bg-green-100 text-green-700' },
  rejected:  { label: 'Отклонена',       color: 'bg-red-100 text-red-700' },
  cancelled: { label: 'Отменена',        color: 'bg-gray-100 text-gray-500' },
}

export const COLLEAGUES = [
  {
    id: 1,
    name: 'Алексей Морозов',
    initials: 'АМ',
    colorClass: 'bg-indigo-400',
    isSelf: true,
    segments: [
      { startDate: '2026-07-14', endDate: '2026-07-27' },
      { startDate: '2026-09-01', endDate: '2026-09-14' },
    ],
  },
  {
    id: 2,
    name: 'Мария Соколова',
    initials: 'МС',
    colorClass: 'bg-pink-400',
    isSelf: false,
    segments: [
      { startDate: '2026-06-08', endDate: '2026-06-21' },
      { startDate: '2026-11-02', endDate: '2026-11-15' },
    ],
  },
  {
    id: 3,
    name: 'Дмитрий Козлов',
    initials: 'ДК',
    colorClass: 'bg-emerald-400',
    isSelf: false,
    segments: [
      { startDate: '2026-07-20', endDate: '2026-08-09' },
    ],
  },
  {
    id: 4,
    name: 'Анна Петрова',
    initials: 'АП',
    colorClass: 'bg-amber-400',
    isSelf: false,
    segments: [
      { startDate: '2026-03-09', endDate: '2026-03-22' },
      { startDate: '2026-08-03', endDate: '2026-08-16' },
    ],
  },
  {
    id: 5,
    name: 'Сергей Новиков',
    initials: 'СН',
    colorClass: 'bg-violet-400',
    isSelf: false,
    segments: [
      { startDate: '2026-05-04', endDate: '2026-05-17' },
      { startDate: '2026-10-12', endDate: '2026-10-25' },
    ],
  },
  {
    id: 6,
    name: 'Екатерина Волкова',
    initials: 'ЕВ',
    colorClass: 'bg-rose-400',
    isSelf: false,
    segments: [
      { startDate: '2026-07-27', endDate: '2026-08-09' },
    ],
  },
]

export const SUBORDINATES = [
  {
    id: 2,
    name: 'Мария Соколова',
    initials: 'МС',
    colorClass: 'bg-pink-400',
    planStatus: 'approved',
    rejectComment: null,
    segments: [
      { startDate: '2026-06-08', endDate: '2026-06-21', days: 14 },
      { startDate: '2026-11-02', endDate: '2026-11-15', days: 14 },
    ],
  },
  {
    id: 3,
    name: 'Дмитрий Козлов',
    initials: 'ДК',
    colorClass: 'bg-emerald-400',
    planStatus: 'pending',
    rejectComment: null,
    segments: [
      { startDate: '2026-07-20', endDate: '2026-08-09', days: 21 },
      { startDate: '2026-12-01', endDate: '2026-12-07', days: 7 },
    ],
  },
  {
    id: 4,
    name: 'Анна Петрова',
    initials: 'АП',
    colorClass: 'bg-amber-400',
    planStatus: 'pending',
    rejectComment: null,
    segments: [
      { startDate: '2026-03-09', endDate: '2026-03-22', days: 14 },
      { startDate: '2026-08-03', endDate: '2026-08-16', days: 14 },
    ],
  },
  {
    id: 5,
    name: 'Сергей Новиков',
    initials: 'СН',
    colorClass: 'bg-violet-400',
    planStatus: 'draft',
    rejectComment: null,
    segments: [
      { startDate: '2026-05-04', endDate: '2026-05-17', days: 14 },
    ],
  },
  {
    id: 6,
    name: 'Екатерина Волкова',
    initials: 'ЕВ',
    colorClass: 'bg-rose-400',
    planStatus: 'draft',
    rejectComment: null,
    segments: [],
  },
]

export const ALL_EMPLOYEES = [
  { id: 1,  name: 'Алексей Морозов',   team: 'Продуктовая разработка', planStatus: 'approved' },
  { id: 2,  name: 'Мария Соколова',    team: 'Продуктовая разработка', planStatus: 'approved' },
  { id: 3,  name: 'Дмитрий Козлов',    team: 'Продуктовая разработка', planStatus: 'pending'  },
  { id: 4,  name: 'Анна Петрова',      team: 'Продуктовая разработка', planStatus: 'pending'  },
  { id: 5,  name: 'Сергей Новиков',    team: 'Продуктовая разработка', planStatus: 'draft'    },
  { id: 6,  name: 'Екатерина Волкова', team: 'Продуктовая разработка', planStatus: 'draft'    },
  { id: 7,  name: 'Игорь Смирнов',     team: 'Дизайн',                 planStatus: 'approved' },
  { id: 8,  name: 'Ольга Кузнецова',   team: 'Дизайн',                 planStatus: 'approved' },
  { id: 9,  name: 'Павел Попов',       team: 'Аналитика',              planStatus: 'pending'  },
  { id: 10, name: 'Наталья Лебедева',  team: 'Аналитика',              planStatus: null       },
  { id: 11, name: 'Роман Зайцев',      team: 'Backend',                planStatus: 'approved' },
  { id: 12, name: 'Валерия Морозова',  team: 'Backend',                planStatus: 'draft'    },
  { id: 13, name: 'Андрей Николаев',   team: 'Backend',                planStatus: null       },
  { id: 14, name: 'Тамара Орлова',     team: 'QA',                     planStatus: 'approved' },
  { id: 15, name: 'Владимир Фёдоров',  team: 'QA',                     planStatus: null       },
]

export const HOLIDAYS_2026 = new Set([
  '2026-01-01', '2026-01-02', '2026-01-03', '2026-01-04', '2026-01-05',
  '2026-01-06', '2026-01-07', '2026-01-08',
  '2026-02-23',
  '2026-03-09',
  '2026-05-01',
  '2026-05-11',
  '2026-06-12',
  '2026-11-04',
])

export const INITIAL_SEGMENTS = [
  {
    id: 1,
    startDate: '2026-07-14',
    endDate: '2026-07-27',
    days: 14,
  },
]

// Pre-approved segments used for the "Согласован" demo state
export const APPROVED_SEGMENTS = [
  {
    id: 101,
    startDate: '2026-07-14',
    endDate: '2026-07-27',
    days: 14,
  },
  {
    id: 102,
    startDate: '2026-09-01',
    endDate: '2026-09-14',
    days: 14,
  },
]
