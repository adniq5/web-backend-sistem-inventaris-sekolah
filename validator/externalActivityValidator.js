const mongoose = require('mongoose');
const AppError = require('../util/AppError');
const { body, validationResult } = require('express-validator');

async function validateExternalActivity(req, res, next) {
  await Promise.all([
    body('userId').custom(value => typeof value === 'string' && mongoose.isValidObjectId(value))
      .withMessage('userId harus berupa ID user yang valid.')
      .run(req),
    body('activityType').isString().trim().notEmpty()
      .withMessage('activityType wajib berupa teks.')
      .bail().isLength({ max: 100 }).withMessage('activityType maksimal 100 karakter.')
      .run(req),
    body('description').isString().trim().notEmpty()
      .withMessage('description wajib berupa teks.')
      .bail().isLength({ max: 500 }).withMessage('description maksimal 500 karakter.')
      .run(req)
  ]);
  const errors = validationResult(req);
  if (!errors.isEmpty()) return next(new AppError(errors.array()[0].msg, 400));

  const { userId, activityType, description } = req.body;

  if (typeof userId !== 'string' || !mongoose.isValidObjectId(userId)) {
    return next(new AppError('userId harus berupa ID user yang valid.', 400));
  }

  if (typeof activityType !== 'string' || !activityType.trim()) {
    return next(new AppError('activityType wajib berupa teks.', 400));
  }

  if (activityType.trim().length > 100) {
    return next(new AppError('activityType maksimal 100 karakter.', 400));
  }

  if (typeof description !== 'string' || !description.trim()) {
    return next(new AppError('description wajib berupa teks.', 400));
  }

  if (description.trim().length > 500) {
    return next(new AppError('description maksimal 500 karakter.', 400));
  }

  next();
}

module.exports = { validateExternalActivity };
