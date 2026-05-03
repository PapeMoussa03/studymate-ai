const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mailer = require('../config/mailer');

const genererCode = () => Math.floor(100000 + Math.random() * 900000).toString();

const envoyerCodeEmail = async (email, nom, code) => {
  await mailer.sendMail({
    from: `"StudyMate AI" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: 'Votre code de vérification StudyMate',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:2rem">
        <h2 style="color:#1D9E75">Bienvenue sur StudyMate AI, ${nom} !</h2>
        <p>Voici ton code de vérification :</p>
        <div style="font-size:36px;font-weight:700;letter-spacing:8px;color:#1D9E75;padding:1rem;background:#E1F5EE;border-radius:8px;text-align:center;margin:1.5rem 0">
          ${code}
        </div>
        <p style="color:#888;font-size:13px">Ce code expire dans 15 minutes. Si tu n'as pas créé de compte, ignore cet email.</p>
      </div>
    `
  });
};

exports.register = async (req, res) => {
  const { nom, email, password, universite, filiere, niveau } = req.body;
  if (!nom || !email || !password)
    return res.status(400).json({ message: 'Nom, email et mot de passe requis' });

  try {
    const [existing] = await pool.query('SELECT id, nom, email_verifie FROM users WHERE email = ?', [email]);

    if (existing.length > 0) {
      if (existing[0].email_verifie)
        return res.status(409).json({ message: 'Cet email est déjà utilisé' });
      const code = genererCode();
      const expiration = new Date(Date.now() + 15 * 60 * 1000);
      await pool.query(
        'UPDATE users SET code_verification = ?, code_expiration = ? WHERE email = ?',
        [code, expiration, email]
      );
      await envoyerCodeEmail(email, existing[0].nom, code);
      return res.status(200).json({ message: 'Code renvoyé', email });
    }

    const hash = await bcrypt.hash(password, 10);
    const code = genererCode();
    const expiration = new Date(Date.now() + 15 * 60 * 1000);

    await pool.query(
      'INSERT INTO users (nom, email, password_hash, universite, filiere, niveau, code_verification, code_expiration) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [nom, email, hash, universite || null, filiere || null, niveau || null, code, expiration]
    );

    await envoyerCodeEmail(email, nom, code);
    res.status(201).json({ message: 'Inscription réussie, vérifie ton email', email });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

exports.verifierCode = async (req, res) => {
  const { email, code } = req.body;
  if (!email || !code)
    return res.status(400).json({ message: 'Email et code requis' });

  try {
    const [[user]] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });
    if (user.email_verifie) return res.status(400).json({ message: 'Email déjà vérifié' });
    if (user.code_verification !== code)
      return res.status(400).json({ message: 'Code incorrect' });
    if (new Date() > new Date(user.code_expiration))
      return res.status(400).json({ message: 'Code expiré, demande un nouveau code' });

    await pool.query(
      'UPDATE users SET email_verifie = 1, code_verification = NULL, code_expiration = NULL WHERE id = ?',
      [user.id]
    );

    const token = jwt.sign(
      { id: user.id, nom: user.nom, email: user.email, filiere: user.filiere, niveau: user.niveau },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token, user: { id: user.id, nom: user.nom, email: user.email, filiere: user.filiere, niveau: user.niveau } });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

exports.renvoyerCode = async (req, res) => {
  const { email } = req.body;
  try {
    const [[user]] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });
    if (user.email_verifie) return res.status(400).json({ message: 'Email déjà vérifié' });

    const code = genererCode();
    const expiration = new Date(Date.now() + 15 * 60 * 1000);
    await pool.query(
      'UPDATE users SET code_verification = ?, code_expiration = ? WHERE id = ?',
      [code, expiration, user.id]
    );
    await envoyerCodeEmail(email, user.nom, code);
    res.json({ message: 'Nouveau code envoyé' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: 'Email et mot de passe requis' });

  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0)
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });

    const user = rows[0];
    if (!user.email_verifie)
      return res.status(403).json({ message: 'Email non vérifié', email });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid)
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });

    const token = jwt.sign(
      { id: user.id, nom: user.nom, email: user.email, filiere: user.filiere, niveau: user.niveau },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token, user: { id: user.id, nom: user.nom, email: user.email, filiere: user.filiere, niveau: user.niveau } });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

exports.me = async (req, res) => res.json({ user: req.user });
