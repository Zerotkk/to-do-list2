import { initialProjects, initialTasks, PROJECT_COLORS } from './data.js'

const STORAGE_KEY = 'multi-project-todo-state'

function normalizeProjects(projects) {
  return projects.map((project, index) => ({
    ...project,
    color: PROJECT_COLORS[index % PROJECT_COLORS.length],
  }))
}

export function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)

    if (!saved) {
      return {
        projects: normalizeProjects(initialProjects),
        tasks: initialTasks,
        activeProjectId: initialProjects[0]?.id ?? '',
      }
    }

    const parsed = JSON.parse(saved)

    return {
      projects: normalizeProjects(Array.isArray(parsed.projects) ? parsed.projects : initialProjects),
      tasks: Array.isArray(parsed.tasks) ? parsed.tasks : initialTasks,
      activeProjectId: parsed.activeProjectId || initialProjects[0]?.id || '',
    }
  } catch {
    return {
      projects: normalizeProjects(initialProjects),
      tasks: initialTasks,
      activeProjectId: initialProjects[0]?.id ?? '',
    }
  }
}

export function saveState(state) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      projects: state.projects,
      tasks: state.tasks,
      activeProjectId: state.activeProjectId,
    }),
  )
}
