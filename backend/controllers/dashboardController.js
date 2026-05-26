const pool = require('../config/db');

exports.stats = async (req, res) => {
  const userId = req.user.id;
  try {
    const [[{ total_cours }]] = await pool.query(
      'SELECT COUNT(*) AS total_cours FROM cours WHERE user_id = ?', [userId]
    );
    const [[{ total_quiz }]] = await pool.query(
      'SELECT COUNT(*) AS total_quiz FROM quiz_resultats WHERE user_id = ?', [userId]
    );
    const [[{ moyenne }]] = await pool.query(
      'SELECT ROUND(AVG(score / total * 100)) AS moyenne FROM quiz_resultats WHERE user_id = ?', [userId]
    );
    const [historique] = await pool.query(
      `SELECT qr.score, qr.total, qr.date, q.titre, c.nom AS cours_nom
       FROM quiz_resultats qr
       JOIN quiz q ON qr.quiz_id = q.id
       JOIN cours c ON q.cours_id = c.id
       WHERE qr.user_id = ?
       ORDER BY qr.date DESC LIMIT 10`,
      [userId]
    );
    const [progression] = await pool.query(
      `SELECT DATE(date) AS jour, ROUND(AVG(score / total * 100)) AS score_moyen
       FROM quiz_resultats WHERE user_id = ?
       GROUP BY DATE(date) ORDER BY jour ASC LIMIT 14`,
      [userId]
    );

    res.json({ total_cours, total_quiz, moyenne: moyenne || 0, historique, progression });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};