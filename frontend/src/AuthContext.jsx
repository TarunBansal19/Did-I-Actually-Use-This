import { createContext, useContext, useState, useEffect } from 'react';
import { auth as authApi } from './api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const access = localStorage.getItem('access');
    if (access) {
      const timeout = setTimeout(() => setLoading(false), 5000);
      authApi.me()
        .then((u) => setUser({ username: u.username, id: u.id }))
        .catch(() => {
          localStorage.removeItem('access');
          localStorage.removeItem('refresh');
        })
        .finally(() => {
          clearTimeout(timeout);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (username, password) => {
    const data = await authApi.login(username, password);
    localStorage.setItem('access', data.access);
    localStorage.setItem('refresh', data.refresh);
    const u = await authApi.me();
    setUser({ username: u.username, id: u.id });
    return data;
  };

  const register = async (username, password, email) => {
    const data = await authApi.register(username, password, email);
    localStorage.setItem('access', data.access);
    localStorage.setItem('refresh', data.refresh);
    setUser({ username: data.user.username, id: data.user.id });
    return data;
  };

  const logout = () => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
