const express = require('express');
const activityLogController = require('../controller/activityLogController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, restrictTo('admin'), activityLogController.list);

module.exports = router;
