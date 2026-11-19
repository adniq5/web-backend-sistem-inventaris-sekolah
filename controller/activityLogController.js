const mongoose = require('mongoose');
const ActivityLog = require('../model/ActivityLog');
const AppError = require('../util/AppError');
const catchAsync = require('../util/catchAsync');

const allowedActions = [
  'login',
  'create_category',
  'create_item',
  'submit_loan',
  'approve_loan',
  'reject_loan',
  'return_item',
  'submit_return',
  'verify_return',
  'external'
];

exports.list = catchAsync(async (req, res, next) => {
  const {
    action,
    actor,
    page = '1',
    limit = '20'
  } = req.query;

  if (action !== undefined && !allowedActions.includes(action)) {
    return next(new AppError('Jenis aktivitas tidak valid.', 400));
  }

  if (actor !== undefined && !mongoose.isValidObjectId(actor)) {
    return next(new AppError('ID pelaku aktivitas tidak valid.', 400));
  }

  const pageNumber = Number.parseInt(page, 10);
  const limitNumber = Number.parseInt(limit, 10);
  if (!Number.isInteger(pageNumber) || pageNumber < 1) {
    return next(new AppError('Parameter page harus berupa bilangan bulat minimal 1.', 400));
  }
  if (!Number.isInteger(limitNumber) || limitNumber < 1 || limitNumber > 100) {
    return next(new AppError('Parameter limit harus berupa bilangan bulat antara 1 dan 100.', 400));
  }

  const filter = {};
  if (action) filter.action = action;
  if (actor) filter.actor = actor;

  const [logs, total] = await Promise.all([
    ActivityLog.find(filter)
      .populate('actor', 'name email role')
      .sort({ created_at: -1 })
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber),
    ActivityLog.countDocuments(filter)
  ]);

  res.status(200).json({
    status: 'success',
    results: logs.length,
    pagination: {
      page: pageNumber,
      limit: limitNumber,
      total,
      totalPages: Math.ceil(total / limitNumber)
    },
    data: { activityLogs: logs }
  });
});
