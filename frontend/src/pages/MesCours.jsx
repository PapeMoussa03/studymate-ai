import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const Modal = ({ message, onConfirm, onCancel, type = 'danger' }) => (
  <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
    <div style={{ background: 'white', borderRadius: 16, padding: '2rem', maxWidth: 400, width: '90%', boxShadow: '0 8px 32px rgba(0,0,0,0.12)', textAlign: 'center' }}>
      <span className="material-icons" style={{ fontSize: 48, color: type === 'danger' ? '#D85A30' : '#1D9E75', marginBottom: 12 }}>
        {type === 'danger' ? 'delete_forever' : 'check_circle'}
      </span>
      <p style={{ fontSize: 15, fontWeight: 500, marginBottom: '1.5rem', color: '#333' }}>{message}</p>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
        <button onClick={onCancel} style={{ background: '#f5f5f5', border: '1px solid #ddd', borderRadius: 8, padding: '9px 20px', cursor: 'pointer', fontSize: 14, fontWeight: 500 }}>
          Annuler
        </button>
        <button onClick={onConfirm} style={{ background: type === 'danger' ? '#D85A30' : '#1D9E75', color: 'white', border: 'none', borderRadius: 8, padding: '9px 20px', cursor: 'pointer', fontSize: 14, fontWeight: 500 }}>
          {type === 'danger' ? 'Supprimer' : 'Confirmer'}
        </button>
      </div>
    </div>
  </div>
);

const Toast = ({ message, type, onClose }) => (
  <div style={{
    position: 'fixed', bottom: 24, right: 24, zIndex: 2000,
    background: type === 'success' ? '#1D9E75' : '#D85A30',
    color: 'white', borderRadius: 10, padding: '12px 20px',
    display: 'flex', alignItems: 'center', gap: 10,
    boxShadow: '0 4px 16px rgba(0,0,0,0.15)', fontSize: 14, fontWeight: 500,
    animation: 'slideIn 0.3s ease'
  }}>
    <span className="material-icons" style={{ fontSize: 20 }}>
      {type === 'success' ? 'check_circle' : 'error'}
    </span>
    {message}
    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', marginLeft: 8, display: 'flex' }}>
      <span className="material-icons" style={{ fontSize: 18 }}>close</span>
    </button>
    <style>{`@keyframes slideIn{from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}}`}</style>
  </div>
);

