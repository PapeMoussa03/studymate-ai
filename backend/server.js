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

const db = require('./config/db');
db.query('SELECT 1')
  .then(() => console.log('✅ Connexion MySQL réussie'))
  .catch(err => console.error('❌ Erreur MySQL:', err.message));

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`Serveur démarré sur le port ${PORT}`));