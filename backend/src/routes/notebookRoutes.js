const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const controller = require('../controllers/notebookController');

router.use(auth); // every route below requires a valid token
router.post('/', controller.create);
router.get('/', controller.list);
router.patch('/:id', controller.update);
router.delete('/:id', controller.remove);

module.exports = router;