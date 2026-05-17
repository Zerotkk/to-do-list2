import { useEffect, useMemo, useState } from 'react'
import { PRIORITIES, PROJECT_COLORS, TASK_STATUSES } from './data.js'
import { loadState, saveState } from './storage.js'

const blankTask = {
  title: '',
  status: '待处理',
  priority: '中',
  owner: '',
  dueDate: '',
}

function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function getPriorityRank(priority) {
  return { 高: 0, 中: 1, 低: 2 }[priority] ?? 3
}

function App() {
  const [state, setState] = useState(loadState)
  const [projectName, setProjectName] = useState('')
  const [taskDraft, setTaskDraft] = useState(blankTask)
  const [editingTaskId, setEditingTaskId] = useState(null)
  const [sortMode, setSortMode] = useState('priority')
  const [filters, setFilters] = useState({
    keyword: '',
    owner: '全部',
    priority: '全部',
  })

  const { projects, tasks, activeProjectId } = state

  useEffect(() => {
    saveState(state)
  }, [state])

  const activeProject = projects.find((project) => project.id === activeProjectId) ?? projects[0]
  const projectTasks = useMemo(
    () => tasks.filter((task) => task.projectId === activeProject?.id),
    [activeProject?.id, tasks],
  )
  const ownerOptions = useMemo(() => {
    return [...new Set(projectTasks.map((task) => task.owner).filter(Boolean))].sort((a, b) =>
      a.localeCompare(b, 'zh-CN'),
    )
  }, [projectTasks])

  const activeTasks = useMemo(() => {
    const keyword = filters.keyword.trim().toLowerCase()
    const filtered = projectTasks.filter((task) => {
      const matchesKeyword =
        !keyword || `${task.title} ${task.owner}`.toLowerCase().includes(keyword)
      const matchesOwner = filters.owner === '全部' || task.owner === filters.owner
      const matchesPriority = filters.priority === '全部' || task.priority === filters.priority

      return matchesKeyword && matchesOwner && matchesPriority
    })

    return [...filtered].sort((a, b) => {
      if (sortMode === 'owner') {
        return a.owner.localeCompare(b.owner, 'zh-CN')
      }

      if (sortMode === 'dueDate') {
        return (a.dueDate || '9999-12-31').localeCompare(b.dueDate || '9999-12-31')
      }

      return getPriorityRank(a.priority) - getPriorityRank(b.priority)
    })
  }, [filters, projectTasks, sortMode])

  const dashboardStats = useMemo(() => {
    const total = tasks.length
    const done = tasks.filter((task) => task.status === '已完成').length
    const active = tasks.filter((task) => task.status !== '已完成').length
    const urgent = tasks.filter((task) => task.priority === '高' && task.status !== '已完成').length

    return { total, done, active, urgent }
  }, [tasks])

  function addProject(event) {
    event.preventDefault()
    const name = projectName.trim()

    if (!name) return

    const project = {
      id: createId('project'),
      name,
      status: '规划中',
      color: PROJECT_COLORS[projects.length % PROJECT_COLORS.length],
    }

    setState((current) => ({
      ...current,
      projects: [...current.projects, project],
      activeProjectId: project.id,
    }))
    setProjectName('')
  }

  function selectProject(projectId) {
    setState((current) => ({ ...current, activeProjectId: projectId }))
    setEditingTaskId(null)
    setTaskDraft(blankTask)
  }

  function submitTask(event) {
    event.preventDefault()
    const title = taskDraft.title.trim()

    if (!title || !activeProject) return

    if (editingTaskId) {
      setState((current) => ({
        ...current,
        tasks: current.tasks.map((task) =>
          task.id === editingTaskId
            ? {
                ...task,
                ...taskDraft,
                title,
                owner: taskDraft.owner.trim() || '未分配',
              }
            : task,
        ),
      }))
      setEditingTaskId(null)
    } else {
      setState((current) => ({
        ...current,
        tasks: [
          ...current.tasks,
          {
            id: createId('task'),
            projectId: activeProject.id,
            ...taskDraft,
            title,
            owner: taskDraft.owner.trim() || '未分配',
          },
        ],
      }))
    }

    setTaskDraft(blankTask)
  }

  function editTask(task) {
    setEditingTaskId(task.id)
    setTaskDraft({
      title: task.title,
      status: task.status,
      priority: task.priority,
      owner: task.owner,
      dueDate: task.dueDate,
    })
  }

  function deleteTask(taskId) {
    setState((current) => ({
      ...current,
      tasks: current.tasks.filter((task) => task.id !== taskId),
    }))

    if (editingTaskId === taskId) {
      setEditingTaskId(null)
      setTaskDraft(blankTask)
    }
  }

  function changeTaskStatus(taskId, status) {
    setState((current) => ({
      ...current,
      tasks: current.tasks.map((task) => (task.id === taskId ? { ...task, status } : task)),
    }))
  }

  function getProjectStats(projectId) {
    const projectTasks = tasks.filter((task) => task.projectId === projectId)
    const done = projectTasks.filter((task) => task.status === '已完成').length

    return {
      total: projectTasks.length,
      done,
    }
  }

  return (
    <main className="app-shell">
      <ProjectSidebar
        activeProjectId={activeProject?.id}
        onAddProject={addProject}
        onProjectNameChange={setProjectName}
        onSelectProject={selectProject}
        projectName={projectName}
        projects={projects}
        getProjectStats={getProjectStats}
      />

      <section className="workspace">
        <header className="topbar">
          <div className="project-heading">
            <span className="project-heading-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" role="img">
                <path d="M5.5 4A2.5 2.5 0 0 0 3 6.5v11A2.5 2.5 0 0 0 5.5 20h13a2.5 2.5 0 0 0 2.5-2.5v-8A2.5 2.5 0 0 0 18.5 7H12l-1.7-2.1A2.5 2.5 0 0 0 8.35 4H5.5Zm0 2h2.85c.15 0 .29.07.38.18L11.03 9H18.5c.28 0 .5.22.5.5v8a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5v-11c0-.28.22-.5.5-.5Z" />
              </svg>
            </span>
            <h1>{activeProject?.name ?? '暂无项目'}</h1>
          </div>
          <div className="metric-strip" aria-label="全局任务统计">
            <Metric label="总任务" value={dashboardStats.total} />
            <Metric label="推进中" value={dashboardStats.active} />
            <Metric label="已完成" value={dashboardStats.done} />
            <Metric label="高优先级" value={dashboardStats.urgent} />
          </div>
        </header>

        <section className="controls-panel">
          <FilterToolbar
            filters={filters}
            onChange={setFilters}
            ownerOptions={ownerOptions}
            sortMode={sortMode}
            onSortChange={setSortMode}
          />
        </section>

        <section className="task-entry-panel">
          <TaskForm
            draft={taskDraft}
            editingTaskId={editingTaskId}
            onCancel={() => {
              setEditingTaskId(null)
              setTaskDraft(blankTask)
            }}
            onChange={setTaskDraft}
            onSubmit={submitTask}
          />
        </section>

        <TaskBoard
          tasks={activeTasks}
          onChangeStatus={changeTaskStatus}
          onDelete={deleteTask}
          onEdit={editTask}
        />
      </section>
    </main>
  )
}

