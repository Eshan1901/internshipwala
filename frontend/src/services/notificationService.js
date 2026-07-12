import api from './api';

const notificationService = {
  // Student — list notifications (paginated)
  async list(params = {}) {
    return api.get('/notifications', { params });
  },

  // Student — mark single notification as read
  async markRead(id) {
    return api.put(`/notifications/${id}/read`);
  },

  // Student — mark all notifications as read
  async markAllRead() {
    return api.put('/notifications/read-all');
  },

  // Admin — send notification to user(s)
  async adminSend(data) {
    return api.post('/admin/notifications/send', data);
  },
};

export default notificationService;
