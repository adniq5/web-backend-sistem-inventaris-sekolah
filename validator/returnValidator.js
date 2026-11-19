const AppError = require('../util/AppError');

function validateReturn(req, res, next) {
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
