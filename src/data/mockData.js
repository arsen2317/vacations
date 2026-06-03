export const CURRENT_USER = {
  id: 1,
  name: 'Алексей Морозов',
  avatar: '/avatars/mikhail.webp',
  role: 'employee',
  team: 'Продуктовая разработка',
  managerId: 2,
  balanceDays: 18,
  balanceExtra: 3,
}

export const CAMPAIGN = {
  active: true,
  year: 2027,
  totalDays: 28,
}

export const UPCOMING_VACATION = {
  startDate: new Date(2026, 6, 14),
  endDate: new Date(2026, 6, 27),
  status: 'approved',
}

export const MY_REQUESTS = [
  {
    id: 123456,
    type: 'planned',
    typeLabel: 'Плановый',
    typeFullName: 'Ежегодный основной оплачиваемый отпуск',
    planCategory: 'Плановый',
    startDate: new Date(2026, 6, 14),
    endDate: new Date(2026, 6, 27),
    days: 14,
    status: 'pending',
    approver: { name: 'Дмитрий Соколов', role: 'Руководитель' },
    rescheduleCount: 0,
    rescheduleLimit: 2,
  },
  {
    id: 234567,
    type: 'planned',
    typeLabel: 'Плановый',
    typeFullName: 'Ежегодный основной оплачиваемый отпуск',
    planCategory: 'Плановый',
    startDate: new Date(2026, 8, 1),
    endDate: new Date(2026, 8, 14),
    days: 14,
    status: 'reviewing',
    approver: { name: 'Дмитрий Соколов', role: 'Руководитель' },
    rescheduleCount: 0,
    rescheduleLimit: 2,
  },
  {
    id: 345678,
    type: 'planned',
    typeLabel: 'Плановый',
    typeFullName: 'Ежегодный основной оплачиваемый отпуск',
    planCategory: 'Плановый',
    startDate: new Date(2026, 6, 14),
    endDate: new Date(2026, 6, 27),
    days: 14,
    status: 'approved',
    approver: { name: 'Дмитрий Соколов', role: 'Руководитель' },
    rescheduleCount: 1,
    rescheduleLimit: 2,
  },
  {
    id: 456789,
    type: 'unplanned',
    typeLabel: 'Внеплановый — ежегодный оплачиваемый',
    typeFullName: 'Ежегодный основной оплачиваемый отпуск',
    planCategory: 'Внеплановый',
    startDate: new Date(2026, 6, 14),
    endDate: new Date(2026, 6, 27),
    days: 14,
    status: 'rejected',
    rejectionComment: 'Период высокой нагрузки на команду',
    approver: { name: 'Дмитрий Соколов', role: 'Руководитель' },
  },
  {
    id: 567890,
    type: 'unplanned',
    typeLabel: 'Внеплановый — без сохранения зарплаты',
    typeFullName: 'Без сохранения заработной платы',
    planCategory: 'Внеплановый',
    startDate: new Date(2026, 6, 14),
    endDate: new Date(2026, 6, 27),
    days: 14,
    status: 'rejected',
    rejectionComment: 'Период высокой нагрузки на команду',
    approver: { name: 'Дмитрий Соколов', role: 'Руководитемь' },
  },
  {
    id: 678901,
    type: 'unplanned',
    typeLabel: 'Внеплановый — учебный',
    typeFullName: 'Учебный отпуск',
    planCategory: 'Внеплановый',
    startDate: new Date(2026, 6, 14),
    endDate: new Date(2026, 6, 27),
    days: 14,
    status: 'approved',
    approver: { name: 'Дмитрий Соколов', role: 'Руководитель' },
  },
]

export const STATUS_CONFIG = {
  draft:      { label: 'Черновик',          color: 'bg-gray-100 text-gray-600' },
  pending:    { label: 'На согласовании',   color: 'bg-amber-100 text-amber-700' },
  reviewing:  { label: 'На ознакомлении',   color: 'bg-orange-100 text-orange-700' },
  approved:   { label: 'Согласована',       color: 'bg-green-100 text-green-700' },
  rejected:   { label: 'Отклонена',         color: 'bg-red-100 text-red-700' },
  cancelled:  { label: 'Отменена',         color: 'bg-gray-100 text-gray-500' },
}

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

export const COLLEAGUES = [
  {
    id: 1,
    name: 'Алексей Морозов',
    avatar: '/avatars/mikhail.webp',
    me: true,
    team: 'Продуктовая разработка',
    segments: [
      { startDate: '2026-07-14', endDate: '2026-07-27', status: 'approved' },
      { startDate: '2026-09-01', endDate: '2026-09-14', status: 'pending' },
    ],
  },
  {
    id: 2,
    name: 'Дмитрий Соколов',
    avatar: '/avatars/egor.webp',
    team: 'Продуктовая разработка',
    segments: [
      { startDate: '2026-06-01', endDate: '2026-06-14', status: 'approved' },
      { startDate: '2026-10-05', endDate: '2026-10-18', status: 'approved' },
    ],
  },
  {
    id: 3,
    name: 'Мария Иванова',
    avatar: '/avatars/maria.webp',
    team: 'Продуктовая разработка',
    segments: [
      { startDate: '2026-08-04', endDate: '2026-08-17', status: 'reviewing' },
      { startDate: '2026-11-10', endDate: '2026-11-23', status: 'draft' },
    ],
  },
  {
    id: 4,
    name: 'Анна Петрова',
    avatar: '/avatars/sofia.webp',
    team: 'Продуктовая разработка',
    segments: [
      { startDate: '2026-03-02', endDate: '2026-03-15', status: 'approved' },
      { startDate: '2026-07-20', endDate: '2026-08-02', status: 'approved' },
    ],
  },
  {
    id: 5,
    name: 'Игорь Смирнов',
    avatar: '/avatars/manokhin.webp',
    team: 'Дизайн',
    segments: [
      { startDate: '2026-05-25', endDate: '2026-06-07', status: 'approved' },
      { startDate: '2026-08-24', endDate: '2026-09-06', status: 'pending' },
    ],
  },
  {
    id: 6,
    name: 'Сергей Николаев',
    avatar: '/avatars/konstantin.webp',
    team: 'Продуктовая разработка',
    segments: [
      { startDate: '2026-06-15', endDate: '2026-06-28', status: 'approved' },
    ],
  },
  {
    id: 7,
    name: 'Елена Козлова',
    avatar: '/avatars/marina.webp',
    team: 'Продуктовая разработка',
    segments: [
      { startDate: '2026-07-01', endDate: '2026-07-14', status: 'approved' },
      { startDate: '2026-10-12', endDate: '2026-10-25', status: 'approved' },
    ],
  },
]

