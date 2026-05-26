# StudyMate AI

Application web de révision intelligente pour étudiants.
Upload tes cours → Génère des résumés et quiz automatiquement avec l'IA.

## Stack
- **Frontend** : React + Vite
- **Backend** : Node.js + Express
- **Base de données** : MySQL
- **Auth** : JWT + vérification email (Gmail)
- **IA** : Groq (gratuit)

---

## Installation

### Prérequis
- Node.js v18+
- WampServer (MySQL)
- Un compte Groq (https://console.groq.com) — gratuit
- Un compte Gmail avec mot de passe d'application

---

### Étape 1 — Base de données

```bash
mysql -u root -p
SOURCE C:/chemin/vers/studymate.sql
```

---

### Étape 2 — Backend

```bash
cd backend
npm install
copy .env.example .env
mkdir uploads
```

Remplis `backend/.env` :
```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=studymate
JWT_SECRET=studymate_secret_key_2024
GROQ_API_KEY=gsk_...
API_LIMIT_PER_DAY=10
GMAIL_USER=ton.email@gmail.com
GMAIL_PASS=xxxxxxxxxxxx
FRONTEND_URL=http://localhost:5173
```

> **Mot de passe Gmail** : Compte Google → Sécurité → Validation 2 étapes → Mots de passe des applications

```bash
npm run dev
```

---

### Étape 3 — Frontend

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

Ouvre http://localhost:5173

---

## Fonctionnalités

1. **Inscription** avec vérification email (code 6 chiffres)
2. **Upload** de cours PDF ou TXT
3. **Résumé IA** — résumé complet, fiche de synthèse, points clés
4. **Quiz IA** — questions générées depuis le contenu du cours
5. **Dashboard** — scores, historique, moyenne générale

## Limites
- 10 requêtes IA / utilisateur / jour (modifiable → `API_LIMIT_PER_DAY`)
- Fichiers : PDF, TXT · Max 10 Mo