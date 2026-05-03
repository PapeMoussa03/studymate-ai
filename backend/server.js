const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/cours', require('./routes/cours'));
app.use('/api/quiz', require('./routes/quiz'));
app.use('/api/dashboard', require('./routes/dashboard'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}`));
