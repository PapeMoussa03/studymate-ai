import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

const FILIERES = ['Médecine générale', 'Pharmacie', 'Odontologie', 'Santé', 'Informatique', 'Droit', 'Économie', 'Gestion', 'Lettres', 'Autre'];
const NIVEAUX = ['L1', 'L2', 'L3', 'M1', 'M2', 'Doctorat'];

export default function Register() {
  const [form, setForm] = useState({ nom: '', email: '', password: '', confirm: '', universite: '', filiere: '', niveau: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return setError('Mot de passe minimum 6 caractères');
    if (form.password !== form.confirm) return setError('Les mots de passe ne correspondent pas');
    setLoading(true); setError('');
    try {
      await api.post('/auth/register', { nom: form.nom, email: form.email, password: form.password, universite: form.universite, filiere: form.filiere, niveau: form.niveau });
      navigate('/verifier-email', { state: { email: form.email } });
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur inscription');
    } finally { setLoading(false); }
  };

  const s = {
    page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8faf9', fontFamily: 'sans-serif', padding: '2rem 1rem' },
    card: { background: 'white', borderRadius: 16, padding: '2.5rem', width: '100%', maxWidth: 460, boxShadow: '0 2px 20px rgba(0,0,0,0.06)' },
    logo: { width: 44, height: 44, background: '#1D9E75', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', fontSize: 22 },
    title: { fontSize: 22, fontWeight: 700, textAlign: 'center', marginBottom: 4 },
    sub: { fontSize: 14, color: '#888', textAlign: 'center', marginBottom: '1.5rem' },
    label: { fontSize: 13, color: '#555', display: 'block', marginBottom: 6, fontWeight: 500 },
    input: { width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14, marginBottom: '1rem', boxSizing: 'border-box', outline: 'none' },
    select: { width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14, marginBottom: '1rem', boxSizing: 'border-box', background: 'white' },
    row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
    divider: { borderTop: '1px solid #f0f0f0', margin: '1.25rem 0 1rem', textAlign: 'center', position: 'relative' },
    dividerText: { position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', background: 'white', padding: '0 10px', fontSize: 12, color: '#aaa' },
    btn: { width: '100%', background: '#1D9E75', color: 'white', border: 'none', borderRadius: 8, padding: '11px', fontSize: 15, fontWeight: 600, cursor: 'pointer', marginTop: 4 },
    error: { background: '#FAECE7', color: '#993C1D', borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: '1rem' },
  };

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.logo}>📚</div>
        <h1 style={s.title}>Créer un compte</h1>
        <p style={s.sub}>Rejoins StudyMate AI</p>
        {error && <div style={s.error}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <label style={s.label}>Nom complet</label>
          <input style={s.input} type="text" placeholder="Ton nom complet" value={form.nom} onChange={e => set('nom', e.target.value)} required />

          <label style={s.label}>Email</label>
          <input style={s.input} type="email" placeholder="ton@email.com" value={form.email} onChange={e => set('email', e.target.value)} required />

          <label style={s.label}>Université / École</label>
          <input style={s.input} type="text" placeholder="Ex: UCAD, ESP, UASZ..." value={form.universite} onChange={e => set('universite', e.target.value)} />

          <div style={s.row}>
            <div>
              <label style={s.label}>Filière</label>
              <select style={s.select} value={form.filiere} onChange={e => set('filiere', e.target.value)}>
                <option value="">Choisir...</option>
                {FILIERES.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label style={s.label}>Niveau</label>
              <select style={s.select} value={form.niveau} onChange={e => set('niveau', e.target.value)}>
                <option value="">Choisir...</option>
                {NIVEAUX.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          </div>

          <div style={s.divider}><span style={s.dividerText}>Sécurité</span></div>

          <label style={s.label}>Mot de passe</label>
          <input style={s.input} type="password" placeholder="Minimum 6 caractères" value={form.password} onChange={e => set('password', e.target.value)} required />

          <label style={s.label}>Confirmer le mot de passe</label>
          <input style={{ ...s.input, borderColor: form.confirm && form.confirm !== form.password ? '#D85A30' : '#ddd' }}
            type="password" placeholder="Répète ton mot de passe" value={form.confirm} onChange={e => set('confirm', e.target.value)} required />
          {form.confirm && form.confirm !== form.password && (
            <p style={{ fontSize: 12, color: '#D85A30', marginTop: -10, marginBottom: 12 }}>Les mots de passe ne correspondent pas</p>
          )}

          <button style={s.btn} type="submit" disabled={loading}>
            {loading ? 'Inscription...' : 'Créer mon compte'}
          </button>
        </form>
        <p style={{ textAlign: 'center', fontSize: 14, marginTop: '1.25rem', color: '#888' }}>
          Déjà un compte ? <Link to="/login" style={{ color: '#1D9E75', fontWeight: 500 }}>Se connecter</Link>
        </p>
      </div>
    </div>
  );
}
