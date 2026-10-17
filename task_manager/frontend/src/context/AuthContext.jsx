import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import api from '../api.js'

const AuthContext = createContext(null)

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem('task-manager-user') || 'null')
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('task-manager-token'))
  const [user, setUser] = useState(getStoredUser)

  const logout = useCallback(() => {
    localStorage.removeItem('task-manager-token')
    localStorage.removeItem('task-manager-user')
    setToken(null)
    setUser(null)
  }, [])

  useEffect(() => {
    window.addEventListener('task-manager:unauthorized', logout)
    return () => window.removeEventListener('task-manager:unauthorized', logout)
  }, [logout])

  const saveSession = useCallback(({ token: nextToken, user: nextUser }) => {
    localStorage.setItem('task-manager-token', nextToken)
    localStorage.setItem('task-manager-user', JSON.stringify(nextUser))
    setToken(nextToken)
    setUser(nextUser)
  }, [])

  const login = useCallback(async (credentials) => {
    const { data } = await api.post('/auth/login', credentials)
    saveSession(data)
  }, [saveSession])

  const register = useCallback(async (details) => {
    const { data } = await api.post('/auth/register', details)
    saveSession(data)
  }, [saveSession])

  const value = useMemo(
    () => ({ token, user, isAuthenticated: Boolean(token), login, register, logout }),
    [token, user, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider.')
  return context
}