function FilterToolbar({ filters, onChange, onSortChange, ownerOptions, sortMode }) {
  function updateFilter(field, value) {
    onChange({ ...filters, [field]: value })
  }

  return (
    <div className="filter-toolbar">
      <label className="filter-search">
        搜索
        <input
          onChange={(event) => updateFilter('keyword', event.target.value)}
          placeholder="任务或负责人"
          value={filters.keyword}
        />
      </label>

      <label>
        优先级
        <select onChange={(event) => updateFilter('priority', event.target.value)} value={filters.priority}>
          <option>全部</option>
          {PRIORITIES.map((priority) => (
            <option key={priority}>{priority}</option>
          ))}
        </select>
      </label>

      <label>
        负责人
        <select onChange={(event) => updateFilter('owner', event.target.value)} value={filters.owner}>
          <option>全部</option>
          {ownerOptions.map((owner) => (
            <option key={owner}>{owner}</option>
          ))}
        </select>
      </label>

      <div className="sort-control">
        <span>排序</span>
        <div className="segmented" role="group" aria-label="任务排序">
          <button className={sortMode === 'priority' ? 'active' : ''} onClick={() => onSortChange('priority')}>
            优先级
          </button>
          <button className={sortMode === 'owner' ? 'active' : ''} onClick={() => onSortChange('owner')}>
            负责人
          </button>
          <button className={sortMode === 'dueDate' ? 'active' : ''} onClick={() => onSortChange('dueDate')}>
            截止日
          </button>
        </div>
      </div>

      <button
        className="ghost-button filter-reset"
        onClick={() => onChange({ keyword: '', owner: '全部', priority: '全部' })}
        type="button"
      >
        重置
      </button>
    </div>
  )
}

function Metric({ label, value }) {
  return (
    <div className="metric">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  )
}

