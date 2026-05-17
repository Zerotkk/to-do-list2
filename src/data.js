export const TASK_STATUSES = ['待处理', '进行中', '已完成']

export const PRIORITIES = ['高', '中', '低']

export const PROJECT_COLORS = ['#1677ff', '#4096ff', '#69b1ff', '#0958d9', '#003eb3']

export const initialProjects = [
  {
    id: 'project-web',
    name: '官网改版',
    status: '执行中',
    color: '#1677ff',
  },
  {
    id: 'project-crm',
    name: 'CRM 集成',
    status: '规划中',
    color: '#4096ff',
  },
  {
    id: 'project-launch',
    name: '新品发布',
    status: '风险关注',
    color: '#69b1ff',
  },
]

export const initialTasks = [
  {
    id: 'task-1',
    projectId: 'project-web',
    title: '确认首页信息架构',
    status: '进行中',
    priority: '高',
    owner: '李娜',
    dueDate: '2026-05-22',
  },
  {
    id: 'task-2',
    projectId: 'project-web',
    title: '整理竞品页面截图',
    status: '待处理',
    priority: '中',
    owner: '周明',
    dueDate: '2026-05-24',
  },
  {
    id: 'task-3',
    projectId: 'project-web',
    title: '完成视觉稿评审',
    status: '已完成',
    priority: '高',
    owner: '王珊',
    dueDate: '2026-05-18',
  },
  {
    id: 'task-4',
    projectId: 'project-crm',
    title: '梳理客户字段映射',
    status: '进行中',
    priority: '高',
    owner: '赵远',
    dueDate: '2026-05-21',
  },
  {
    id: 'task-5',
    projectId: 'project-crm',
    title: '确认接口联调窗口',
    status: '待处理',
    priority: '中',
    owner: '陈静',
    dueDate: '2026-05-27',
  },
  {
    id: 'task-6',
    projectId: 'project-launch',
    title: '锁定发布节奏表',
    status: '待处理',
    priority: '高',
    owner: '何川',
    dueDate: '2026-05-20',
  },
  {
    id: 'task-7',
    projectId: 'project-launch',
    title: '准备销售培训材料',
    status: '进行中',
    priority: '中',
    owner: '刘雨',
    dueDate: '2026-05-29',
  },
]