export default function MesCours() {
  const [cours, setCours] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [renameId, setRenameId] = useState(null);
  const [renameVal, setRenameVal] = useState('');
  const [deleteModal, setDeleteModal] = useState(null);
  const [toast, setToast] = useState(null);
  const fileRef = useRef();
  const navigate = useNavigate();

  useEffect(() => { fetchCours(); }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchCours = async () => {
    try { const res = await api.get('/cours'); setCours(res.data); }
    catch { showToast('Erreur lors du chargement', 'error'); }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const form = new FormData();
    form.append('fichier', file);
    form.append('nom', file.name.replace(/\.[^.]+$/, ''));
    try {
      await api.post('/cours/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      await fetchCours();
      showToast('Cours uploadé avec succès !');
    } catch (err) {
      showToast(err.response?.data?.message || 'Erreur upload', 'error');
    } finally {
      setUploading(false);
      fileRef.current.value = '';
    }
  };

  const handleRename = async (id) => {
    if (!renameVal.trim()) return;
    try {
      await api.put(`/cours/${id}/rename`, { nom: renameVal });
      setRenameId(null); setRenameVal('');
      await fetchCours();
      showToast('Cours renommé avec succès !');
    } catch { showToast('Erreur lors du renommage', 'error'); }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/cours/${id}`);
      setDeleteModal(null);
      await fetchCours();
      showToast('Cours supprimé avec succès !');
    } catch { showToast('Erreur lors de la suppression', 'error'); }
  };

  const formatSize = (b) => b < 1024 * 1024 ? Math.round(b / 1024) + ' Ko' : (b / 1024 / 1024).toFixed(1) + ' Mo';
  const formatDate = (d) => new Date(d).toLocaleDateString('fr-FR');

  const s = {
    page: { maxWidth: 700, margin: '2rem auto', padding: '0 1rem', fontFamily: 'sans-serif' },
    btnGreen: { background: '#1D9E75', color: 'white', border: 'none', borderRadius: 8, padding: '9px 18px', cursor: 'pointer', fontSize: 14, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 },
    item: { background: 'white', border: '1px solid #eee', borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 },
  };

  return (
    <div style={s.page}>
      {deleteModal && (
        <Modal
          message={`Supprimer "${deleteModal.nom}" ? Les quiz associés seront aussi supprimés.`}
          onConfirm={() => handleDelete(deleteModal.id)}
          onCancel={() => setDeleteModal(null)}
          type="danger"
        />
      )}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>Mes cours</h1>
        <button style={s.btnGreen} onClick={() => fileRef.current.click()} disabled={uploading}>
          <span className="material-icons" style={{ fontSize: 20 }}>upload_file</span>
          {uploading ? 'Upload...' : 'Ajouter un cours'}
        </button>
      </div>
      <input type="file" ref={fileRef} accept=".pdf,.txt" style={{ display: 'none' }} onChange={handleUpload} />

      {cours.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#aaa', border: '1.5px dashed #ddd', borderRadius: 12 }}>
          <span className="material-icons" style={{ fontSize: 56, color: '#ddd', display: 'block', marginBottom: 12 }}>folder_open</span>
          <p style={{ fontWeight: 500, fontSize: 15 }}>Aucun cours uploadé</p>
          <p style={{ fontSize: 13, marginTop: 6 }}>Formats acceptés : PDF, TXT · Max 10 Mo</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {cours.map(c => (
            <div key={c.id} style={s.item}>
              <div style={{ width: 40, height: 40, background: '#E1F5EE', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span className="material-icons" style={{ color: '#1D9E75', fontSize: 22 }}>description</span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                {renameId === c.id ? (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input value={renameVal} onChange={e => setRenameVal(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleRename(c.id)}
                      style={{ flex: 1, padding: '6px 10px', borderRadius: 6, border: '1px solid #1D9E75', fontSize: 14, outline: 'none' }} autoFocus />
                    <button onClick={() => handleRename(c.id)}
                      style={{ background: '#1D9E75', color: 'white', border: 'none', borderRadius: 6, padding: '6px 14px', cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>
                      Sauvegarder
                    </button>
                    <button onClick={() => setRenameId(null)}
                      style={{ background: '#f5f5f5', border: '1px solid #ddd', borderRadius: 6, padding: '6px 10px', cursor: 'pointer', fontSize: 13 }}>
                      Annuler
                    </button>
                  </div>
                ) : (
                  <div style={{ fontWeight: 500, fontSize: 15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.nom}</div>
                )}
                <div style={{ fontSize: 12, color: '#aaa', marginTop: 3, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="material-icons" style={{ fontSize: 14 }}>straighten</span>{formatSize(c.taille)}
                  <span className="material-icons" style={{ fontSize: 14 }}>calendar_today</span>{formatDate(c.created_at)}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                <button onClick={() => navigate(`/cours/${c.id}`)}
                  style={{ background: '#1D9E75', color: 'white', border: 'none', borderRadius: 8, padding: '7px 14px', cursor: 'pointer', fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span className="material-icons" style={{ fontSize: 16 }}>open_in_new</span>
                  Ouvrir
                </button>
                <button onClick={() => { setRenameId(c.id); setRenameVal(c.nom); }}
                  title="Renommer"
                  style={{ background: '#f0f9ff', border: '1px solid #bde0ff', borderRadius: 8, padding: '7px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: '#0066cc' }}>
                  <span className="material-icons" style={{ fontSize: 16 }}>edit</span>
                  Renommer
                </button>
                <button onClick={() => setDeleteModal({ id: c.id, nom: c.nom })}
                  title="Supprimer"
                  style={{ background: '#fff0ee', border: '1px solid #fcc', borderRadius: 8, padding: '7px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: '#D85A30' }}>
                  <span className="material-icons" style={{ fontSize: 16 }}>delete</span>
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}