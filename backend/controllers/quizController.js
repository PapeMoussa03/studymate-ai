const pool = require('../config/db');
const https = require('https');

const groqRequest = (prompt, maxTokens = 2000) => {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: prompt }]
    });

    const options = {
      hostname: 'api.groq.com',
      path: '/openai/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Length': Buffer.byteLength(body)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          console.log('GROQ RESPONSE:', JSON.stringify(parsed).slice(0, 300));
          resolve(parsed);
        } catch (e) {
          console.error('GROQ PARSE ERROR:', data);
          reject(e);
        }
      });
    });

    req.on('error', (e) => {
      console.error('GROQ REQUEST ERROR:', e);
      reject(e);
    });
    req.write(body);
    req.end();
  });
};

exports.generer = async (req, res) => {
  const { coursId, nbQuestions = 5 } = req.body;
  if (!coursId) return res.status(400).json({ message: 'coursId requis' });

  try {
    const [[cours]] = await pool.query(
      'SELECT * FROM cours WHERE id = ? AND user_id = ?',
      [coursId, req.user.id]
    );
    if (!cours) return res.status(404).json({ message: 'Cours introuvable' });

    const contenu = cours.contenu_texte.slice(0, 10000);

    const prompt = `Tu es un professeur. À partir du cours suivant, génère exactement ${nbQuestions} questions de QCM.
Les questions doivent porter UNIQUEMENT sur le contenu du cours fourni.
Réponds UNIQUEMENT en JSON valide, sans texte avant ou après, sans balises markdown :
{"questions":[{"question":"...","options":["A. ...","B. ...","C. ...","D. ..."],"correct":0,"explanation":"..."}]}
correct = index (0-3) de la bonne réponse. Explication courte en français.

Cours :
${contenu}`;

    const data = await groqRequest(prompt, 2000);

    if (data.error) {
      console.error('GROQ API ERROR:', data.error);
      return res.status(500).json({ message: 'Erreur API Groq', error: data.error.message });
    }

    const raw = data.choices[0].message.content.trim().replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(raw);

    const [result] = await pool.query(
      'INSERT INTO quiz (user_id, cours_id, titre, questions_json) VALUES (?, ?, ?, ?)',
      [req.user.id, coursId, `Quiz — ${cours.nom}`, JSON.stringify(parsed.questions)]
    );

    res.status(201).json({
      quizId: result.insertId,
      titre: `Quiz — ${cours.nom}`,
      questions: parsed.questions
    });
  } catch (err) {
    console.error('ERREUR GENERER:', err);
    res.status(500).json({ message: 'Erreur génération quiz', error: err.message });
  }
};

exports.resumer = async (req, res) => {
  const { coursId, type = 'resume' } = req.body;
  if (!coursId) return res.status(400).json({ message: 'coursId requis' });

  try {
    const [[cours]] = await pool.query(
      'SELECT * FROM cours WHERE id = ? AND user_id = ?',
      [coursId, req.user.id]
    );
    if (!cours) return res.status(404).json({ message: 'Cours introuvable' });

    const contenu = cours.contenu_texte.slice(0, 10000);

    const prompts = {
      resume: `Fais un résumé complet et structuré de ce cours en français. Utilise des titres clairs, identifie les thèmes principaux. Sois clair et pédagogique.\n\nCours :\n${contenu}`,
      fiche: `Génère une fiche de synthèse en français avec : définitions clés, concepts essentiels, points importants à retenir, exemples. Format structuré avec emojis pour les sections.\n\nCours :\n${contenu}`,
      points: `Extrais uniquement les points clés et notions essentielles à retenir de ce cours en français. Format liste structurée et concise.\n\nCours :\n${contenu}`
    };

    const data = await groqRequest(prompts[type] || prompts.resume, 1500);

    if (data.error) {
      console.error('GROQ API ERROR:', data.error);
      return res.status(500).json({ message: 'Erreur API Groq', error: data.error.message });
    }

    const contenuResume = data.choices[0].message.content.trim();
    res.json({ resume: contenuResume, type, coursNom: cours.nom });
  } catch (err) {
    console.error('ERREUR RESUMER:', err);
    res.status(500).json({ message: 'Erreur génération résumé', error: err.message });
  }
};

exports.sauvegarderResultat = async (req, res) => {
  const { quizId, score, total } = req.body;
  if (quizId === undefined || score === undefined || total === undefined)
    return res.status(400).json({ message: 'quizId, score et total requis' });

  try {
    await pool.query(
      'INSERT INTO quiz_resultats (quiz_id, user_id, score, total) VALUES (?, ?, ?, ?)',
      [quizId, req.user.id, score, total]
    );
    res.status(201).json({ message: 'Résultat sauvegardé' });
  } catch (err) {
    console.error('ERREUR RESULTAT:', err);
    res.status(500).json({ message: 'Erreur sauvegarde', error: err.message });
  }
};

exports.historique = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT qr.id, qr.score, qr.total, qr.date, q.titre, c.nom AS cours_nom
       FROM quiz_resultats qr
       JOIN quiz q ON qr.quiz_id = q.id
       JOIN cours c ON q.cours_id = c.id
       WHERE qr.user_id = ?
       ORDER BY qr.date DESC LIMIT 20`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    console.error('ERREUR HISTORIQUE:', err);
    res.status(500).json({ message: 'Erreur historique', error: err.message });
  }
};