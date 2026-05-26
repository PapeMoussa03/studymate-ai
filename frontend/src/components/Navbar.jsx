import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  if (!user) return null;

  const handleLogout = () => { logout(); navigate('/login'); };

  const linkStyle = (path) => ({
    textDecoration: 'none',
    fontSize: 14,
    fontWeight: 500,
    color: pathname === path ? '#1D9E75' : '#555',
    padding: '6px 12px',
    borderRadius: 8,
    background: pathname === path ? '#E1F5EE' : 'transparent',
  });

  return (
    <nav style={{
      background: 'white',
      borderBottom: '1px solid #eee',
      padding: '0 1.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: 56,
      fontFamily: 'sans-serif',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 30, height: 30, background: '#1D9E75', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>📚</div>
        <span style={{ fontWeight: 700, fontSize: 16 }}>StudyMate AI</span>
      </div>
      <div style={{ display: 'flex', gap: 4 }}>
        <Link to="/dashboard" style={linkStyle('/dashboard')}>Dashboard</Link>
        <Link to="/cours" style={linkStyle('/cours')}>Mes cours</Link>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 13, fontWeight: 500 }}>{user.nom}</div>
          {user.filiere && <div style={{ fontSize: 11, color: '#aaa' }}>{user.filiere} · {user.niveau}</div>}
        </div>
        <button onClick={handleLogout} style={{ background: 'none', border: '1px solid #ddd', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', fontSize: 13, color: '#555' }}>
          Déconnexion
        </button>
      </div>
    </nav>
  );
}