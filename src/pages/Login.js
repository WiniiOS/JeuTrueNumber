import { Container } from 'react-bootstrap';
import LoginForm from '../components/auth/LoginForm';

export default function Login() {
  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <h2 className="text-center mb-4">Connexion</h2>
        <LoginForm />
      </div>
    </Container>
  );
}