function ProjectSidebar({
  activeProjectId,
  getProjectStats,
  onAddProject,
  onProjectNameChange,
  onSelectProject,
  projectName,
  projects,
}) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-mark" aria-hidden="true">
          <svg viewBox="0 0 24 24" role="img">
            <path d="M4 5.75A1.75 1.75 0 0 1 5.75 4h12.5A1.75 1.75 0 0 1 20 5.75v12.5A1.75 1.75 0 0 1 18.25 20H5.75A1.75 1.75 0 0 1 4 18.25V5.75Zm2 .25v12h3.5V6H6Zm5.25 0v12h2.5V6h-2.5Zm4.25 0v12H18V6h-2.5Z" />
          </svg>
        </span>
        <div>
          <strong>项目看板</strong>
          <span>多项目 To Do</span>
        </div>
      </div>

      <form className="project-form" onSubmit={onAddProject}>
        <label htmlFor="project-name">新增项目</label>
        <div className="inline-form">
          <input
            id="project-name"
            onChange={(event) => onProjectNameChange(event.target.value)}
            placeholder="项目名称"
            value={projectName}
          />
          <button type="submit" title="新增项目">
            +
          </button>
        </div>
      </form>

      <nav className="project-list" aria-label="项目列表">
        {projects.map((project) => {
          const stats = getProjectStats(project.id)
          const isActive = project.id === activeProjectId

          return (
            <button
              className={`project-item ${isActive ? 'active' : ''}`}
              key={project.id}
              onClick={() => onSelectProject(project.id)}
              type="button"
            >
              <span className="project-color" style={{ background: project.color }} />
              <span className="project-main">
                <strong>{project.name}</strong>
                <small>{project.status}</small>
              </span>
              <span className="project-count">
                {stats.done}/{stats.total}
              </span>
            </button>
          )
        })}
      </nav>
    </aside>
  )
}

function TaskForm({ draft, editingTaskId, onCancel, onChange, onSubmit }) {
  function updateField(field, value) {
    onChange({ ...draft, [field]: value })
  }

  return (
    <form className="task-form" onSubmit={onSubmit}>
      <div className="form-title">{editingTaskId ? '编辑任务' : '新增任务'}</div>

      <label>
        任务标题
        <input
          onChange={(event) => updateField('title', event.target.value)}
          placeholder="例如：确认里程碑计划"
          value={draft.title}
        />
      </label>

      <label>
        负责人
        <input
          onChange={(event) => updateField('owner', event.target.value)}
          placeholder="未填写则为未分配"
          value={draft.owner}
        />
      </label>

      <label>
        截止日期
        <input
          onChange={(event) => updateField('dueDate', event.target.value)}
          type="date"
          value={draft.dueDate}
        />
      </label>

      <label>
        优先级
        <select onChange={(event) => updateField('priority', event.target.value)} value={draft.priority}>
          {PRIORITIES.map((priority) => (
            <option key={priority}>{priority}</option>
          ))}
        </select>
      </label>

      <label>
        状态
        <select onChange={(event) => updateField('status', event.target.value)} value={draft.status}>
          {TASK_STATUSES.map((status) => (
            <option key={status}>{status}</option>
          ))}
        </select>
      </label>

      <div className="form-actions">
        {editingTaskId && (
          <button className="ghost-button" onClick={onCancel} type="button">
            取消
          </button>
        )}
        <button className="primary-button" type="submit">
          {editingTaskId ? '保存' : '添加'}
        </button>
      </div>
    </form>
  )
}

function TaskBoard({ onChangeStatus, onDelete, onEdit, tasks }) {
  return (
    <section className="task-board">
      {TASK_STATUSES.map((status) => {
        const statusTasks = tasks.filter((task) => task.status === status)

        return (
          <section className="task-column" key={status}>
            <header>
              <h2>{status}</h2>
              <span>{statusTasks.length}</span>
            </header>

            <div className="task-stack">
              {statusTasks.length === 0 ? (
                <p className="empty-state">暂无任务</p>
              ) : (
                statusTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    onChangeStatus={onChangeStatus}
                    onDelete={onDelete}
                    onEdit={onEdit}
                    task={task}
                  />
                ))
              )}
            </div>
          </section>
        )
      })}
    </section>
  )
}

function TaskCard({ onChangeStatus, onDelete, onEdit, task }) {
  return (
    <article className="task-card">
      <div className="task-card-header">
        <span className={`priority priority-${task.priority}`}>{task.priority}</span>
        <select
          aria-label={`${task.title} 状态`}
          onChange={(event) => onChangeStatus(task.id, event.target.value)}
          value={task.status}
        >
          {TASK_STATUSES.map((status) => (
            <option key={status}>{status}</option>
          ))}
        </select>
      </div>

      <h3>{task.title}</h3>

      <dl className="task-meta">
        <div>
          <dt>负责人</dt>
          <dd>{task.owner}</dd>
        </div>
        <div>
          <dt>截止</dt>
          <dd>{task.dueDate || '未设置'}</dd>
        </div>
      </dl>

      <div className="task-actions">
        <button className="ghost-button" onClick={() => onEdit(task)} type="button">
          编辑
        </button>
        <button className="danger-button" onClick={() => onDelete(task.id)} type="button">
          删除
        </button>
      </div>
    </article>
  )
}

export default App
