const AppError = require('../util/AppError');

function validateLoan(req, res, next) {
  const { item, quantity, purpose } = req.body;

  if (typeof item !== 'string' || !/^[a-f\d]{24}$/i.test(item)) {
    return next(new AppError('ID barang tidak valid.', 400));
  }

  if (!Number.isInteger(quantity) || quantity < 1) {
    return next(new AppError('Jumlah peminjaman harus berupa bilangan bulat minimal 1.', 400));
  }

  if (purpose !== undefined && typeof purpose !== 'string') {
    return next(new AppError('Keperluan harus berupa teks.', 400));
  }

  if (typeof purpose === 'string' && purpose.length > 500) {
    return next(new AppError('Keperluan maksimal 500 karakter.', 400));
  }

  next();
}

function validateRejection(req, res, next) {
  const { reason } = req.body;

  if (reason !== undefined && typeof reason !== 'string') {
    return next(new AppError('Alasan penolakan harus berupa teks.', 400));
  }

  if (typeof reason === 'string' && reason.trim().length > 500) {
    return next(new AppError('Alasan penolakan maksimal 500 karakter.', 400));
  }

  next();
}

module.exports = { validateLoan, validateRejection };
