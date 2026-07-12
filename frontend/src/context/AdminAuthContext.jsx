import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import adminService from '../services/adminService';

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('iw_admin_token'));
  const [loading, setLoading] = useState(true);

  const isAdminAuthenticated = !!token && !!admin;

  const loadAdmin = useCallback(async () => {
    if (!token) { setLoading(false); return; }
    try {
      const res = await adminService.getMe();
      setAdmin(res.data);
      localStorage.setItem('iw_admin', JSON.stringify(res.data));
    } catch {
      localStorage.removeItem('iw_admin_token');
      localStorage.removeItem('iw_admin');
      setToken(null);
      setAdmin(null);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    const cached = localStorage.getItem('iw_admin');
    if (cached && token) {
      try { setAdmin(JSON.parse(cached)); } catch {}
    }
    loadAdmin();
  }, [loadAdmin, token]);

  const adminLogin = async (credentials) => {
    const response = await adminService.login(credentials);
    const newToken = response.data?.token;
    if (newToken) {
      setToken(newToken);
      const me = await adminService.getMe();
      setAdmin(me.data);
      localStorage.setItem('iw_admin', JSON.stringify(me.data));
    }
    return response;
  };

  const adminLogout = () => {
    adminService.logout();
    setToken(null);
    setAdmin(null);
  };

  return (
    <AdminAuthContext.Provider value={{ admin, token, isAdminAuthenticated, loading, adminLogin, adminLogout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return ctx;
}

export default AdminAuthContext;
