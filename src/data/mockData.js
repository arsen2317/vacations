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
    approver: { name: 'Дмитрий Соколов', role: 'Руководитель' },
    rescheduleCount: 0,
    rescheduleLimit: 2,
  },
  {
    id: 2,
    type: 'planned',
    typeLabel: 'Плановый',
    startDate: new Date(2026, 8, 1),
    endDate: new Date(2026, 8, 14),
    days: 14,
    status: 'approved',
    approver: { name: 'Дмитрий Соколов', role: 'Руководитель' },
    rescheduleCount: 1,
    rescheduleLimit: 2,
  },
  {
    id: 3,
    type: 'unplanned',
    typeLabel: 'Внеплановый — ежегодный оплачиваемый',
    startDate: new Date(2026, 11, 22),
    endDate: new Date(2026, 11, 26),
    days: 5,
    status: 'pending',
    approver: { name: 'Дмитрий Соколов', role: 'Руководитель' },
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
    approver: { name: 'Дмитрий Соколов', role: 'Руководитель' },
  },
  {
    id: 5,
    type: 'planned',
    typeLabel: 'Плановый',
    startDate: new Date(2025, 4, 5),
    endDate: new Date(2025, 4, 18),
    days: 14,
    status: 'approved',
    approver: { name: 'Дмитрий Соколов', role: 'Руководитель' },
    rescheduleCount: 0,
    rescheduleLimit: 2,
  },
]

export const STATUS_CONFIG = {
  draft:      { label: 'Черновик',          color: 'bg-gray-100 text-gray-600' },
  pending:    { label: 'На согласовании',   color: 'bg-amber-100 text-amber-700' },
  reviewing:  { label: 'На ознакомлении',   color: 'bg-orange-100 text-orange-700' },
  approved:   { label: 'Согласована',       color: 'bg-green-100 text-green-700' },
  rejected:   { label: 'Отклонена',         color: 'bg-red-100 text-red-700' },
  cancelled:  { label: 'Отменена',          color: 'bg-gray-100 text-gray-500' },
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
    team: 'Продуктовая разработка',
    segments: [
      { startDate: '2026-06-01', endDate: '2026-06-14', status: 'approved' },
      { startDate: '2026-10-05', endDate: '2026-10-18', status: 'approved' },
    ],
  },
  {
    id: 3,
    name: 'Мария Иванова',
    team: 'Продуктовая разработка',
    segments: [
      { startDate: '2026-08-04', endDate: '2026-08-17', status: 'reviewing' },
      { startDate: '2026-11-10', endDate: '2026-11-23', status: 'draft' },
    ],
  },
  {
    id: 4,
    name: 'Анна Петрова',
    team: 'Продуктовая разработка',
    segments: [
      { startDate: '2026-03-02', endDate: '2026-03-15', status: 'approved' },
      { startDate: '2026-07-20', endDate: '2026-08-02', status: 'approved' },
    ],
  },
  {
    id: 5,
    name: 'Игорь Смирнов',
    team: 'Дизайн',
    segments: [
      { startDate: '2026-05-25', endDate: '2026-06-07', status: 'approved' },
      { startDate: '2026-08-24', endDate: '2026-09-06', status: 'pending' },
    ],
  },
  {
    id: 6,
    name: 'Сергей Николаев',
    team: 'Продуктовая разработка',
    segments: [
      { startDate: '2026-06-15', endDate: '2026-06-28', status: 'approved' },
    ],
  },
  {
    id: 7,
    name: 'Елена Козлова',
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
    position: 'Frontend-разработчик',
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
    position: 'Backend-разработчик',
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
    position: 'QA-инженер',
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
    planStatus: 'approved',
    distributedDays: 28,
    totalDays: 28,
    segments: [
      { startDate: '2026-07-01', endDate: '2026-07-14', days: 14 },
      { startDate: '2026-10-12', endDate: '2026-10-25', days: 14 },
    ],
  },
]

export const ALL_EMPLOYEES = [
  { id: 1,  name: 'Алексей Морозов',  team: 'Продуктовая разработка', planStatus: 'approved' },
  { id: 2,  name: 'Дмитрий Соколов',  team: 'Продуктовая разработка', planStatus: 'approved' },
  { id: 3,  name: 'Мария Иванова',    team: 'Продуктовая разработка', planStatus: 'pending'  },
  { id: 4,  name: 'Анна Петрова',     team: 'Продуктовая разработка', planStatus: 'pending'  },
  { id: 6,  name: 'Сергей Николаев',  team: 'Продуктовая разработка', planStatus: 'draft'    },
  { id: 7,  name: 'Елена Козлова',    team: 'Продуктовая разработка', planStatus: 'approved' },
  { id: 5,  name: 'Игорь Смирнов',   team: 'Дизайн',                  planStatus: 'approved' },
  { id: 8,  name: 'Ольга Васильева',  team: 'Дизайн',                  planStatus: 'draft'    },
  { id: 9,  name: 'Павел Морозов',    team: 'HR',                      planStatus: 'approved' },
  { id: 10, name: 'Ирина Лебедева',   team: 'HR',                      planStatus: 'pending'  },
]
