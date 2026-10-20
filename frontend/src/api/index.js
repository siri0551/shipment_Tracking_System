import api from './axios'

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  getUsers: () => api.get('/auth/users'),
  updateRole: (id, role) => api.put(`/auth/users/${id}/role`, { role }),
  toggleStatus: (id) => api.put(`/auth/users/${id}/status`),
}

export const shipmentAPI = {
  create: (data) => api.post('/shipments', data),
  getAll: (params) => api.get('/shipments', { params }),
  getOne: (id) => api.get(`/shipments/${id}`),
  track: (trackingId) => api.get(`/shipments/track/${trackingId}`),
  update: (id, data) => api.put(`/shipments/${id}`, data),
  assignCarrier: (id, carrierId) => api.put(`/shipments/${id}/assign-carrier`, { carrierId }),
  cancel: (id) => api.delete(`/shipments/${id}`),
}

export const trackingAPI = {
  getTimeline: (trackingId) => api.get(`/tracking/${trackingId}`),
  getCurrent: (trackingId) => api.get(`/tracking/${trackingId}/current`),
  addUpdate: (id, data) => api.post(`/tracking/${id}/update`, data),
  getByStatus: (status) => api.get(`/tracking/status/${status}`),
}

export const blockchainAPI = {
  register: (id) => api.post(`/blockchain/register/${id}`),
  updateStatus: (id, data) => api.put(`/blockchain/status/${id}`, data),
  transfer: (id, data) => api.put(`/blockchain/transfer/${id}`, data),
  confirmDelivery: (id) => api.put(`/blockchain/confirm-delivery/${id}`),
  cancel: (id) => api.delete(`/blockchain/cancel/${id}`),
  getEvents: (id) => api.get(`/blockchain/events/${id}`),
  verify: (trackingId) => api.get(`/blockchain/verify/${trackingId}`),
}

export const qrAPI = {
  generate: (id) => api.post(`/qr/generate/${id}`),
  get: (trackingId) => api.get(`/qr/${trackingId}`),
}

export const historyAPI = {
  get: (trackingId) => api.get(`/history/${trackingId}`),
  getById: (id) => api.get(`/history/shipment/${id}`),
  getBlockchain: (id) => api.get(`/history/shipment/${id}/blockchain`),
}

export const podAPI = {
  generateOTP: (id) => api.post(`/pod/generate-otp/${id}`),
  verifyOTP: (id, otp) => api.post(`/pod/verify-otp/${id}`, { otp }),
  submit: (id, data) => api.post(`/pod/submit/${id}`, data),
  get: (trackingId) => api.get(`/pod/${trackingId}`),
}

export const tamperAPI = {
  verify: (trackingId) => api.get(`/tamper/verify/${trackingId}`),
  batch: () => api.get('/tamper/batch'),
  flagged: () => api.get('/tamper/flagged'),
}

export const analyticsAPI = {
  overview: () => api.get('/analytics/overview'),
  byStatus: () => api.get('/analytics/by-status'),
  byCountry: () => api.get('/analytics/by-country'),
  carrierPerformance: () => api.get('/analytics/carrier-performance'),
  daily: (days) => api.get(`/analytics/daily?days=${days}`),
  topRoutes: () => api.get('/analytics/top-routes'),
}
