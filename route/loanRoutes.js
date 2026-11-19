const express = require('express');
const loanController = require('../controller/loanController');
const { protect, restrictTo } = require('../middleware/auth');
const { validateLoan, validateRejection, validateBorrow } = require('../validator/loanValidator');
const { validateId } = require('../validator/idValidator');

const router = express.Router();

router.use(protect, restrictTo('user', 'admin'));

router.post('/', restrictTo('user'), validateLoan, loanController.create);
router.get('/', loanController.list);
router.get('/my', restrictTo('user'), loanController.my);
router.get('/:id', validateId, loanController.getById);
router.patch('/:id/approve', restrictTo('admin'), validateId, loanController.approve);
router.patch('/:id/reject', restrictTo('admin'), validateId, validateRejection, loanController.reject);
router.patch('/:id/borrow', restrictTo('admin'), validateId, validateBorrow, loanController.borrow);
router.patch('/:id/mark-overdue', restrictTo('admin'), validateId, loanController.markOverdue);

module.exports = router;
