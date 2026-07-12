import api from './api';

const userService = {
  async getProfile() {
    return api.get('/user/profile');
  },

  async updateProfile(data) {
    return api.put('/user/profile', data);
  },

  async uploadPhoto(file) {
    const formData = new FormData();
    formData.append('profile_photo', file);
    return api.post('/user/profile/photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export default userService;
