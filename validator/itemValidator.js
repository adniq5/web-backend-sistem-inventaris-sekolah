const AppError = require('../util/AppError');

function validateItem(req, res, next) {
  const { name, description, category, stock } = req.body;

  if (req.method === 'POST' || name !== undefined) {
    if (typeof name !== 'string' || name.trim().length < 2) {
      return next(new AppError('Nama barang minimal 2 karakter.', 400));
    }
    if (name.trim().length > 150) {
      return next(new AppError('Nama barang maksimal 150 karakter.', 400));
    }
  }

  if (description !== undefined && typeof description !== 'string') {
    return next(new AppError('Deskripsi harus berupa teks.', 400));
  }

  if (req.method === 'POST' || category !== undefined) {
    if (typeof category !== 'string' || !/^[a-f\d]{24}$/i.test(category)) {
      return next(new AppError('ID kategori tidak valid.', 400));
    }
  }

  if (req.method === 'POST' || stock !== undefined) {
    if (stock === undefined || !Number.isInteger(stock) || stock < 0) {
      return next(new AppError('Stok harus berupa bilangan bulat minimal 0.', 400));
    }
  }

  next();
}

module.exports = { validateItem };
