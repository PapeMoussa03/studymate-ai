import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function MesCours() {
  const [cours, setCours] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [renameId, setRenameId] = useState(null);
  const [renameVal, setRenameVal] = useState('');
  const [error, setError] = useState('');
  const fileRef = useRef();
  const navigate = useNavigate();

  useEffect(() => { fetchCours(); }, []);

  const fetchCours = async () => {
    try { const res = await api.get('/cours'); setCours(res.data); }
    catch { setError('Erreur chargement'); }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true); setError('');
    const form = new FormData();
    form.append('fichier', file);
    form.append('nom', file.name.replace(/\.[^.]+$/, ''));
    try {
      await api.post('/cours/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      await fetchCours();
    } catch (err) { setError(err.response?.data?.message || 'Erreur upload'); }
    finally { setUploading(false); fileRef.current.value = ''; }
  };

  const handleRename = async (id) => {
    if (!renameVal.trim()) return;
    try { await api.put(`/cours/${id}/rename`, { nom: renameVal }); setRenameId(null); setRenameVal(''); await fetchCours(); }
    catch { setError('Erreur renommage'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce cours ? Les quiz associés seront aussi supprimés.')) return;
    try { await api.delete(`/cours/${id}`); await fetchCours(); }
    catch { setError('Erreur suppression'); }
  };

  const formatSize = (b) => b < 1024 * 1024 ? Math.round(b / 1024) + ' Ko' : (b / 1024 / 1024).toFixed(1) + ' Mo';
  const formatDate = (d) => new Date(d).toLocaleDateString('fr-FR');

  const s = {
    page: { maxWidth: 700, margin: '2rem auto', padding: '0 1rem', fontFamily: 'sans-serif' },
    btnGreen: { background: '#1D9E75', color: 'white', border: 'none', borderRadius: 8, padding: '9px 18px', cursor: 'pointer', fontSize: 14, fontWeight: 500 },
    error: { background: '#FAECE7', color: '#993C1D', borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: '1rem' },
    item: { background: 'white', border: '1px solid #eee', borderRadius: 10, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 },
  };

  return (
    <div style={s.page}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>Mes cours</h1>
        <button style={s.btnGreen} onClick={() => fileRef.current.click()} disabled={uploading}>
          {uploading ? 'Upload...' : '+ Ajouter un cours'}
        </button>
      </div>
      <input type="file" ref={fileRef} accept=".pdf,.txt" style={{ display: 'none' }} onChange={handleUpload} />
      {error && <div style={s.error}>{error}</div>}

      {cours.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#aaa', border: '1.5px dashed #ddd', borderRadius: 12 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📂</div>
          <p style={{ fontWeight: 500 }}>Aucun cours uploadé</p>
          <p style={{ fontSize: 13, marginTop: 6 }}>Formats acceptés : PDF, TXT · Max 10 Mo</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {cours.map(c => (
            <div key={c.id} style={s.item}>
              <div style={{ width: 36, height: 36, background: '#E1F5EE', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>📄</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                {renameId === c.id ? (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input value={renameVal} onChange={e => setRenameVal(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleRename(c.id)}
                      style={{ flex: 1, padding: '5px 10px', borderRadius: 6, border: '1px solid #ccc', fontSize: 14 }} autoFocus />
                    <button onClick={() => handleRename(c.id)} style={{ background: '#1D9E75', color: 'white', border: 'none', borderRadius: 6, padding: '5px 12px', cursor: 'pointer', fontSize: 13 }}>OK</button>
                    <button onClick={() => setRenameId(null)} style={{ background: '#eee', border: 'none', borderRadius: 6, padding: '5px 10px', cursor: 'pointer', fontSize: 13 }}>✕</button>
                  </div>
                ) : (
                  <div style={{ fontWeight: 500, fontSize: 15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.nom}</div>
                )}
                <div style={{ fontSize: 12, color: '#aaa', marginTop: 3 }}>{formatSize(c.taille)} · {formatDate(c.created_at)}</div>
              </div>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                <button onClick={() => navigate(`/cours/${c.id}`)}
                  style={{ background: '#1D9E75', color: 'white', border: 'none', borderRadius: 6, padding: '6px 14px', cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>
                  Ouvrir
                </button>
                <button onClick={() => { setRenameId(c.id); setRenameVal(c.nom); }}
                  style={{ background: '#f5f5f5', border: '1px solid #ddd', borderRadius: 6, padding: '6px 10px', cursor: 'pointer', fontSize: 13 }}>✏️</button>
                <button onClick={() => handleDelete(c.id)}
                  style={{ background: '#fff0ee', border: '1px solid #fcc', borderRadius: 6, padding: '6px 10px', cursor: 'pointer', fontSize: 13 }}>🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
