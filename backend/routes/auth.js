const router = require('express').Router();
const { register, login, me, verifierCode, renvoyerCode } = require('../controllers/authController');
const auth = require('../middlewares/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.post('/verifier-code', verifierCode);
router.post('/renvoyer-code', renvoyerCode);
router.get('/me', auth, me);

module.exports = router;
