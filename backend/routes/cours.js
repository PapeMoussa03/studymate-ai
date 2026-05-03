const router = require('express').Router();
const auth = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');
const ctrl = require('../controllers/coursController');

router.use(auth);
router.post('/upload', upload.single('fichier'), ctrl.upload);
router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getOne);
router.put('/:id/rename', ctrl.rename);
router.delete('/:id', ctrl.remove);

module.exports = router;
