// ============================================================
//  src/context/AuthContext.jsx
//  Provides login state to every component in the app.
//  Wrap your app with <AuthProvider> then use useAuth() anywhere.
// ============================================================
import { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser]             = useState(null);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('fbr_token');
    const saved = localStorage.getItem('fbr_user');
    if (!token) { setLoading(false); return; }

    authApi.verify()
      .then((data) => {
        setIsLoggedIn(true);
        setUser(data.user);
      })
      .catch(() => {
        localStorage.removeItem('fbr_token');
        localStorage.removeItem('fbr_user');
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const data = await authApi.login(email, password);
    localStorage.setItem('fbr_token', data.token);
    localStorage.setItem('fbr_user', JSON.stringify(data.user));
    setIsLoggedIn(true);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('fbr_token');
    localStorage.removeItem('fbr_user');
    setIsLoggedIn(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, loading, login, logout, user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);