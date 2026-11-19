const AppError = require('../util/AppError');
const { param, validationResult } = require('express-validator');

async function validateId(req, res, next) {
  await param('id').isMongoId().withMessage('ID tidak valid.').run(req);
  const errors = validationResult(req);
  if (!errors.isEmpty()) return next(new AppError(errors.array()[0].msg, 400));
  next();
}

module.exports = { validateId };
