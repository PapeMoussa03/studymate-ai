const pool = require('../config/db');

module.exports = async (req, res, next) => {
  const userId = req.user.id;
  const today = new Date().toISOString().slice(0, 10);
  const limit = parseInt(process.env.API_LIMIT_PER_DAY) || 10;

  try {
    await pool.query(
      'INSERT INTO api_usage (user_id, date, nb_requetes) VALUES (?, ?, 1) ON DUPLICATE KEY UPDATE nb_requetes = nb_requetes + 1',
      [userId, today]
    );
    const [[usage]] = await pool.query(
      'SELECT nb_requetes FROM api_usage WHERE user_id = ? AND date = ?',
      [userId, today]
    );
    if (usage.nb_requetes > limit)
      return res.status(429).json({ message: `Limite journalière de ${limit} requêtes atteinte. Reviens demain !` });
    next();
  } catch (err) {
    res.status(500).json({ message: 'Erreur limite API', error: err.message });
  }
};