import { Container } from 'react-bootstrap';
import UserManagement from '../components/admin/UserManagement';

export default function Admin() {
  return (
    <Container className="mt-4">
      <h1 className="mb-4">Espace Administrateur</h1>
      <UserManagement />
    </Container>
  );
}