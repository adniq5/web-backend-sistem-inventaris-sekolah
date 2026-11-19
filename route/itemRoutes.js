const express = require('express');
const itemController = require('../controller/itemController');
const { protect, restrictTo } = require('../middleware/auth');
const { validateItem } = require('../validator/itemValidator');

const router = express.Router();

router.use(protect, restrictTo('admin'));

router.post('/', validateItem, itemController.create);
router.get('/', itemController.list);
router.get('/:id', itemController.getById);
router.patch('/:id', validateItem, itemController.update);
router.delete('/:id', itemController.archive);

module.exports = router;
