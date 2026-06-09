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
  // Плановые — 28 дней суммарно, согласованы
  {
    id: 101,
    type: 'planned',
    typeLabel: 'Ежегодный основной оплачиваемый',
    planCategory: 'Плановый',
    startDate: new Date(2026, 2, 9),   // 9 марта
    endDate:   new Date(2026, 2, 22),  // 22 марта
    days: 14,
    status: 'approved',
    approver: { name: 'Дмитрий Соколов', role: 'Руководитель' },
    rescheduleCount: 0,
    rescheduleLimit: 2,
  },
  {
    id: 102,
    type: 'planned',
    typeLabel: 'Ежегодный основной оплачиваемый',
    planCategory: 'Плановый',
    startDate: new Date(2026, 7, 3),   // 3 августа
    endDate:   new Date(2026, 7, 12),  // 12 августа
    days: 10,
    status: 'approved',
    approver: { name: 'Дмитрий Соколов', role: 'Руководитель' },
    rescheduleCount: 0,
    rescheduleLimit: 2,
  },
  {
    id: 103,
    type: 'planned',
    typeLabel: 'Ежегодный основной оплачиваемый',
    planCategory: 'Плановый',
    startDate: new Date(2026, 10, 2),  // 2 ноября
    endDate:   new Date(2026, 10, 5),  // 5 ноября
    days: 4,
    status: 'approved',
    approver: { name: 'Дмитрий Соколов', role: 'Руководитель' },
    rescheduleCount: 0,
    rescheduleLimit: 2,
  },
  // Внеплановый — на согласовании
  {
    id: 201,
    type: 'unplanned',
    typeLabel: 'Ежегодный основной оплачиваемый',
    planCategory: 'Внеплановый',
    startDate: new Date(2026, 5, 15),  // 15 июня
    endDate:   new Date(2026, 5, 19),  // 19 июня
    days: 5,
    status: 'pending',
    approver: { name: 'Дмитрий Соколов', role: 'Руководитель' },
  },
  // Внеплановый — отклонён
  {
    id: 202,
    type: 'unplanned',
    typeLabel: 'Ежегодный основной оплачиваемый',
    planCategory: 'Внеплановый',
    startDate: new Date(2026, 3, 20),  // 20 апреля
    endDate:   new Date(2026, 3, 24),  // 24 апреля
    days: 5,
    status: 'rejected',
    rejectionComment: 'Период высокой нагрузки на команду',
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

export const HOLIDAYS_2027 = new Set([
  '2027-01-01', '2027-01-04', '2027-01-05', '2027-01-06', '2027-01-07', '2027-01-08',
  '2027-02-22', '2027-02-23',
  '2027-03-08',
  '2027-05-03', '2027-05-10',
  '2027-06-14',
  '2027-11-04', '2027-11-05',
  '2027-12-31',
])

export const INITIAL_SEGMENTS = []

export const APPROVED_SEGMENTS = [
  {
    id: 101,
    startDate: '2027-07-14',
    endDate: '2027-07-27',
    days: 14,
  },
  {
    id: 102,
    startDate: '2027-09-01',
    endDate: '2027-09-14',
    days: 14,
  },
]

export const COLLEAGUES = [
  {
    id: 1,
    name: 'Алексей Морозов',
    patronymic: 'Викторович',
    avatar: '/avatars/mikhail.webp',
    me: true,
    team: 'Продуктовая разработка',
    segments: [
      { startDate: '2026-07-14', endDate: '2026-07-27', status: 'approved' },
      { startDate: '2026-09-01', endDate: '2026-09-14', status: 'approved' },
    ],
  },
  {
    id: 2,
    name: 'Дмитрий Соколов',
    patronymic: 'Андреевич',
    avatar: '/avatars/egor.webp',
    team: 'Продуктовая разработка',
    segments: [
      { startDate: '2026-06-01', endDate: '2026-06-14', status: 'approved' },
      { startDate: '2026-10-05', endDate: '2026-10-18', status: 'approved' },
      { startDate: '2027-03-08', endDate: '2027-03-21', status: 'approved' },
      { startDate: '2027-08-02', endDate: '2027-08-15', status: 'pending' },
    ],
  },
  {
    id: 3,
    name: 'Мария Иванова',
    patronymic: 'Сергеевна',
    avatar: '/avatars/maria.webp',
    team: 'Продуктовая разработка',
    segments: [
      { startDate: '2026-08-04', endDate: '2026-08-17', status: 'approved' },
      { startDate: '2026-11-10', endDate: '2026-11-23', status: 'approved' },
      { startDate: '2027-02-01', endDate: '2027-02-14', status: 'draft' },
      { startDate: '2027-06-07', endDate: '2027-06-20', status: 'approved' },
    ],
  },
  {
    id: 4,
    name: 'Анна Петрова',
    patronymic: 'Дмитриевна',
    avatar: '/avatars/sofia.webp',
    team: 'Продуктовая разработка',
    segments: [
      { startDate: '2026-03-02', endDate: '2026-03-15', status: 'approved' },
      { startDate: '2026-07-20', endDate: '2026-08-02', status: 'approved' },
      { startDate: '2027-04-05', endDate: '2027-04-18', status: 'pending' },
      { startDate: '2027-10-04', endDate: '2027-10-17', status: 'approved' },
    ],
  },
  {
    id: 5,
    name: 'Игорь Смирнов',
    patronymic: 'Владимирович',
    avatar: '/avatars/manokhin.webp',
    team: 'Дизайн',
    segments: [
      { startDate: '2026-05-25', endDate: '2026-06-07', status: 'approved' },
      { startDate: '2026-08-24', endDate: '2026-09-06', status: 'approved' },
      { startDate: '2027-03-22', endDate: '2027-04-04', status: 'approved' },
      { startDate: '2027-09-13', endDate: '2027-09-26', status: 'draft' },
    ],
  },
  {
    id: 6,
    name: 'Сергей Николаев',
    patronymic: 'Павлович',
    avatar: '/avatars/konstantin.webp',
    team: 'Продуктовая разработка',
    segments: [
      { startDate: '2026-06-15', endDate: '2026-06-28', status: 'approved' },
      { startDate: '2027-01-18', endDate: '2027-01-31', status: 'draft' },
      { startDate: '2027-07-05', endDate: '2027-07-18', status: 'pending' },
    ],
  },
  {
    id: 7,
    name: 'Елена Козлова',
    patronymic: 'Игоревна',
    avatar: '/avatars/marina.webp',
    team: 'Продуктовая разработка',
    segments: [
      { startDate: '2026-07-01', endDate: '2026-07-14', status: 'approved' },
      { startDate: '2026-10-12', endDate: '2026-10-25', status: 'approved' },
      { startDate: '2027-05-17', endDate: '2027-05-30', status: 'approved' },
      { startDate: '2027-11-08', endDate: '2027-11-21', status: 'pending' },
    ],
  },
]

export const SUBORDINATES = [
  {
    id: 3,
    name: 'Иванова Мария Сергеевна',
    avatar: '/avatars/maria.webp',
    position: 'Frontend-разработчик',
    team: 'Продуктовая разработка',
    planStatus: 'pending',
    distributedDays: 28,
    totalDays: 28,
    segments: [
      { startDate: '2026-08-04', endDate: '2026-08-17', days: 14, status: 'approved' },
      { startDate: '2026-11-10', endDate: '2026-11-23', days: 14, status: 'approved' },
      { startDate: '2027-03-10', endDate: '2027-03-23', days: 14, status: 'pending' },
    ],
  },
  {
    id: 4,
    name: 'Петрова Анна Дмитриевна',
    avatar: '/avatars/sofia.webp',
    position: 'Backend-разработчик',
    team: 'Продуктовая разработка',
    planStatus: 'pending',
    distributedDays: 28,
    totalDays: 28,
    segments: [
      { startDate: '2026-03-02', endDate: '2026-03-15', days: 14, status: 'approved' },
      { startDate: '2026-07-20', endDate: '2026-08-02', days: 14, status: 'approved' },
      { startDate: '2027-03-17', endDate: '2027-03-30', days: 14, status: 'pending' },
    ],
  },
  {
    id: 6,
    name: 'Николаев Сергей Олегович',
    avatar: '/avatars/konstantin.webp',
    position: 'QA-инженер',
    team: 'Продуктовая разработка',
    planStatus: 'pending',
    distributedDays: 28,
    totalDays: 28,
    segments: [
      { startDate: '2026-06-15', endDate: '2026-06-28', days: 14, status: 'approved' },
      { startDate: '2027-07-01', endDate: '2027-07-14', days: 14, status: 'pending' },
    ],
  },
  {
    id: 7,
    name: 'Козлова Елена Александровна',
    avatar: '/avatars/marina.webp',
    position: 'Аналитик',
    team: 'Продуктовая разработка',
    planStatus: 'pending',
    distributedDays: 28,
    totalDays: 28,
    segments: [
      { startDate: '2026-07-01', endDate: '2026-07-14', days: 14, status: 'approved' },
      { startDate: '2026-10-12', endDate: '2026-10-25', days: 14, status: 'approved' },
      { startDate: '2027-07-08', endDate: '2027-07-21', days: 14, status: 'pending' },
    ],
  },
  {
    id: 5,
    name: 'Смирнов Игорь Павлович',
    avatar: '/avatars/manokhin.webp',
    position: 'UI/UX-дизайнер',
    team: 'Дизайн',
    planStatus: 'approved',
    distributedDays: 28,
    totalDays: 28,
    segments: [
      { startDate: '2026-05-25', endDate: '2026-06-07', days: 14, status: 'approved' },
      { startDate: '2026-08-24', endDate: '2026-09-06', days: 14, status: 'approved' },
      { startDate: '2027-05-05', endDate: '2027-05-18', days: 14, status: 'approved' },
    ],
  },
  {
    id: 8,
    name: 'Васильева Ольга Николаевна',
    avatar: '/avatars/olga.webp',
    position: 'Графический дизайнер',
    team: 'Дизайн',
    planStatus: 'pending',
    distributedDays: 28,
    totalDays: 28,
    segments: [
      { startDate: '2026-06-22', endDate: '2026-07-05', days: 14, status: 'approved' },
      { startDate: '2026-09-14', endDate: '2026-09-27', days: 14, status: 'approved' },
      { startDate: '2027-09-01', endDate: '2027-09-14', days: 14, status: 'pending' },
    ],
  },
]

const PLANNED_LABEL = 'Ежегодный основной оплачиваемый'

export const INCOMING_REQUESTS = [
  // ── 2027 плановые ──────────────────────────────────────────────────────────
  { id: 'r1',  reqNum: '234501', type: 'planned',   typeLabel: PLANNED_LABEL,                    name: 'Иванова Мария Сергеевна',     position: 'Frontend-разработчик', team: 'Продуктовая разработка', avatar: '/avatars/maria.webp',      startDate: '2027-03-10', endDate: '2027-03-23', days: 14, status: 'pending'  },
  { id: 'r2',  reqNum: '234502', type: 'planned',   typeLabel: PLANNED_LABEL,                    name: 'Петрова Анна Дмитриевна',     position: 'Backend-разработчик',  team: 'Продуктовая разработка', avatar: '/avatars/sofia.webp',      startDate: '2027-03-17', endDate: '2027-03-30', days: 14, status: 'pending'  },
  { id: 'r3',  reqNum: '234503', type: 'planned',   typeLabel: PLANNED_LABEL,                    name: 'Николаев Сергей Олегович',    position: 'QA-инженер',           team: 'Продуктовая разработка', avatar: '/avatars/konstantin.webp', startDate: '2027-07-01', endDate: '2027-07-14', days: 14, status: 'pending'  },
  { id: 'r4',  reqNum: '234504', type: 'planned',   typeLabel: PLANNED_LABEL,                    name: 'Козлова Елена Александровна', position: 'Аналитик',             team: 'Продуктовая разработка', avatar: '/avatars/marina.webp',     startDate: '2027-07-08', endDate: '2027-07-21', days: 14, status: 'pending'  },
  { id: 'r5',  reqNum: '234505', type: 'planned',   typeLabel: PLANNED_LABEL,                    name: 'Смирнов Игорь Павлович',      position: 'UI/UX-дизайнер',       team: 'Дизайн',                 avatar: '/avatars/manokhin.webp',   startDate: '2027-05-05', endDate: '2027-05-18', days: 14, status: 'approved' },
  { id: 'r6',  reqNum: '234506', type: 'planned',   typeLabel: PLANNED_LABEL,                    name: 'Васильева Ольга Николаевна',  position: 'Графический дизайнер', team: 'Дизайн',                 avatar: '/avatars/olga.webp',       startDate: '2027-09-01', endDate: '2027-09-14', days: 14, status: 'pending'  },
  { id: 'r7',  reqNum: '234507', type: 'planned',   typeLabel: PLANNED_LABEL,                    name: 'Иванова Мария Сергеевна',     position: 'Frontend-разработчик', team: 'Продуктовая разработка', avatar: '/avatars/maria.webp',      startDate: '2027-01-15', endDate: '2027-01-28', days: 14, status: 'rejected' },
  // ── 2026 плановые (согласованы) ────────────────────────────────────────────
  { id: 'r8',  reqNum: '234508', type: 'planned',   typeLabel: PLANNED_LABEL,                    name: 'Иванова Мария Сергеевна',     position: 'Frontend-разработчик', team: 'Продуктовая разработка', avatar: '/avatars/maria.webp',      startDate: '2026-08-04', endDate: '2026-08-17', days: 14, status: 'approved' },
  { id: 'r9',  reqNum: '234509', type: 'planned',   typeLabel: PLANNED_LABEL,                    name: 'Иванова Мария Сергеевна',     position: 'Frontend-разработчик', team: 'Продуктовая разработка', avatar: '/avatars/maria.webp',      startDate: '2026-11-10', endDate: '2026-11-23', days: 14, status: 'approved' },
  { id: 'r10', reqNum: '234510', type: 'planned',   typeLabel: PLANNED_LABEL,                    name: 'Петрова Анна Дмитриевна',     position: 'Backend-разработчик',  team: 'Продуктовая разработка', avatar: '/avatars/sofia.webp',      startDate: '2026-03-02', endDate: '2026-03-15', days: 14, status: 'approved' },
  { id: 'r11', reqNum: '234511', type: 'planned',   typeLabel: PLANNED_LABEL,                    name: 'Петрова Анна Дмитриевна',     position: 'Backend-разработчик',  team: 'Продуктовая разработка', avatar: '/avatars/sofia.webp',      startDate: '2026-07-20', endDate: '2026-08-02', days: 14, status: 'approved' },
  { id: 'r12', reqNum: '234512', type: 'planned',   typeLabel: PLANNED_LABEL,                    name: 'Николаев Сергей Олегович',    position: 'QA-инженер',           team: 'Продуктовая разработка', avatar: '/avatars/konstantin.webp', startDate: '2026-06-15', endDate: '2026-06-28', days: 14, status: 'approved' },
  { id: 'r13', reqNum: '234513', type: 'planned',   typeLabel: PLANNED_LABEL,                    name: 'Козлова Елена Александровна', position: 'Аналитик',             team: 'Продуктовая разработка', avatar: '/avatars/marina.webp',     startDate: '2026-07-01', endDate: '2026-07-14', days: 14, status: 'approved' },
  { id: 'r14', reqNum: '234514', type: 'planned',   typeLabel: PLANNED_LABEL,                    name: 'Козлова Елена Александровна', position: 'Аналитик',             team: 'Продуктовая разработка', avatar: '/avatars/marina.webp',     startDate: '2026-10-12', endDate: '2026-10-25', days: 14, status: 'approved' },
  { id: 'r15', reqNum: '234515', type: 'planned',   typeLabel: PLANNED_LABEL,                    name: 'Смирнов Игорь Павлович',      position: 'UI/UX-дизайнер',       team: 'Дизайн',                 avatar: '/avatars/manokhin.webp',   startDate: '2026-05-25', endDate: '2026-06-07', days: 14, status: 'approved' },
  { id: 'r16', reqNum: '234516', type: 'planned',   typeLabel: PLANNED_LABEL,                    name: 'Смирнов Игорь Павлович',      position: 'UI/UX-дизайнер',       team: 'Дизайн',                 avatar: '/avatars/manokhin.webp',   startDate: '2026-08-24', endDate: '2026-09-06', days: 14, status: 'approved' },
  { id: 'r17', reqNum: '234517', type: 'planned',   typeLabel: PLANNED_LABEL,                    name: 'Васильева Ольга Николаевна',  position: 'Графический дизайнер', team: 'Дизайн',                 avatar: '/avatars/olga.webp',       startDate: '2026-06-22', endDate: '2026-07-05', days: 14, status: 'approved' },
  { id: 'r18', reqNum: '234518', type: 'planned',   typeLabel: PLANNED_LABEL,                    name: 'Васильева Ольга Николаевна',  position: 'Графический дизайнер', team: 'Дизайн',                 avatar: '/avatars/olga.webp',       startDate: '2026-09-14', endDate: '2026-09-27', days: 14, status: 'approved' },
  // ── Внеплановые ────────────────────────────────────────────────────────────
  { id: 'r19', reqNum: '234519', type: 'unplanned', typeLabel: PLANNED_LABEL,                    name: 'Петрова Анна Дмитриевна',     position: 'Backend-разработчик',  team: 'Продуктовая разработка', avatar: '/avatars/sofia.webp',      startDate: '2026-04-10', endDate: '2026-04-14', days: 5,  status: 'rejected', rejectionComment: 'Период высокой нагрузки на команду' },
  { id: 'r20', reqNum: '234520', type: 'unplanned', typeLabel: 'Учебный оплачиваемый',           name: 'Николаев Сергей Олегович',    position: 'QA-инженер',           team: 'Продуктовая разработка', avatar: '/avatars/konstantin.webp', startDate: '2026-09-14', endDate: '2026-09-18', days: 5,  status: 'pending'  },
  { id: 'r21', reqNum: '234521', type: 'unplanned', typeLabel: 'Отпуск без сохранения з.п.',     name: 'Смирнов Игорь Павлович',      position: 'UI/UX-дизайнер',       team: 'Дизайн',                 avatar: '/avatars/manokhin.webp',   startDate: '2026-10-05', endDate: '2026-10-09', days: 5,  status: 'approved' },
  { id: 'r22', reqNum: '234522', type: 'unplanned', typeLabel: 'Учебный без сохранения з.п.',    name: 'Иванова Мария Сергеевна',     position: 'Frontend-разработчик', team: 'Продуктовая разработка', avatar: '/avatars/maria.webp',      startDate: '2027-02-10', endDate: '2027-02-14', days: 5,  status: 'pending'  },
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
