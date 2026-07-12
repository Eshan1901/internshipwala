import api from './api';

const certificateService = {
  // Student — my certificates
  async myCertificates() {
    return api.get('/certificates/mine');
  },

  // Student — download certificate
  async download(id) {
    return api.get(`/certificates/${id}/download`, { responseType: 'blob' });
  },

  // Public — verify certificate by number
  async verify(certNumber) {
    return api.get(`/certificates/verify/${certNumber}`);
  },

  // Admin — list all certificates
  async adminList(params = {}) {
    return api.get('/admin/certificates', { params });
  },

  // Admin — approve certificate
  async adminApprove(id) {
    return api.post(`/admin/certificates/${id}/approve`);
  },

  // Admin — update hard copy status
  async adminUpdateHardCopy(id, data) {
    return api.patch(`/admin/certificates/${id}/hard-copy`, data);
  },
};

export default certificateService;
