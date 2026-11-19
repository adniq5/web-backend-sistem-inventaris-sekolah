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

function validateBorrow(req, res, next) {
  const { due_date } = req.body;

  if (typeof due_date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(due_date)) {
    return next(new AppError('Tanggal jatuh tempo harus berformat YYYY-MM-DD.', 400));
  }

  const [year, month, day] = due_date.split('-').map(Number);
  const dueDate = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));
  if (
    dueDate.getUTCFullYear() !== year ||
    dueDate.getUTCMonth() !== month - 1 ||
    dueDate.getUTCDate() !== day
  ) {
    return next(new AppError('Tanggal jatuh tempo tidak valid.', 400));
  }

  const now = new Date();
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  if (dueDate < today) {
    return next(new AppError('Tanggal jatuh tempo tidak boleh berada di masa lalu.', 400));
  }

  req.body.due_date = dueDate;
  next();
}

module.exports = { validateLoan, validateRejection, validateBorrow };
