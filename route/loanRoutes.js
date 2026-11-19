const express = require('express');
const loanController = require('../controller/loanController');
const { protect, restrictTo } = require('../middleware/auth');
const { validateLoan, validateRejection, validateBorrow } = require('../validator/loanValidator');

const router = express.Router();

router.use(protect, restrictTo('user', 'admin'));

router.post('/', restrictTo('user'), validateLoan, loanController.create);
router.get('/', loanController.list);
router.get('/my', restrictTo('user'), loanController.my);
router.get('/:id', loanController.getById);
router.patch('/:id/approve', restrictTo('admin'), loanController.approve);
router.patch('/:id/reject', restrictTo('admin'), validateRejection, loanController.reject);
router.patch('/:id/borrow', restrictTo('admin'), validateBorrow, loanController.borrow);
router.patch('/:id/mark-overdue', restrictTo('admin'), loanController.markOverdue);

module.exports = router;
