import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function DetailCours() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cours, setCours] = useState(null);
  const [onglet, setOnglet] = useState('resume');
  const [typeResume, setTypeResume] = useState('resume');
  const [resume, setResume] = useState('');
  const [loadingResume, setLoadingResume] = useState(false);
  const [nbQuestions, setNbQuestions] = useState(5);
  const [etatQuiz, setEtatQuiz] = useState('setup');
  const [questions, setQuestions] = useState([]);
  const [quizId, setQuizId] = useState(null);
  const [curQ, setCurQ] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/cours/${id}`)
      .then(res => setCours(res.data))
      .catch(() => navigate('/cours'));
  }, [id]);

  const genererResume = async (type) => {
    setLoadingResume(true); setResume(''); setError('');
    try {
      const res = await api.post('/quiz/resumer', { coursId: parseInt(id), type });
      setResume(res.data.resume);
      setTypeResume(type);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur génération résumé');
    } finally { setLoadingResume(false); }
  };

  const genererQuiz = async () => {
    setEtatQuiz('loading'); setError('');
    try {
      const res = await api.post('/quiz/generer', { coursId: parseInt(id), nbQuestions });
      setQuestions(res.data.questions);
      setQuizId(res.data.quizId);
      setCurQ(0); setScore(0); setAnswered(false); setSelected(null);
      setEtatQuiz('play');
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur génération quiz');
      setEtatQuiz('setup');
    }
  };

  const repondre = (idx) => {
    if (answered) return;
    setAnswered(true); setSelected(idx);
    if (idx === questions[curQ].correct) setScore(s => s + 1);
  };

  const suivant = async () => {
    if (curQ + 1 >= questions.length) {
      setEtatQuiz('score');
      try { await api.post('/quiz/resultat', { quizId, score: score + (selected === questions[curQ].correct ? 1 : 0), total: questions.length }); } catch { }
    } else {
      setCurQ(q => q + 1); setAnswered(false); setSelected(null);
    }
  };

  const letters = ['A', 'B', 'C', 'D'];

  const s = {
    page: { maxWidth: 720, margin: '2rem auto', padding: '0 1rem', fontFamily: 'sans-serif' },
    card: { background: 'white', border: '1px solid #eee', borderRadius: 12, padding: '1.5rem' },
    btnGreen: { background: '#1D9E75', color: 'white', border: 'none', borderRadius: 8, padding: '9px 18px', cursor: 'pointer', fontSize: 14, fontWeight: 500 },
    btnOutline: { background: 'white', color: '#1D9E75', border: '1px solid #1D9E75', borderRadius: 8, padding: '9px 18px', cursor: 'pointer', fontSize: 14, fontWeight: 500 },
    btnGray: { background: '#f5f5f5', border: '1px solid #ddd', borderRadius: 8, padding: '9px 18px', cursor: 'pointer', fontSize: 14 },
    tab: (active) => ({ padding: '8px 16px', fontSize: 14, cursor: 'pointer', border: 'none', background: 'none', color: active ? '#1D9E75' : '#888', borderBottom: `2px solid ${active ? '#1D9E75' : 'transparent'}`, fontWeight: active ? 600 : 400, marginBottom: -1 }),
    badge: { background: '#E1F5EE', color: '#0F6E56', borderRadius: 99, padding: '4px 12px', fontSize: 12, fontWeight: 500 },
    error: { background: '#FAECE7', color: '#993C1D', borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: '1rem' },
  };

  if (!cours) return <div style={{ textAlign: 'center', padding: '4rem', color: '#888', fontFamily: 'sans-serif' }}>Chargement...</div>;

  const finalScore = score;

  return (
    <div style={s.page}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.5rem' }}>
        <button onClick={() => navigate('/cours')} style={{ ...s.btnGray, padding: '7px 14px', fontSize: 13 }}>← Retour</button>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>{cours.nom}</h1>
          <p style={{ fontSize: 13, color: '#aaa', margin: 0 }}>{cours.nom_fichier}</p>
        </div>
      </div>

      <div style={{ borderBottom: '1px solid #eee', marginBottom: '1.5rem', display: 'flex', gap: 4 }}>
        <button style={s.tab(onglet === 'resume')} onClick={() => setOnglet('resume')}>Résumé IA</button>
        <button style={s.tab(onglet === 'quiz')} onClick={() => setOnglet('quiz')}>Quiz IA</button>
      </div>

      {error && <div style={s.error}>{error}</div>}

      {/* ===== RÉSUMÉ ===== */}
      {onglet === 'resume' && (
        <div>
          <div style={{ display: 'flex', gap: 8, marginBottom: '1.25rem', flexWrap: 'wrap' }}>
            <button style={typeResume === 'resume' && resume ? s.btnGreen : s.btnOutline} onClick={() => genererResume('resume')} disabled={loadingResume}>
              Résumé complet
            </button>
            <button style={typeResume === 'fiche' && resume ? s.btnGreen : s.btnOutline} onClick={() => genererResume('fiche')} disabled={loadingResume}>
              Fiche de synthèse
            </button>
            <button style={typeResume === 'points' && resume ? s.btnGreen : s.btnOutline} onClick={() => genererResume('points')} disabled={loadingResume}>
              Points clés
            </button>
          </div>

          {loadingResume && (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#888' }}>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 12 }}>
                {[0,1,2].map(i => <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: '#1D9E75', animation: `bl 1.2s ${i*0.2}s infinite` }} />)}
              </div>
              <style>{`@keyframes bl{0%,80%,100%{opacity:.2}40%{opacity:1}}`}</style>
              Génération en cours...
            </div>
          )}

          {!loadingResume && !resume && (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#aaa', border: '1.5px dashed #eee', borderRadius: 12 }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>✨</div>
              <p>Clique sur un bouton ci-dessus pour générer un résumé de ce cours</p>
            </div>
          )}

          {!loadingResume && resume && (
            <div style={s.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #f0f0f0' }}>
                <span style={{ fontWeight: 600, fontSize: 15 }}>
                  {typeResume === 'resume' ? 'Résumé complet' : typeResume === 'fiche' ? 'Fiche de synthèse' : 'Points clés'}
                </span>
                <span style={s.badge}>{cours.nom}</span>
              </div>
              <div style={{ fontSize: 14, lineHeight: 1.8, whiteSpace: 'pre-wrap', color: '#333' }}>{resume}</div>
            </div>
          )}
        </div>
      )}

      {/* ===== QUIZ ===== */}
      {onglet === 'quiz' && (
        <div>
          {etatQuiz === 'setup' && (
            <div style={s.card}>
              <h2 style={{ fontSize: 17, fontWeight: 600, marginBottom: '1rem' }}>Générer un quiz depuis ce cours</h2>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ fontSize: 13, color: '#666', display: 'block', marginBottom: 6 }}>Nombre de questions</label>
                <select value={nbQuestions} onChange={e => setNbQuestions(parseInt(e.target.value))}
                  style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14, width: 120 }}>
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={15}>15</option>
                </select>
              </div>
              <button onClick={genererQuiz} style={s.btnGreen}>Générer le quiz</button>
            </div>
          )}

          {etatQuiz === 'loading' && (
            <div style={{ textAlign: 'center', padding: '4rem', color: '#888' }}>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 12 }}>
                {[0,1,2].map(i => <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: '#1D9E75', animation: `bl 1.2s ${i*0.2}s infinite` }} />)}
              </div>
              Génération des questions depuis ton cours...
            </div>
          )}

          {etatQuiz === 'play' && questions.length > 0 && (() => {
            const q = questions[curQ];
            const pct = Math.round((curQ / questions.length) * 100);
            return (
              <div>
                <div style={{ height: 4, background: '#eee', borderRadius: 2, marginBottom: '1.25rem' }}>
                  <div style={{ height: '100%', width: pct + '%', background: '#1D9E75', borderRadius: 2, transition: 'width .3s' }} />
                </div>
                <div style={s.card}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <span style={s.badge}>{cours.nom}</span>
                    <span style={{ fontSize: 13, color: '#888' }}>{curQ + 1} / {questions.length}</span>
                  </div>
                  <p style={{ fontSize: 15, fontWeight: 500, lineHeight: 1.6, marginBottom: '1.25rem' }}>{q.question}</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: '1rem' }}>
                    {q.options.map((opt, i) => {
                      let bg = '#f8f8f8', border = '1px solid #eee';
                      if (answered) {
                        if (i === q.correct) { bg = '#E1F5EE'; border = '1px solid #1D9E75'; }
                        else if (i === selected && i !== q.correct) { bg = '#FAECE7'; border = '1px solid #D85A30'; }
                      }
                      return (
                        <div key={i} onClick={() => repondre(i)}
                          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: bg, border, borderRadius: 8, cursor: answered ? 'default' : 'pointer', fontSize: 14, transition: 'all .15s' }}>
                          <span style={{ width: 24, height: 24, borderRadius: 6, background: 'white', border: '1px solid #ddd', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 500, flexShrink: 0 }}>
                            {letters[i]}
                          </span>
                          {opt}
                        </div>
                      );
                    })}
                  </div>
                  {answered && (
                    <div style={{ background: '#E1F5EE', borderLeft: '3px solid #1D9E75', padding: '10px 14px', borderRadius: '0 8px 8px 0', fontSize: 13, color: '#085041', marginBottom: '1rem' }}>
                      {q.explanation}
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 13, color: answered ? (selected === q.correct ? '#0F6E56' : '#993C1D') : 'transparent' }}>
                      {answered ? (selected === q.correct ? '✓ Correct !' : '✗ Incorrect') : '.'}
                    </span>
                    {answered && (
                      <button onClick={suivant} style={s.btnGreen}>
                        {curQ + 1 >= questions.length ? 'Voir les résultats →' : 'Suivant →'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}

          {etatQuiz === 'score' && (
            <div style={{ ...s.card, textAlign: 'center', padding: '2.5rem' }}>
              <div style={{ fontSize: 56, fontWeight: 700, color: '#1D9E75' }}>{finalScore}/{questions.length}</div>
              <div style={{ fontSize: 15, color: '#888', marginTop: 4 }}>Score final</div>
              <p style={{ margin: '1rem 0 1.5rem', fontSize: 15 }}>
                {Math.round((finalScore / questions.length) * 100) >= 80 ? '🎉 Excellent ! Tu maîtrises bien ce cours.' :
                 Math.round((finalScore / questions.length) * 100) >= 60 ? '👍 Bon résultat, quelques points à revoir.' :
                 '📖 Continue à réviser, tu progresses !'}
              </p>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                <button onClick={() => { setEtatQuiz('setup'); setScore(0); }} style={s.btnGray}>Nouveau quiz</button>
                <button onClick={() => navigate('/dashboard')} style={s.btnGreen}>Tableau de bord</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
