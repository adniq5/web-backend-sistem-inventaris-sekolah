
const express = require('express');
const categoryController = require('../controller/categoryController');
const { protect, restrictTo } = require('../middleware/auth');
const { validateCategory } = require('../validator/categoryValidator');

const router = express.Router();

router.use(protect, restrictTo('admin'));

router.post('/', validateCategory, categoryController.create);
router.get('/', categoryController.list);
router.get('/:id', categoryController.getById);
router.patch('/:id', categoryController.update);
router.delete('/:id', categoryController.archive);

module.exports = router;
