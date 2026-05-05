import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

export default function MotDePasseOublie() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await api.post('/auth/mot-de-passe-oublie', { email });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur serveur');
    } finally { setLoading(false); }
  };

  const s = {
    page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8faf9', fontFamily: 'sans-serif' },
    card: { background: 'white', borderRadius: 16, padding: '2.5rem', width: '100%', maxWidth: 420, boxShadow: '0 2px 20px rgba(0,0,0,0.06)', textAlign: 'center' },
    btn: { width: '100%', background: '#1D9E75', color: 'white', border: 'none', borderRadius: 8, padding: '11px', fontSize: 15, fontWeight: 600, cursor: 'pointer', marginBottom: '1rem' },
    error: { background: '#FAECE7', color: '#993C1D', borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 8 },
    success: { background: '#E1F5EE', color: '#0F6E56', borderRadius: 12, padding: '1.5rem', marginBottom: '1rem' },
    input: { width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14, marginBottom: '1rem', boxSizing: 'border-box', outline: 'none', textAlign: 'left' },
  };

  return (
    <div style={s.page}>
      <div style={s.card}>
        <span className="material-icons" style={{ fontSize: 48, color: '#1D9E75', marginBottom: 12 }}>lock_reset</span>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Mot de passe oublié</h1>

        {!sent ? (
          <>
            <p style={{ fontSize: 14, color: '#888', marginBottom: '1.5rem', lineHeight: 1.6 }}>
              Saisis ton adresse email. On va t'envoyer un code pour réinitialiser ton mot de passe.
            </p>
            {error && (
              <div style={s.error}>
                <span className="material-icons" style={{ fontSize: 18 }}>error_outline</span>
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <input style={s.input} type="email" placeholder="ton@email.com"
                value={email} onChange={e => setEmail(e.target.value)} required />
              <button style={s.btn} type="submit" disabled={loading}>
                {loading ? 'Envoi...' : 'Envoyer le code'}
              </button>
            </form>
          </>
        ) : (
          <div style={s.success}>
            <span className="material-icons" style={{ fontSize: 36, color: '#1D9E75', marginBottom: 8 }}>mark_email_read</span>
            <p style={{ fontWeight: 600, marginBottom: 6 }}>Email envoyé !</p>
            <p style={{ fontSize: 13, color: '#555' }}>Vérifie ta boîte mail et suis les instructions pour réinitialiser ton mot de passe.</p>
          </div>
        )}

        <Link to="/login" style={{ fontSize: 13, color: '#1D9E75', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
          <span className="material-icons" style={{ fontSize: 16 }}>arrow_back</span>
          Retour à la connexion
        </Link>
      </div>
    </div>
  );
}