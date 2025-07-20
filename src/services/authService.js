import api from './api';
import { toast } from 'react-hot-toast';

const authService = {
  // Connexion utilisateur
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      // Stockage du token dans localStorage
      localStorage.setItem('token', response.data.token);
      // Retourne les données utilisateur
      return response.data.user;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur de connexion');
      throw error;
    }
  },

  // Inscription utilisateur
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      // Optionnel : connexion automatique après inscription
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      
      toast.success('Compte créé avec succès !');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur lors de l'inscription");
      throw error;
    }
  },

  // Déconnexion
  logout: () => {
    localStorage.removeItem('token');
    toast.success('Déconnexion réussie');
  },

  // Récupération du profil utilisateur
  getProfile: async () => {
    try {
      const response = await api.get('/users/me');
      return response.data;
    } catch (error) {
      // Auto-déconnexion si le token est invalide
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
      }
      throw error;
    }
  },

  // Vérification de l'état d'authentification
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  // Récupération du token
  getToken: () => {
    return localStorage.getItem('token');
  }
};

export default authService;