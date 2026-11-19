
const express = require('express');
const categoryController = require('../controller/categoryController');
const { protect, restrictTo } = require('../middleware/auth');
const { validateCategory } = require('../validator/categoryValidator');
const { validateId } = require('../validator/idValidator');

const router = express.Router();

router.use(protect, restrictTo('admin'));

router.post('/', validateCategory, categoryController.create);
router.get('/', categoryController.list);
router.get('/:id', validateId, categoryController.getById);
router.patch('/:id', validateId, validateCategory, categoryController.update);
router.delete('/:id', validateId, categoryController.archive);

module.exports = router;
