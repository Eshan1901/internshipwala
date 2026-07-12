import api from './api';

const enrollmentService = {
  // Student — enroll in a course
  async enroll(data) {
    return api.post('/enrollments', data);
  },

  // Student — my enrollments list
  async myEnrollments(params = {}) {
    return api.get('/enrollments/mine', { params });
  },

  // Student — single enrollment detail
  async getEnrollment(id) {
    return api.get(`/enrollments/${id}`);
  },

  // Student — mark module complete
  async completeModule(enrollmentId, data) {
    return api.post(`/enrollments/${enrollmentId}/complete-module`, data);
  },

  // Student — submit assignment
  async submitAssignment(enrollmentId, formData) {
    return api.post(`/enrollments/${enrollmentId}/submit-assignment`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Admin — list all enrollments
  async adminList(params = {}) {
    return api.get('/admin/enrollments', { params });
  },

  // Admin — get enrollment detail
  async adminGetEnrollment(id) {
    return api.get(`/admin/enrollments/${id}`);
  },

  // Admin — approve enrollment
  async adminApprove(id) {
    return api.patch(`/admin/enrollments/${id}/approve`);
  },

  // Admin — reject enrollment
  async adminReject(id, data) {
    return api.patch(`/admin/enrollments/${id}/reject`, data);
  },
};

export default enrollmentService;
