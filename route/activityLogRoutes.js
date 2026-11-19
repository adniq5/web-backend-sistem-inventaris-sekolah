const express = require('express');
const activityLogController = require('../controller/activityLogController');
const { protect, restrictTo } = require('../middleware/auth');
const { validateActivityLogQuery } = require('../validator/activityLogValidator');

const router = express.Router();

router.get('/', protect, restrictTo('admin'), validateActivityLogQuery, activityLogController.list);

module.exports = router;
