import api from './api';

const paymentService = {
  // Student — my payment history
  async myPayments(params = {}) {
    return api.get('/payments/mine', { params });
  },

  // Admin — list all payments
  async adminList(params = {}) {
    return api.get('/admin/payments', { params });
  },

  // Admin — confirm payment
  async adminConfirm(id, data) {
    return api.post(`/admin/payments/${id}/confirm`, data);
  },

  // Admin — reject payment
  async adminReject(id, data) {
    return api.post(`/admin/payments/${id}/reject`, data);
  },

  // Admin — initiate refund
  async adminRefund(id, data) {
    return api.post(`/admin/payments/${id}/refund`, data);
  },
};

export default paymentService;
