import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('task-manager-token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = error.config?.url || ''
    if (error.response?.status === 401 && !requestUrl.startsWith('/auth/')) {
      window.dispatchEvent(new Event('task-manager:unauthorized'))
    }
    return Promise.reject(error)
  },
)

export const getErrorMessage = (error) =>
  error.response?.data?.message ||
  (error.request ? 'Could not reach the server. Check your connection and try again.' : error.message) ||
  'Something went wrong. Please try again.'

export default api
