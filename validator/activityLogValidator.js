const AppError = require('../util/AppError');
const { query, validationResult } = require('express-validator');

const allowedActions = [
  'login',
  'create_category',
  'create_item',
  'submit_loan',
  'approve_loan',
  'reject_loan',
  'submit_return',
  'verify_return',
  'external'
];

async function validateActivityLogQuery(req, res, next) {
  await Promise.all([
    query('action').optional().isIn(allowedActions).withMessage('Jenis aktivitas tidak valid.').run(req),
    query('actor').optional().isMongoId().withMessage('ID pelaku aktivitas tidak valid.').run(req),
    query('source').optional().isIn(['internal', 'external']).withMessage('Sumber aktivitas tidak valid.').run(req),
    query('startDate').optional().isISO8601({ strict: true }).withMessage('Parameter startDate harus berupa tanggal ISO 8601.').run(req),
    query('endDate').optional().isISO8601({ strict: true }).withMessage('Parameter endDate harus berupa tanggal ISO 8601.').run(req),
    query('page').optional().isInt({ min: 1 }).withMessage('Parameter page harus berupa bilangan bulat minimal 1.').run(req),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Parameter limit harus berupa bilangan bulat antara 1 dan 100.').run(req)
  ]);
  const errors = validationResult(req);
  if (!errors.isEmpty()) return next(new AppError(errors.array()[0].msg, 400));

  if (req.query.startDate && req.query.endDate &&
      new Date(req.query.endDate).getTime() < new Date(req.query.startDate).getTime()) {
    return next(new AppError('endDate tidak boleh lebih kecil dari startDate.', 400));
  }

  next();
}

module.exports = { validateActivityLogQuery, allowedActions };
