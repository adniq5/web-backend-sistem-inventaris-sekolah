const express = require('express');
const returnController = require('../controller/returnController');
const { protect, restrictTo } = require('../middleware/auth');
const { validateReturn } = require('../validator/returnValidator');

const router = express.Router();

router.use(protect, restrictTo('user', 'admin'));

router.post('/', restrictTo('user'), validateReturn, returnController.create);
router.get('/my', restrictTo('user'), returnController.my);
router.get('/', restrictTo('admin'), returnController.list);
router.patch('/:id/verify', restrictTo('admin'), returnController.verify);
router.get('/:id', restrictTo('user', 'admin'), returnController.getById);

module.exports = router;
