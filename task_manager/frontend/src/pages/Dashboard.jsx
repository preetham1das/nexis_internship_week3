import { useCallback, useEffect, useMemo, useState } from 'react'
import { getErrorMessage, default as api } from '../api.js'
import { useAuth } from '../context/AuthContext.jsx'

const filters = [
  { value: 'all', label: 'All tasks' },
  { value: 'pending', label: 'Pending' },
  { value: 'completed', label: 'Completed' },
]

const emptyForm = { title: '', description: '' }

function formatDate(date) {
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(new Date(date))
}

export default function Dashboard() {
  const { user, logout } = useAuth()
  const [tasks, setTasks] = useState([])
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [workingId, setWorkingId] = useState(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const loadTasks = useCallback(async (signal) => {
    setLoading(true)
    setError('')
    try {
      const { data } = await api.get('/tasks', { signal })
      setTasks(data)
    } catch (requestError) {
      if (requestError.code !== 'ERR_CANCELED') setError(getErrorMessage(requestError))
    } finally {
      if (!signal?.aborted) setLoading(false)
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    loadTasks(controller.signal)
    return () => controller.abort()
  }, [loadTasks])

  const completedCount = tasks.filter((task) => task.completed).length
  const pendingCount = tasks.length - completedCount
  const visibleTasks = useMemo(() => {
    const query = search.trim().toLowerCase()
    return tasks.filter((task) => {
      const matchesFilter =
        filter === 'all' || (filter === 'completed' ? task.completed : !task.completed)
      return matchesFilter && task.title.toLowerCase().includes(query)
    })
  }, [tasks, filter, search])

  function startEditing(task) {
    setEditingId(task._id)
    setForm({ title: task.title, description: task.description || '' })
    setError('')
    setNotice('')
    document.getElementById('task-title')?.focus()
  }

  function cancelEditing() {
    setEditingId(null)
    setForm(emptyForm)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setNotice('')
    setSaving(true)
    try {
      if (editingId) {
        const { data } = await api.patch(`/tasks/${editingId}`, form)
        setTasks((current) => current.map((task) => task._id === editingId ? data : task))
        setNotice('Your changes have been saved.')
      } else {
        const { data } = await api.post('/tasks', form)
        setTasks((current) => [data, ...current])
        setNotice('Task added to your list.')
      }
      cancelEditing()
    } catch (requestError) {
      setError(getErrorMessage(requestError))
    } finally {
      setSaving(false)
    }
  }

  async function toggleTask(task) {
    setWorkingId(task._id)
    setError('')
    try {
      const { data } = await api.patch(`/tasks/${task._id}`, { completed: !task.completed })
      setTasks((current) => current.map((item) => item._id === task._id ? data : item))
    } catch (requestError) {
      setError(getErrorMessage(requestError))
    } finally {
      setWorkingId(null)
    }
  }

  async function deleteTask(task) {
    setWorkingId(task._id)
    setError('')
    try {
      await api.delete(`/tasks/${task._id}`)
      setTasks((current) => current.filter((item) => item._id !== task._id))
      if (editingId === task._id) cancelEditing()
      setNotice('Task deleted.')
    } catch (requestError) {
      setError(getErrorMessage(requestError))
    } finally {
      setWorkingId(null)
    }
  }

  const firstName = user?.name?.trim().split(/\s+/)[0] || 'there'

  return (
    <main className="dashboard">
      <header className="topbar">
        <a className="brand" href="/"><span className="brand-mark">✓</span> Daymark</a>
        <div className="topbar-user">
          <span className="user-greeting">Hi, {firstName}</span>
          <span className="avatar" aria-hidden="true">{firstName.charAt(0).toUpperCase()}</span>
          <button className="button button-quiet" type="button" onClick={logout}>Sign out</button>
        </div>
      </header>

      <section className="welcome-section">
        <div>
          <span className="eyebrow">YOUR PERSONAL WORKSPACE</span>
          <h1>Make today count<span className="period">.</span></h1>
          <p>One thing at a time. You’ve got this.</p>
        </div>
        <div className="date-pill"><span aria-hidden="true">◷</span> {new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date())}</div>
      </section>

      <section className="stats-grid" aria-label="Task summary">
        <article className="stat-card">
          <span className="stat-icon stat-icon-total" aria-hidden="true">▤</span>
          <div><span className="stat-label">All tasks</span><strong>{tasks.length}</strong></div>
        </article>
        <article className="stat-card">
          <span className="stat-icon stat-icon-pending" aria-hidden="true">◷</span>
          <div><span className="stat-label">In progress</span><strong>{pendingCount}</strong></div>
        </article>
        <article className="stat-card">
          <span className="stat-icon stat-icon-complete" aria-hidden="true">✓</span>
          <div><span className="stat-label">Completed</span><strong>{completedCount}</strong></div>
        </article>
      </section>

      <div className="workspace-grid">
        <section className="panel task-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">YOUR LIST</span>
              <h2>Tasks <span className="task-count">{tasks.length}</span></h2>
            </div>
            <label className="search-box">
              <span aria-hidden="true">⌕</span>
              <input
                type="search"
                aria-label="Search tasks by title"
                placeholder="Search tasks"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </label>
          </div>
          <div className="filter-tabs" role="tablist" aria-label="Filter tasks">
            {filters.map((item) => (
              <button
                className={`filter-tab${filter === item.value ? ' active' : ''}`}
                type="button"
                role="tab"
                aria-selected={filter === item.value}
                key={item.value}
                onClick={() => setFilter(item.value)}
              >
                {item.label}
                <span>{item.value === 'all' ? tasks.length : item.value === 'completed' ? completedCount : pendingCount}</span>
              </button>
            ))}
          </div>

          {error && <p className="inline-error" role="alert">{error}</p>}
          {notice && !error && <p className="inline-notice" role="status">{notice}</p>}

          {loading ? (
            <div className="list-message"><span className="spinner" /> Loading your tasks…</div>
          ) : visibleTasks.length ? (
            <ul className="task-list">
              {visibleTasks.map((task) => (
                <li className={`task-item${task.completed ? ' is-completed' : ''}`} key={task._id}>
                  <button
                    className="completion-check"
                    type="button"
                    aria-label={task.completed ? `Mark ${task.title} as pending` : `Mark ${task.title} complete`}
                    disabled={workingId === task._id}
                    onClick={() => toggleTask(task)}
                  >
                    {task.completed && <span aria-hidden="true">✓</span>}
                  </button>
                  <div className="task-copy">
                    <h3>{task.title}</h3>
                    {task.description && <p>{task.description}</p>}
                    <span className="task-date">Added {formatDate(task.createdAt)}</span>
                  </div>
                  <div className="task-actions">
                    <button className="icon-button" type="button" aria-label={`Edit ${task.title}`} onClick={() => startEditing(task)}>Edit</button>
                    <button className="icon-button delete-button" type="button" aria-label={`Delete ${task.title}`} disabled={workingId === task._id} onClick={() => deleteTask(task)}>Delete</button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="empty-state">
              <span className="empty-icon" aria-hidden="true">{search ? '⌕' : filter === 'completed' ? '✓' : '✳'}</span>
              <h3>{search ? 'No matching tasks' : filter === 'completed' ? 'Nothing completed yet' : filter === 'pending' ? 'All caught up' : 'Your list is clear'}</h3>
              <p>{search ? 'Try another title or clear your search.' : 'Add a task to make a little progress today.'}</p>
            </div>
          )}
        </section>

        <aside className="panel composer-panel">
          <span className="eyebrow">{editingId ? 'MAKE A CHANGE' : 'GET IT OUT OF YOUR HEAD'}</span>
          <h2>{editingId ? 'Edit task' : 'Add a task'}</h2>
          <p className="muted">{editingId ? 'Update the details below.' : 'Keep it simple. You can always add more detail later.'}</p>
          <form className="task-form" onSubmit={handleSubmit}>
            <label htmlFor="task-title">Task title</label>
            <input
              id="task-title"
              type="text"
              placeholder="What needs doing?"
              value={form.title}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
              required
              maxLength={120}
            />
            <label htmlFor="task-description">A few details <span className="optional">(optional)</span></label>
            <textarea
              id="task-description"
              rows="4"
              placeholder="Add a note to help you get started…"
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
              maxLength={1000}
            />
            <button className="button button-primary button-wide" type="submit" disabled={saving}>
              {saving ? 'Saving…' : editingId ? 'Save changes' : 'Add to my list'} <span aria-hidden="true">→</span>
            </button>
            {editingId && <button className="button button-quiet button-wide cancel-button" type="button" onClick={cancelEditing}>Cancel</button>}
          </form>
          <div className="gentle-note"><span aria-hidden="true">✦</span><p>Focus on progress, not perfection. Every checked-off task is a win.</p></div>
        </aside>
      </div>
      <footer className="dashboard-footer">Made for thoughtful progress.</footer>
    </main>
  )
}
