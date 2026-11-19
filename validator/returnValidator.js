const AppError = require('../util/AppError');
const { body, validationResult } = require('express-validator');

async function validateReturn(req, res, next) {
  await Promise.all([
    body('loan').isString().matches(/^[a-f\d]{24}$/i).withMessage('ID peminjaman tidak valid.').run(req),
    body('quantity').isInt({ min: 1 }).withMessage('Jumlah pengembalian harus berupa bilangan bulat minimal 1.').run(req)
  ]);
  const errors = validationResult(req);
  if (!errors.isEmpty()) return next(new AppError(errors.array()[0].msg, 400));

  const { loan, quantity } = req.body;

  if (typeof loan !== 'string' || !/^[a-f\d]{24}$/i.test(loan)) {
    return next(new AppError('ID peminjaman tidak valid.', 400));
  }

  if (!Number.isInteger(quantity) || quantity < 1) {
    return next(new AppError('Jumlah pengembalian harus berupa bilangan bulat minimal 1.', 400));
  }

  next();
}

module.exports = { validateReturn };
