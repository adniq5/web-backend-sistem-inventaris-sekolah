const express = require('express');
const loanController = require('../controller/loanController');
const { protect, restrictTo } = require('../middleware/auth');
const { validateLoan, validateRejection } = require('../validator/loanValidator');

const router = express.Router();

router.use(protect, restrictTo('user', 'admin'));

router.post('/', restrictTo('user'), validateLoan, loanController.create);
router.get('/', loanController.list);
router.get('/:id', loanController.getById);
router.patch('/:id/approve', restrictTo('admin'), loanController.approve);
router.patch('/:id/reject', restrictTo('admin'), validateRejection, loanController.reject);

module.exports = router;
