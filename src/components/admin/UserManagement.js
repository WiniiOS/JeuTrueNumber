import { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Alert, Badge, Tab, Nav, Card, Spinner } from 'react-bootstrap';
import api from '../../services/api';
import { toast } from 'react-hot-toast';

export default function AdminDashboard() {
  // Mes États principaux
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [gameHistory, setGameHistory] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState({
    users: true,
    history: false,
    userDetails: false
  });

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
    role: 'client'
  });

  const [error, setError] = useState('');

  // Chargeons les données initiales
  useEffect(() => {
    fetchUsers();
  }, []);

  // Chargeons tous les utilisateurs
  const fetchUsers = async () => {
    setLoading(prev => ({ ...prev, users: true }));
    try {
      const { data } = await api.get('/users');
      setUsers(data);
    } catch (error) {
      toast.error('Erreur de chargement des utilisateurs');
    } finally {
      setLoading(prev => ({ ...prev, users: false }));
    }
  };

  // Chargement de l'historique complet
  const fetchGameHistory = async () => {
    setLoading(prev => ({ ...prev, history: true }));
    try {
      const { data } = await api.get('/game/all-history');
      setGameHistory(data);
    } catch (error) {
      toast.error('Erreur de chargement de l\'historique');
    } finally {
      setLoading(prev => ({ ...prev, history: false }));
    }
  };

  // Chargement des détails d'un utilisateur
  const fetchUserDetails = async (userId) => {
    setLoading(prev => ({ ...prev, userDetails: true }));
    try {
      const { data } = await api.get(`/users/${userId}`);
      setSelectedUser(data);
      setActiveTab('userDetails');
    } catch (error) {
      toast.error('Erreur de chargement des détails');
    } finally {
      setLoading(prev => ({ ...prev, userDetails: false }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Gestion des utilisateurs (CRUD)
  const handleDelete = async (userId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return;
    
    try {
      await api.delete(`/users/${userId}`);
      setUsers(users.filter(user => user._id !== userId));
      toast.success('Utilisateur supprimé avec succès');
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      phone: user.phone,
      password: '',
      role: user.role
    });
    setShowModal(true);
  };

  const handleCreate = () => {
    setSelectedUser(null);
    setFormData({
      username: '',
      email: '',
      phone: '',
      password: '',
      role: 'client'
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (selectedUser) {
        await api.put(`/users/${selectedUser._id}`, formData);
        toast.success('Utilisateur mis à jour avec succès');
      } else {
        await api.post('/users', formData);
        toast.success('Utilisateur créé avec succès');
      }
      setShowModal(false);
      fetchUsers();
      if (selectedUser) fetchUserDetails(selectedUser._id);
    } catch (error) {
      setError(error.response?.data?.message || 'Une erreur est survenue');
    }
  };

  const toggleRole = async (userId) => {
    try {
      const user = users.find(u => u._id === userId);
      const newRole = user.role === 'admin' ? 'client' : 'admin';
      
      await api.put(`/users/${userId}`, { role: newRole });
      toast.success(`Rôle changé en ${newRole}`);
      fetchUsers();
      if (selectedUser?._id === userId) {
        fetchUserDetails(userId);
      }
    } catch (error) {
      toast.error('Erreur lors du changement de rôle');
    }
  };

  // Formater la date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="admin-dashboard">
      <h2 className="mb-4">Tableau de bord administrateur</h2>

      <Tab.Container activeKey={activeTab} onSelect={setActiveTab}>
        <Nav variant="tabs">
          <Nav.Item>
            <Nav.Link eventKey="users">Utilisateurs</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="history" onClick={fetchGameHistory}>
              Historique des parties
            </Nav.Link>
          </Nav.Item>
          {selectedUser && (
            <Nav.Item>
              <Nav.Link eventKey="userDetails">
                Détails utilisateur
              </Nav.Link>
            </Nav.Item>
          )}
        </Nav>

        <Tab.Content className="mt-3">
          {/* Onglet Utilisateurs */}
          <Tab.Pane eventKey="users">
            <div className="d-flex justify-content-between mb-3">
              <Button variant="primary" onClick={handleCreate}>
                Créer un nouvel utilisateur
              </Button>
            </div>

            {loading.users ? (
              <div className="text-center">
                <Spinner animation="border" />
              </div>
            ) : (
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Téléphone</th>
                    <th>Rôle</th>
                    <th>Solde</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user._id}>
                      <td>{user.username}</td>
                      <td>{user.email}</td>
                      <td>{user.phone}</td>
                      <td>
                        <Badge bg={user.role === 'admin' ? 'success' : 'primary'}>
                          {user.role}
                        </Badge>
                      </td>
                      <td>{user.balance} pts</td>
                      <td className="d-flex gap-2">
                        <Button 
                          variant="info" 
                          size="sm" 
                          onClick={() => fetchUserDetails(user._id)}
                        >
                          Détails
                        </Button>
                        <Button 
                          variant="warning" 
                          size="sm" 
                          onClick={() => handleEdit(user)}
                        >
                          Modifier
                        </Button>
                        <Button 
                          variant={user.role === 'admin' ? 'primary' : 'success'} 
                          size="sm"
                          onClick={() => toggleRole(user._id)}
                        >
                          {user.role === 'admin' ? 'Client' : 'Admin'}
                        </Button>
                        <Button 
                          variant="danger" 
                          size="sm" 
                          onClick={() => handleDelete(user._id)}
                        >
                          Supprimer
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Tab.Pane>

          {/* Onglet Historique */}
          <Tab.Pane eventKey="history">
            {loading.history ? (
              <div className="text-center">
                <Spinner animation="border" />
              </div>
            ) : (
              <div className="table-responsive">
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Utilisateur</th>
                      <th>Nombre</th>
                      <th>Résultat</th>
                      <th>Variation</th>
                      <th>Nouveau solde</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gameHistory.map((game, index) => (
                      
                      <tr key={index}>
                        <td>{formatDate(game.date)}</td>
                        <td>
                          <Button 
                            variant="link" 
                            onClick={() => fetchUserDetails(game.user._id)}
                            className="p-0"
                          >
                            {game.user?.username || 'Utilisateur supprimé'}
                          </Button>
                        </td>
                        <td>{game.generatedNumber}</td>
                        <td>
                          <Badge bg={game.result === 'gagné' ? 'success' : 'danger'}>
                            {game.result}
                          </Badge>
                        </td>
                        <td className={game.balanceChange >= 0 ? 'text-success' : 'text-danger'}>
                          {game.balanceChange > 0 ? '+' : ''}{game.balanceChange}
                        </td>
                        <td>{game.newBalance} pts</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
          </Tab.Pane>

          {/* Onglet Détails Utilisateur */}
          {selectedUser && (
            <Tab.Pane eventKey="userDetails">
              {loading.userDetails ? (
                <div className="text-center">
                  <Spinner animation="border" />
                </div>
              ) : (
                <div>
                  <Card className="mb-4">
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <Card.Title>
                            {selectedUser.username}
                            <Badge bg={selectedUser.role === 'admin' ? 'success' : 'primary'} className="ms-2">
                              {selectedUser.role}
                            </Badge>
                          </Card.Title>
                          <Card.Subtitle className="mb-2 text-muted">
                            {selectedUser.email}
                          </Card.Subtitle>
                          <div className="mt-2">
                            <strong>Téléphone:</strong> {selectedUser.phone}
                          </div>
                          <div>
                            <strong>Solde actuel:</strong> {selectedUser.balance} points
                          </div>
                        </div>
                        <div>
                          <Button 
                            variant="warning" 
                            onClick={() => handleEdit(selectedUser)}
                            className="me-2"
                          >
                            Modifier
                          </Button>
                          <Button 
                            variant={selectedUser.role === 'admin' ? 'primary' : 'success'}
                            onClick={() => toggleRole(selectedUser._id)}
                          >
                            {selectedUser.role === 'admin' ? 'Rendre Client' : 'Rendre Admin'}
                          </Button>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>

                  <h4 className="mb-3">Historique des parties</h4>
                  {selectedUser.gameHistory?.length > 0 ? (
                    <Table striped bordered hover>
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Nombre</th>
                          <th>Résultat</th>
                          <th>Variation</th>
                          <th>Nouveau solde</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedUser.gameHistory.map((game, index) => (
                          <tr key={index}>
                            <td>{formatDate(game.date)}</td>
                            <td>{game.generatedNumber}</td>
                            <td>
                              <Badge bg={game.result === 'gagné' ? 'success' : 'danger'}>
                                {game.result}
                              </Badge>
                            </td>
                            <td className={game.balanceChange >= 0 ? 'text-success' : 'text-danger'}>
                              {game.balanceChange > 0 ? '+' : ''}{game.balanceChange}
                            </td>
                            <td>{game.newBalance} pts</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  ) : (
                    <Alert variant="info">Cet utilisateur n'a encore joué aucune partie.</Alert>
                  )}
                </div>
              )}
            </Tab.Pane>
          )}
        </Tab.Content>
      </Tab.Container>

      {/* Modal pour créer/modifier un utilisateur */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedUser ? 'Modifier utilisateur' : 'Créer un nouvel utilisateur'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            {error && <Alert variant="danger">{error}</Alert>}
            
            <div className="row">
              <Form.Group className="mb-3 col-md-6">
                <Form.Label>Username</Form.Label>
                <Form.Control
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange} 
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3 col-md-6">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
        </Form.Group>
            </div>

            <div className="row">
              <Form.Group className="mb-3 col-md-6">
                <Form.Label>Téléphone</Form.Label>
                <Form.Control
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3 col-md-6">
                <Form.Label>Rôle</Form.Label>
                <Form.Select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="client">Client</option>
                  <option value="admin">Administrateur</option>
                </Form.Select>
              </Form.Group>
            </div>

            <Form.Group className="mb-3">
              <Form.Label>
                {selectedUser ? 'Nouveau mot de passe (laisser vide pour ne pas changer)' : 'Mot de passe'}
              </Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required={!selectedUser}
                minLength={6}
              />
            </Form.Group>
            
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Annuler
            </Button>
            <Button variant="primary" type="submit">
              {selectedUser ? 'Mettre à jour' : 'Créer'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}