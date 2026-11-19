const express = require('express');
const itemController = require('../controller/itemController');
const { protect, restrictTo } = require('../middleware/auth');
const { validateItem } = require('../validator/itemValidator');
const { validateItemQuery } = require('../validator/itemQueryValidator');
const { validateId } = require('../validator/idValidator');

const router = express.Router();

router.use(protect, restrictTo('admin'));

router.post('/', validateItem, itemController.create);
router.get('/', validateItemQuery, itemController.list);
router.get('/:id', validateId, itemController.getById);
router.patch('/:id', validateId, validateItem, itemController.update);
router.delete('/:id', validateId, itemController.archive);

module.exports = router;
