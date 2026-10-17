import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getErrorMessage } from '../api.js'
import { useAuth } from '../context/AuthContext.jsx'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form)
      navigate('/', { replace: true })
    } catch (requestError) {
      setError(getErrorMessage(requestError))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-layout">
      <section className="auth-story">
        <a className="brand brand-light" href="/login"><span className="brand-mark">✓</span> Daymark</a>
        <div className="story-copy">
          <span className="eyebrow">MAKE ROOM FOR WHAT MATTERS</span>
          <h1>Small steps.<br />Big momentum.</h1>
          <p>A calmer way to keep track of the things you want to get done.</p>
        </div>
        <p className="story-footer">A little progress goes a long way.</p>
      </section>
      <section className="auth-panel">
        <div className="auth-form-wrap">
          <span className="eyebrow">WELCOME BACK</span>
          <h2>Sign in to your space</h2>
          <p className="muted">Pick up right where you left off.</p>
          <form className="auth-form" onSubmit={handleSubmit}>
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              required
              maxLength={254}
            />
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              required
              maxLength={128}
            />
            {error && <p className="form-error" role="alert">{error}</p>}
            <button className="button button-primary button-wide" type="submit" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in'} <span aria-hidden="true">→</span>
            </button>
          </form>
          <p className="auth-switch">New to Daymark? <Link to="/register">Create an account</Link></p>
        </div>
      </section>
    </main>
  )
}
