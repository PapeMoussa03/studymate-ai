const pool = require('../config/db');
const pdfParse = require('pdf-parse');
const fs = require('fs');
const path = require('path');

exports.upload = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'Aucun fichier reçu' });

  const filePath = req.file.path;
  const ext = path.extname(req.file.originalname).toLowerCase();
  let contenu = '';

  try {
    if (ext === '.pdf') {
      const buffer = fs.readFileSync(filePath);
      const data = await pdfParse(buffer);
      contenu = data.text;
    } else {
      contenu = fs.readFileSync(filePath, 'utf-8');
    }

    const nom = req.body.nom || req.file.originalname.replace(/\.[^.]+$/, '');
    const [result] = await pool.query(
      'INSERT INTO cours (user_id, nom, contenu_texte, nom_fichier, taille) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, nom, contenu, req.file.originalname, req.file.size]
    );

    fs.unlinkSync(filePath);

    res.status(201).json({
      message: 'Cours uploadé avec succès',
      cours: { id: result.insertId, nom, taille: req.file.size }
    });
  } catch (err) {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    res.status(500).json({ message: 'Erreur lors du traitement', error: err.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, nom, nom_fichier, taille, created_at FROM cours WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const [[cours]] = await pool.query(
      'SELECT * FROM cours WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (!cours) return res.status(404).json({ message: 'Cours introuvable' });
    res.json(cours);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

exports.rename = async (req, res) => {
  const { nom } = req.body;
  if (!nom) return res.status(400).json({ message: 'Nouveau nom requis' });

  try {
    const [result] = await pool.query(
      'UPDATE cours SET nom = ? WHERE id = ? AND user_id = ?',
      [nom, req.params.id, req.user.id]
    );
    if (result.affectedRows === 0)
      return res.status(404).json({ message: 'Cours introuvable' });
    res.json({ message: 'Cours renommé' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM cours WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (result.affectedRows === 0)
      return res.status(404).json({ message: 'Cours introuvable' });
    res.json({ message: 'Cours supprimé' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};
