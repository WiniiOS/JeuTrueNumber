import { Container, Nav, Navbar, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function NavbarComponent() {
  const { user, logout } = useAuth();

  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand as={Link} to="/">TrueNumber</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {user && <Nav.Link as={Link} to="/">Jeu</Nav.Link>}
            {user?.role === 'admin' && (
              <Nav.Link as={Link} to="/admin">Admin</Nav.Link>
            )}
          </Nav>
          <Nav>
            {user ? (
              <Button variant="outline-light" onClick={logout}>Déconnexion</Button>
            ) : (
              <Nav.Link as={Link} to="/login">Connexion</Nav.Link>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}