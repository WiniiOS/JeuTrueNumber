import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    setError(null);
  }, []);

  const loadUser = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const { data } = await api.get('/users/me');
      setUser(data);
    } catch (err) {
      console.error("Erreur lors du chargement de l'utilisateur :", err);
      setError(err.response?.data?.message || "Erreur d'authentification");
      logout();
    } finally {
      setLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (credentials) => {
    try {
      setLoading(true);
      const { data } = await api.post('/auth/login', credentials);
      
      localStorage.setItem('token', data.token);
      api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      setUser(data.user);
      setError(null);
    } catch (err) {
      console.error("Erreur de connexion :", err);
      setError(err.response?.data?.message || "Identifiants incorrects");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateUser = useCallback((newData) => {
    setUser(prev => ({ ...prev, ...newData }));
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    return () => {
      delete api.defaults.headers.common['Authorization'];
    };
  }, [user]);

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        loading, 
        error,
        login, 
        logout, 
        updateUser,
        setUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
};