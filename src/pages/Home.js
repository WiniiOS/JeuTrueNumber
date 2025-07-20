import { Container } from 'react-bootstrap';
import GamePanel from '../components/game/GamePanel';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user } = useAuth();

  return (
    <Container className="mt-4">
      <h1 className="mb-4">Bienvenue sur TrueNumber</h1>
      {user && <GamePanel />}
    </Container>
  );
}