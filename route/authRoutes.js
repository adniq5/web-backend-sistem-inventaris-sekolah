const express = require('express');
const authController = require('../controller/authController');
const { protect, restrictTo } = require('../middleware/auth');
const { validateRegister, validateLogin } = require('../validator/authValidator');

const router = express.Router();
router.post('/register', validateRegister, authController.register);
router.post('/login', validateLogin, authController.login);
router.get('/me', protect, restrictTo('user', 'admin'), authController.me);

module.exports = router;
