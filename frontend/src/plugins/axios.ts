import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: { 'Content-Type': 'application/json' }
})

// Interceptor: agregar token JWT a cada request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

import alerts from '../services/alerts'

// Interceptor: redirigir a login si 401 y mostrar alertas de éxito globales
api.interceptors.response.use(
  response => {
    // Si la petición fue exitosa y es de modificación (post, put, delete, patch)
    const method = response.config?.method?.toLowerCase()
    
    // Evitar alerta en login
    const isLoginPath = response.config?.url?.includes('/login') || response.config?.url?.includes('/login-participante')

    if (method && ['post', 'put', 'delete', 'patch'].includes(method) && !isLoginPath) {
      if (!(response.config as any)?.skipSuccessAlert) {
        const msg = response.data?.message || 'Operación realizada correctamente'
        // Mostrar alerta verde estilo app (pero que no bloquee navegación rápida)
        alerts.success(msg)
      }
    }
    return response
  },
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api
