import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/stats')
      .then(res => setStats(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (d) => new Date(d).toLocaleDateString('fr-FR');

  const s = {
    page: { maxWidth: 760, margin: '2rem auto', padding: '0 1rem', fontFamily: 'sans-serif' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: '1.5rem' },
    statCard: { background: '#f8faf9', borderRadius: 12, padding: '1.25rem', textAlign: 'center', border: '1px solid #eee' },
    statNum: { fontSize: 32, fontWeight: 700, color: '#1D9E75' },
    card: { background: 'white', border: '1px solid #eee', borderRadius: 12, padding: '1.25rem', marginBottom: '1rem' },
    histRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f5f5f5', fontSize: 14 },
    badge: (p) => ({ background: p >= 80 ? '#E1F5EE' : p >= 60 ? '#FFF8E7' : '#FAECE7', color: p >= 80 ? '#0F6E56' : p >= 60 ? '#7A4F00' : '#993C1D', borderRadius: 99, padding: '3px 10px', fontSize: 12, fontWeight: 600 }),
    btn: { background: '#1D9E75', color: 'white', border: 'none', borderRadius: 8, padding: '10px 18px', cursor: 'pointer', fontSize: 14, fontWeight: 500 },
  };

  return (
    <div style={s.page}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Bonjour, {user?.nom} 👋</h1>
      <p style={{ fontSize: 14, color: '#888', marginBottom: '1.5rem' }}>
        {user?.filiere && `${user.filiere} · `}{user?.niveau && `${user.niveau} · `}Bienvenue sur ton espace de révision
      </p>

      {loading ? <p style={{ color: '#888', fontSize: 14 }}>Chargement...</p> : stats && (
        <>
          <div style={s.grid}>
            <div style={s.statCard}>
              <div style={s.statNum}>{stats.total_cours}</div>
              <div style={{ fontSize: 13, color: '#888', marginTop: 4 }}>Cours uploadés</div>
            </div>
            <div style={s.statCard}>
              <div style={s.statNum}>{stats.total_quiz}</div>
              <div style={{ fontSize: 13, color: '#888', marginTop: 4 }}>Quiz complétés</div>
            </div>
            <div style={s.statCard}>
              <div style={s.statNum}>{stats.moyenne}%</div>
              <div style={{ fontSize: 13, color: '#888', marginTop: 4 }}>Moyenne générale</div>
            </div>
          </div>

          <div style={s.card}>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: '1rem' }}>Historique des quiz</div>
            {stats.historique.length === 0 ? (
              <p style={{ fontSize: 14, color: '#aaa', textAlign: 'center', padding: '1rem 0' }}>Aucun quiz effectué pour l'instant</p>
            ) : stats.historique.map((h, i) => {
              const pct = Math.round((h.score / h.total) * 100);
              return (
                <div key={i} style={s.histRow}>
                  <div>
                    <div style={{ fontWeight: 500 }}>{h.titre}</div>
                    <div style={{ fontSize: 12, color: '#aaa', marginTop: 2 }}>{h.cours_nom} · {formatDate(h.date)}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 13, color: '#666' }}>{h.score}/{h.total}</span>
                    <span style={s.badge(pct)}>{pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>

          <button style={s.btn} onClick={() => navigate('/cours')}>Gérer mes cours →</button>
        </>
      )}
    </div>
  );
}
