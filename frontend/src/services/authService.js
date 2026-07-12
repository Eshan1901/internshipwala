import api from './api';

const authService = {
  async register(data) {
    return api.post('/auth/register', data);
  },

  async verifyOtp(data) {
    return api.post('/auth/verify-otp', data);
  },

  async resendOtp(email, purpose = 'registration') {
    return api.post('/auth/resend-otp', { email, purpose });
  },

  async login(credentials) {
    const response = await api.post('/auth/login', credentials);
    if (response.data?.token) {
      localStorage.setItem('iw_token', response.data.token);
    }
    return response;
  },

  async adminLogin(credentials) {
    return api.post('/auth/admin/login', credentials);
  },

  async forgotPassword(email) {
    return api.post('/auth/forgot-password', { email });
  },

  async resetPassword(data) {
    return api.post('/auth/reset-password', data);
  },

  async changePassword(data) {
    return api.put('/auth/change-password', data);
  },

  logout() {
    localStorage.removeItem('iw_token');
    localStorage.removeItem('iw_user');
  },
};

export default authService;
