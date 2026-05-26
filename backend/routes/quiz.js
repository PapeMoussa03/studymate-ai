const router = require('express').Router();
const auth = require('../middlewares/authMiddleware');
const limit = require('../middlewares/limitMiddleware');
const ctrl = require('../controllers/quizController');

router.use(auth);
router.post('/generer', limit, ctrl.generer);
router.post('/resumer', limit, ctrl.resumer);
router.post('/resultat', ctrl.sauvegarderResultat);
router.get('/historique', ctrl.historique);

module.exports = router;