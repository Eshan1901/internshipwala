import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';
import userService from '../services/userService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState({ id: 'dummy-student-id', full_name: 'Test Student', email: 'student@test.com' });
  const [token, setToken] = useState('dummy-student-token');
  const [loading, setLoading] = useState(false);

  const isAuthenticated = !!token && !!user;

  // Load user profile on mount if token exists
  const loadUser = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const response = await userService.getProfile();
      setUser(response.data);
      localStorage.setItem('iw_user', JSON.stringify(response.data));
    } catch {
      // Token expired or invalid
      localStorage.removeItem('iw_token');
      localStorage.removeItem('iw_user');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    // Try cached user first for fast render
    const cachedUser = localStorage.getItem('iw_user');
    if (cachedUser && token) {
      try {
        setUser(JSON.parse(cachedUser));
      } catch {
        // ignore parse errors
      }
    }
    // loadUser(); // Bypassed for Mock Mode
  }, [loadUser, token]);

  const login = async (credentials) => {
    const response = await authService.login(credentials);
    const newToken = response.data.token;
    setToken(newToken);
    localStorage.setItem('iw_token', newToken);
    // Load user profile
    try {
      const profileResponse = await userService.getProfile();
      setUser(profileResponse.data);
      localStorage.setItem('iw_user', JSON.stringify(profileResponse.data));
    } catch {
      // Profile load failed — user might not be verified
      setUser(response.data.user || { email: credentials.email });
    }
    return response;
  };

  const logout = () => {
    authService.logout();
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedData) => {
    setUser((prev) => {
      const merged = { ...prev, ...updatedData };
      localStorage.setItem('iw_user', JSON.stringify(merged));
      return merged;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        loading,
        login,
        logout,
        updateUser,
        loadUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