export const SUBORDINATES = [
  {
    id: 3,
    name: 'Мария Иванова',
    avatar: '/avatars/maria.webp',
    position: 'Frontend-разработчик',
    team: 'Продуктовая разработка',
    planStatus: 'pending',
    distributedDays: 28,
    totalDays: 28,
    segments: [
      { startDate: '2026-08-04', endDate: '2026-08-17', days: 14 },
      { startDate: '2026-11-10', endDate: '2026-11-23', days: 14 },
    ],
  },
  {
    id: 4,
    name: 'Анна Петрова',
    avatar: '/avatars/sofia.webp',
    position: 'Backend-разработчик',
    team: 'Продуктовая разработка',
    planStatus: 'pending',
    distributedDays: 28,
    totalDays: 28,
    segments: [
      { startDate: '2026-03-02', endDate: '2026-03-15', days: 14 },
      { startDate: '2026-07-20', endDate: '2026-08-02', days: 14 },
    ],
  },
  {
    id: 6,
    name: 'Сергей Николаев',
    avatar: '/avatars/konstantin.webp',
    position: 'QA-инженер',
    team: 'Продуктовая разработка',
    planStatus: 'draft',
    distributedDays: 14,
    totalDays: 28,
    segments: [
      { startDate: '2026-06-15', endDate: '2026-06-28', days: 14 },
    ],
  },
  {
    id: 7,
    name: 'Елена Козлова',
    position: 'Аналитик',
    team: 'Продуктовая разработка',
    planStatus: 'approved',
    distributedDays: 28,
    totalDays: 28,
    segments: [
      { startDate: '2026-07-01', endDate: '2026-07-14', days: 14 },
      { startDate: '2026-10-12', endDate: '2026-10-25', days: 14 },
    ],
  },
  {
    id: 5,
    name: 'Игорь Смирнов',
    avatar: '/avatars/manokhin.webp',
    position: 'UI/UX-дизайнер',
    team: 'Дизайн',
    planStatus: 'approved',
    distributedDays: 28,
    totalDays: 28,
    segments: [
      { startDate: '2026-05-25', endDate: '2026-06-07', days: 14 },
      { startDate: '2026-08-24', endDate: '2026-09-06', days: 14 },
    ],
  },
  {
    id: 8,
    name: 'Ольга Васильева',
    avatar: '/avatars/olga.webp',
    position: 'Графический дизайнер',
    team: 'Дизайн',
    planStatus: 'pending',
    distributedDays: 28,
    totalDays: 28,
    segments: [
      { startDate: '2026-06-22', endDate: '2026-07-05', days: 14 },
      { startDate: '2026-09-14', endDate: '2026-09-27', days: 14 },
    ],
  },
]

export const ALL_EMPLOYEES = [
  { id: 1,  name: 'Алексей Морозов',  avatar: '/avatars/mikhail.webp',    team: 'Продуктовая разработка', planStatus: 'approved' },
  { id: 2,  name: 'Дмитрий Соколов',  avatar: '/avatars/egor.webp',       team: 'Продуктовая разработка', planStatus: 'approved' },
  { id: 3,  name: 'Мария Иванова',    avatar: '/avatars/maria.webp',      team: 'Продуктовая разработка', planStatus: 'pending'  },
  { id: 4,  name: 'Анна Петрова',     avatar: '/avatars/sofia.webp',      team: 'Продуктовая разработка', planStatus: 'pending'  },
  { id: 6,  name: 'Сергей Николаев',  avatar: '/avatars/konstantin.webp', team: 'Продуктовая разработка', planStatus: 'draft'    },
  { id: 7,  name: 'Елена Козлова',    avatar: '/avatars/marina.webp',     team: 'Продуктовая разработка', planStatus: 'approved' },
  { id: 5,  name: 'Игорь Смирнов',   avatar: '/avatars/manokhin.webp',   team: 'Дизайн',                  planStatus: 'approved' },
  { id: 8,  name: 'Ольга Васильева',  avatar: '/avatars/olga.webp',       team: 'Дизайн',                  planStatus: 'draft'    },
  { id: 9,  name: 'Павел Морозов',    avatar: '/avatars/gavrilov.webp',   team: 'HR',                      planStatus: 'approved' },
  { id: 10, name: 'Ирина Лебедева',   avatar: '/avatars/irina.webp',      team: 'HR',                      planStatus: 'pending'  },
]
