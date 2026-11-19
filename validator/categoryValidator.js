
const AppError = require('../util/AppError');

function validateCategory(req, res, next) {
  const { name, description } = req.body;

  if (typeof name !== 'string' || name.trim().length < 2) {
    return next(new AppError('Nama kategori wajib diisi minimal 2 karakter.', 400));
  }

  if (name.trim().length > 100) {
    return next(new AppError('Nama kategori maksimal 100 karakter.', 400));
  }

  if (description !== undefined && typeof description !== 'string') {
    return next(new AppError('Deskripsi harus berupa teks.', 400));
  }

  if (typeof description === 'string' && description.length > 500) {
    return next(new AppError('Deskripsi maksimal 500 karakter.', 400));
  }

  next();
}

module.exports = { validateCategory };
