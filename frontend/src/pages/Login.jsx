import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await api.post('/auth/login', form);
      login(res.data.token, res.data.user);
      navigate('/dashboard');
    } catch (err) {
      if (err.response?.status === 403) {
        navigate('/verifier-email', { state: { email: form.email } });
      } else {
        setError(err.response?.data?.message || 'Erreur de connexion');
      }
    } finally { setLoading(false); }
  };

  const s = {
    page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8faf9', fontFamily: 'sans-serif' },
    card: { background: 'white', borderRadius: 16, padding: '2.5rem', width: '100%', maxWidth: 420, boxShadow: '0 2px 20px rgba(0,0,0,0.06)' },
    logo: { width: 44, height: 44, background: '#1D9E75', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', fontSize: 22 },
    label: { fontSize: 13, color: '#555', display: 'block', marginBottom: 6, fontWeight: 500 },
    input: { width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14, marginBottom: '1rem', boxSizing: 'border-box', outline: 'none' },
    btn: { width: '100%', background: '#1D9E75', color: 'white', border: 'none', borderRadius: 8, padding: '11px', fontSize: 15, fontWeight: 600, cursor: 'pointer' },
    error: { background: '#FAECE7', color: '#993C1D', borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 8 },
    pwdWrap: { position: 'relative', marginBottom: '1rem' },
    pwdInput: { width: '100%', padding: '10px 44px 10px 14px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14, boxSizing: 'border-box', outline: 'none' },
    eyeBtn: { position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', display: 'flex', alignItems: 'center' },
  };

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.logo}>📚</div>
        <h1 style={{ fontSize: 22, fontWeight: 700, textAlign: 'center', marginBottom: 4 }}>Connexion</h1>
        <p style={{ fontSize: 14, color: '#888', textAlign: 'center', marginBottom: '1.5rem' }}>Bon retour sur StudyMate AI</p>

        {error && (
          <div style={s.error}>
            <span className="material-icons" style={{ fontSize: 18 }}>error_outline</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label style={s.label}>Email</label>
          <input style={s.input} type="email" placeholder="ton@email.com"
            value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />

          <label style={s.label}>Mot de passe</label>
          <div style={s.pwdWrap}>
            <input style={s.pwdInput}
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
            <button type="button" style={s.eyeBtn} onClick={() => setShowPassword(!showPassword)}>
              <span className="material-icons" style={{ fontSize: 20 }}>
                {showPassword ? 'visibility_off' : 'visibility'}
              </span>
            </button>
          </div>

          <div style={{ textAlign: 'right', marginTop: -8, marginBottom: '1rem' }}>
            <Link to="/mot-de-passe-oublie" style={{ fontSize: 13, color: '#1D9E75', textDecoration: 'none' }}>
              Mot de passe oublié ?
            </Link>
          </div>

          <button style={s.btn} type="submit" disabled={loading}>
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: 14, marginTop: '1.25rem', color: '#888' }}>
          Pas encore de compte ? <Link to="/register" style={{ color: '#1D9E75', fontWeight: 500 }}>S'inscrire</Link>
        </p>
      </div>
    </div>
  );
}