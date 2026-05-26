const router = require('express').Router();
const auth = require('../middlewares/authMiddleware');
const { stats } = require('../controllers/dashboardController');

router.get('/stats', auth, stats);

module.exports = router;