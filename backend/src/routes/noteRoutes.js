const router = require('express').Router({ mergeParams: true });
const auth = require('../middleware/authMiddleware');
const controller = require('../controllers/noteController');

router.use(auth); // all note routes require a valid token

router.post('/', controller.create);
router.get('/', controller.list);
router.get('/:id', controller.get);
router.patch('/:id', controller.update);
router.delete('/:id', controller.remove);
router.post('/:id/summarize', controller.summarize);
router.post('/:id/quiz', controller.quiz);

module.exports = router;
