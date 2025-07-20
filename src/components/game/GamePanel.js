import { useState, useEffect } from 'react';
import { Card, Button, Badge, Table, Alert } from 'react-bootstrap';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function GamePanel() {
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user, setUser } = useAuth();

  // Fonction pour charger l'historique
  const loadHistory = async () => {
    setHistoryLoading(true);
    try {
      const { data } = await api.get('/game/user-game-history');
      setHistory(data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors du chargement de l\'historique');
      console.error('Erreur:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  // Chargement de l'historique au montage du composant
  useEffect(() => {
    loadHistory();
  }, []);

  const playGame = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/game/play-game');
      
      if (!data || !data.result) {
        throw new Error('Réponse invalide du serveur');
      }

      // Mise à jour du solde
      setUser({...user, balance: data.newBalance});
      
      // Affichage de la notification
      toast[data.result === 'gagné' ? 'success' : 'error'](
        `Vous avez ${data.result} ! Nombre: ${data.generatedNumber}`
      );
      
      // Rechargement de l'historique après un jeu
      await loadHistory();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error(error.response?.data?.message || 'Erreur lors du jeu');
    } finally {
      setLoading(false);
    }
  };

  // Formater la date pour l'affichage
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <Card className="shadow-sm">
      <Card.Body>
        <Card.Title className="d-flex justify-content-between align-items-center mb-4">
          <span>Jeu TrueNumber</span>
          <Badge bg="primary">Solde: {user?.balance || 0} pts</Badge>
        </Card.Title>
        
        <Button 
          variant="success" 
          onClick={playGame}
          disabled={loading}
          className="w-100 mb-4"
        >
          {loading ? 'En cours...' : 'Générer un nombre'}
        </Button>

        <Card.Title>Historique des parties</Card.Title>
        
        {error && <Alert variant="danger">{error}</Alert>}
        
        {historyLoading ? (
          <div className="text-center">Chargement de l'historique...</div>
        ) : history.length === 0 ? (
          <Alert variant="info">Aucune partie jouée pour le moment</Alert>
        ) : (
          <div className="table-responsive">
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
                {history.map((game, index) => (
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
          </div>
        )}
      </Card.Body>
    </Card>
  );
}