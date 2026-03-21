import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL // http://localhost:8000
})

// Auto-attach JWT
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Auth
export const signup = (data) => api.post('/api/auth/signup', data)
export const login = (data) => api.post('/api/auth/login', data)
export const googleAuth = (token) => api.post('/api/auth/google', { token })
export const verifyEmail = (token) => api.get(`/api/auth/verify-email?token=${token}`)

// Chat — THE MAIN ONE
export const sendMessage = (message, session_id) =>
  api.post('/api/chat', { message, session_id })

// Bookings
export const getMyBookings = () => api.get('/api/bookings/my')
export const getUpcoming = () => api.get('/api/bookings/upcoming')
export const createBooking = (data) => api.post('/api/bookings/create', data)

// Shows
export const getShows = () => api.get('/api/shows')
export const getShowSlots = (id) => api.get(`/api/shows/${id}/slots`)

// Payment
export const createPayment = (booking_id) =>
  api.post('/api/payment/create', { booking_id })
export const verifyPayment = (data) => api.post('/api/payment/verify', data)

// Ticket
export const getTicket = (booking_id) => api.get(`/api/tickets/${booking_id}`)

// User
export const getMe = () => api.get('/api/users/me')
export const getSaved = () => api.get('/api/users/saved')

// Admin
export const adminLogin = (data) => api.post('/api/admin/login', data)
export const getAnalytics = () => api.get('/api/admin/analytics')