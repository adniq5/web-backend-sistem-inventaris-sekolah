const AppError = require('../util/AppError');
const { body, validationResult } = require('express-validator');

async function validateItem(req, res, next) {
  await Promise.all([
    body('name')
      .if((value, { req }) => req.method === 'POST' || value !== undefined)
      .isString().withMessage('Nama barang minimal 2 karakter.')
      .bail().trim().isLength({ min: 2 }).withMessage('Nama barang minimal 2 karakter.')
      .bail().isLength({ max: 150 }).withMessage('Nama barang maksimal 150 karakter.')
      .run(req),
    body('description').optional().isString().withMessage('Deskripsi harus berupa teks.')
      .run(req),
    body('category')
      .if((value, { req }) => req.method === 'POST' || value !== undefined)
      .isString().withMessage('ID kategori tidak valid.')
      .bail().matches(/^[a-f\d]{24}$/i).withMessage('ID kategori tidak valid.')
      .run(req),
    body('stock')
      .if((value, { req }) => req.method === 'POST' || value !== undefined)
      .isInt({ min: 0 }).withMessage('Stok harus berupa bilangan bulat minimal 0.')
      .run(req)
  ]);
  const errors = validationResult(req);
  if (!errors.isEmpty()) return next(new AppError(errors.array()[0].msg, 400));

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
