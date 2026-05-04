const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://studymate-ai-kappa.vercel.app'
  ],
  credentials: true
}));

app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/cours', require('./routes/cours'));
app.use('/api/quiz', require('./routes/quiz'));
app.use('/api/dashboard', require('./routes/dashboard'));

const pool = require('./config/db');
pool.getConnection()
  .then(conn => {
    console.log('✅ Connexion MySQL réussie');
    conn.release();
  })
  .catch(err => console.error('❌ Erreur MySQL:', err.message));

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`Serveur démarré sur le port ${PORT}`));