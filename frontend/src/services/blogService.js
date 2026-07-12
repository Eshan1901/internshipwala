import api from './api';

const blogService = {
  // Public — list published blog posts
  async listPosts(params = {}) {
    return api.get('/blog', { params });
  },

  // Public — get post by slug
  async getPost(slug) {
    return api.get(`/blog/${slug}`);
  },

  // Public — list blog categories
  async listCategories() {
    return api.get('/blog/categories');
  },

  // Admin — list all posts (including drafts)
  async adminList(params = {}) {
    return api.get('/admin/blog', { params });
  },

  // Admin — create post
  async adminCreate(data) {
    return api.post('/admin/blog', data);
  },

  // Admin — update post
  async adminUpdate(id, data) {
    return api.put(`/admin/blog/${id}`, data);
  },

  // Admin — soft-delete post
  async adminDelete(id) {
    return api.delete(`/admin/blog/${id}`);
  },

  // Admin — create category
  async adminCreateCategory(data) {
    return api.post('/admin/blog/categories', data);
  },
};

export default blogService;
