import api from './api';

// Admin-specific axios instance that uses a separate token key
const adminService = {
  // ── Auth ────────────────────────────────────────────────────────────────────

  async login(credentials) {
    const response = await api.post('/auth/admin/login', credentials);
    if (response.data?.token) {
      localStorage.setItem('iw_admin_token', response.data.token);
      localStorage.setItem('iw_admin', JSON.stringify(response.data.admin));
    }
    return response;
  },

  logout() {
    localStorage.removeItem('iw_admin_token');
    localStorage.removeItem('iw_admin');
  },

  // ── Self ────────────────────────────────────────────────────────────────────

  async getMe() {
    return api.get('/admin/me', { headers: _adminAuthHeader() });
  },

  // ── Admin Management ────────────────────────────────────────────────────────

  async listAdmins(params = {}) {
    return api.get('/admin/admins', { params, headers: _adminAuthHeader() });
  },

  async createAdmin(data) {
    return api.post('/admin/admins', data, { headers: _adminAuthHeader() });
  },

  async updateAdmin(id, data) {
    return api.put(`/admin/admins/${id}`, data, { headers: _adminAuthHeader() });
  },

  async deactivateAdmin(id) {
    return api.delete(`/admin/admins/${id}`, { headers: _adminAuthHeader() });
  },

  async assignRole(id, data) {
    return api.post(`/admin/admins/${id}/roles`, data, { headers: _adminAuthHeader() });
  },

  async removeRole(id, roleId) {
    return api.delete(`/admin/admins/${id}/roles/${roleId}`, { headers: _adminAuthHeader() });
  },

  // ── Activity Logs ────────────────────────────────────────────────────────────

  async listActivityLogs(params = {}) {
    return api.get('/admin/activity-logs', { params, headers: _adminAuthHeader() });
  },

  // ── Students (via enrollments / user management) ─────────────────────────────

  async listEnrollments(params = {}) {
    return api.get('/admin/enrollments', { params, headers: _adminAuthHeader() });
  },

  async getEnrollment(id) {
    return api.get(`/admin/enrollments/${id}`, { headers: _adminAuthHeader() });
  },

  async approveEnrollment(id) {
    return api.patch(`/admin/enrollments/${id}/approve`, {}, { headers: _adminAuthHeader() });
  },

  async rejectEnrollment(id, data) {
    return api.patch(`/admin/enrollments/${id}/reject`, data, { headers: _adminAuthHeader() });
  },

  // ── Payments ────────────────────────────────────────────────────────────────

  async listPayments(params = {}) {
    return api.get('/admin/payments', { params, headers: _adminAuthHeader() });
  },

  async confirmPayment(id, data) {
    return api.post(`/admin/payments/${id}/confirm`, data, { headers: _adminAuthHeader() });
  },

  async rejectPayment(id, data) {
    return api.post(`/admin/payments/${id}/reject`, data, { headers: _adminAuthHeader() });
  },

  async refundPayment(id, data) {
    return api.post(`/admin/payments/${id}/refund`, data, { headers: _adminAuthHeader() });
  },

  // ── Certificates ─────────────────────────────────────────────────────────────

  async listCertificates(params = {}) {
    return api.get('/admin/certificates', { params, headers: _adminAuthHeader() });
  },

  async approveCertificate(id) {
    return api.post(`/admin/certificates/${id}/approve`, {}, { headers: _adminAuthHeader() });
  },

  async updateHardCopyStatus(id, data) {
    return api.patch(`/admin/certificates/${id}/hard-copy`, data, { headers: _adminAuthHeader() });
  },

  // ── Blog ─────────────────────────────────────────────────────────────────────

  async listBlogPosts(params = {}) {
    return api.get('/admin/blog', { params, headers: _adminAuthHeader() });
  },

  async createBlogPost(data) {
    return api.post('/admin/blog', data, { headers: _adminAuthHeader() });
  },

  async updateBlogPost(id, data) {
    return api.put(`/admin/blog/${id}`, data, { headers: _adminAuthHeader() });
  },

  async deleteBlogPost(id) {
    return api.delete(`/admin/blog/${id}`, { headers: _adminAuthHeader() });
  },

  async createBlogCategory(data) {
    return api.post('/admin/blog/categories', data, { headers: _adminAuthHeader() });
  },

  // ── Jobs ──────────────────────────────────────────────────────────────────────

  async listJobs(params = {}) {
    return api.get('/admin/jobs', { params, headers: _adminAuthHeader() });
  },

  async createJob(data) {
    return api.post('/admin/jobs', data, { headers: _adminAuthHeader() });
  },

  async updateJob(id, data) {
    return api.put(`/admin/jobs/${id}`, data, { headers: _adminAuthHeader() });
  },

  async deleteJob(id) {
    return api.delete(`/admin/jobs/${id}`, { headers: _adminAuthHeader() });
  },

  async listApplicants(id, params = {}) {
    return api.get(`/admin/jobs/${id}/applicants`, { params, headers: _adminAuthHeader() });
  },

  // ── Notifications ─────────────────────────────────────────────────────────────

  async sendNotification(data) {
    return api.post('/admin/notifications/send', data, { headers: _adminAuthHeader() });
  },

  // ── Activity Logs ─────────────────────────────────────────────────────────────

  async getActivityLogs(params = {}) {
    return api.get('/admin/activity-logs', { params, headers: _adminAuthHeader() });
  },
};

// Helper — builds the admin Authorization header from localStorage
function _adminAuthHeader() {
  const token = localStorage.getItem('iw_admin_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default adminService;
