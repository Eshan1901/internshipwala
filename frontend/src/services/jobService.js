import api from './api';

const jobService = {
  // Public — list jobs
  async listJobs(params = {}) {
    return api.get('/jobs', { params });
  },

  // Public — job detail
  async getJob(id) {
    return api.get(`/jobs/${id}`);
  },

  // Student — apply for a job
  async apply(id, data) {
    return api.post(`/jobs/${id}/apply`, data);
  },

  // Admin — list all jobs
  async adminList(params = {}) {
    return api.get('/admin/jobs', { params });
  },

  // Admin — create job
  async adminCreate(data) {
    return api.post('/admin/jobs', data);
  },

  // Admin — update job
  async adminUpdate(id, data) {
    return api.put(`/admin/jobs/${id}`, data);
  },

  // Admin — soft-delete job
  async adminDelete(id) {
    return api.delete(`/admin/jobs/${id}`);
  },

  // Admin — list applicants for a job
  async adminListApplicants(id, params = {}) {
    return api.get(`/admin/jobs/${id}/applicants`, { params });
  },
};

export default jobService;
