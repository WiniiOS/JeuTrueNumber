import { useState } from 'react';
import { Form, Button, Tabs, Tab } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import api from '../../services/api';

export default function AuthTabs() {
  // State pour les onglets
  const [activeTab, setActiveTab] = useState('login');

  // State pour le formulaire de connexion
  const [loginData, setLoginData] = useState({
    email: 'admin@highreference.com',
    password: 'Admin1234'
  });

  // State pour le formulaire d'inscription
  const [registerData, setRegisterData] = useState({
    username: '',
    email: '',
    password: '',
    phone: ''
  });

  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  // Gestion de la connexion
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { data } = await api.post('/auth/login', loginData);
      
      if (!data.token) {
        throw new Error('Pas de token reçu');
      }
      
      localStorage.setItem('token', data.token);
      await login(loginData);
      toast.success('Connexion réussie');
      
    } catch (error) {
      console.error('Erreur:', error);
      toast.error(error.response?.data?.message || 'Échec de connexion');
    } finally {
      setLoading(false);
    }
  };

  // Gestion de l'inscription
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await api.post('/auth/register', registerData);
      toast.success('Inscription réussie ! Connectez-vous');
      setActiveTab('login'); 
      
    } catch (error) {
      console.error('Erreur:', error);
      toast.error(error.response?.data?.message || 'Échec de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded bg-white" style={{ maxWidth: '500px', margin: '0 auto' }}>
      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-4"
      >
        {/* Onglet CONNEXION */}
        <Tab eventKey="login" title="Connexion">
          <Form onSubmit={handleLogin}>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={loginData.email}
                onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Mot de passe</Form.Label>
              <Form.Control
                type="password"
                value={loginData.password}
                onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                required
              />
            </Form.Group>

            <Button 
              variant="primary" 
              type="submit" 
              className="w-100"
              disabled={loading}
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </Button>
          </Form>
        </Tab>

        {/* Onglet INSCRIPTION */}
        <Tab eventKey="register" title="Inscription">
          <Form onSubmit={handleRegister}>
            <Form.Group className="mb-3">
              <Form.Label>Nom d'utilisateur</Form.Label>
              <Form.Control
                type="text"
                value={registerData.username}
                onChange={(e) => setRegisterData({...registerData, username: e.target.value})}
                required
                placeholder="john_doe"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={registerData.email}
                onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                required
                placeholder="johny@highreference.com"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Mot de passe</Form.Label>
              <Form.Control
                type="password"
                value={registerData.password}
                onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                required
                placeholder="Mindourou5"
              />
              <Form.Text className="text-muted">
                6 caractères minimum
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Téléphone</Form.Label>
              <Form.Control
                type="tel"
                value={registerData.phone}
                onChange={(e) => setRegisterData({...registerData, phone: e.target.value})}
                required
                placeholder="+237612345677"
              />
            </Form.Group>

            <Button 
              variant="success" 
              type="submit" 
              className="w-100"
              disabled={loading}
            >
              {loading ? 'Inscription...' : 'S\'inscrire'}
            </Button>
          </Form>
        </Tab>
      </Tabs>
    </div>
  );
}