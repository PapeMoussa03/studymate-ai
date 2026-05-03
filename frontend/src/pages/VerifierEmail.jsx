import { useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function VerifierEmail() {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const inputs = useRef([]);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { state } = useLocation();
  const email = state?.email;

  if (!email) { navigate('/register'); return null; }

  const handleChange = (i, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...code];
    next[i] = val;
    setCode(next);
    if (val && i < 5) inputs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !code[i] && i > 0) inputs.current[i - 1]?.focus();
  };

  const handleVerify = async () => {
    const fullCode = code.join('');
    if (fullCode.length < 6) return setError('Saisis les 6 chiffres');
    setLoading(true); setError('');
    try {
      const res = await api.post('/auth/verifier-code', { email, code: fullCode });
      login(res.data.token, res.data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Code invalide');
      setCode(['', '', '', '', '', '']);
      inputs.current[0]?.focus();
    } finally { setLoading(false); }
  };

  const handleResend = async () => {
    setError(''); setSuccess('');
    try {
      await api.post('/auth/renvoyer-code', { email });
      setSuccess('Nouveau code envoyé !');
      setCode(['', '', '', '', '', '']);
      inputs.current[0]?.focus();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur');
    }
  };

  const s = {
    page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8faf9', fontFamily: 'sans-serif' },
    card: { background: 'white', borderRadius: 16, padding: '2.5rem', width: '100%', maxWidth: 420, boxShadow: '0 2px 20px rgba(0,0,0,0.06)', textAlign: 'center' },
    btn: { width: '100%', background: '#1D9E75', color: 'white', border: 'none', borderRadius: 8, padding: '11px', fontSize: 15, fontWeight: 600, cursor: 'pointer', marginBottom: '1rem' },
    error: { background: '#FAECE7', color: '#993C1D', borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: '1rem' },
    success: { background: '#E1F5EE', color: '#0F6E56', borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: '1rem' },
  };

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>📧</div>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Vérifie ton email</h1>
        <p style={{ fontSize: 14, color: '#888', marginBottom: '2rem', lineHeight: 1.6 }}>
          On a envoyé un code à 6 chiffres à<br /><strong>{email}</strong><br />Il expire dans 15 minutes.
        </p>
        {error && <div style={s.error}>{error}</div>}
        {success && <div style={s.success}>{success}</div>}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: '1.5rem' }}>
          {code.map((c, i) => (
            <input key={i} ref={el => inputs.current[i] = el}
              style={{ width: 48, height: 56, fontSize: 24, fontWeight: 700, textAlign: 'center', borderRadius: 10, border: `2px solid ${c ? '#1D9E75' : '#ddd'}`, outline: 'none', fontFamily: 'sans-serif' }}
              type="text" inputMode="numeric" maxLength={1} value={c}
              onChange={e => handleChange(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)} />
          ))}
        </div>
        <button style={s.btn} onClick={handleVerify} disabled={loading}>
          {loading ? 'Vérification...' : 'Vérifier le code'}
        </button>
        <p style={{ fontSize: 13, color: '#888' }}>
          Code non reçu ?{' '}
          <span onClick={handleResend} style={{ color: '#1D9E75', cursor: 'pointer', fontWeight: 500 }}>Renvoyer un code</span>
        </p>
      </div>
    </div>
  );
}
