
const AppError = require('../util/AppError');
const { body, validationResult } = require('express-validator');

async function validateCategory(req, res, next) {
  await Promise.all([
    body('name')
      .if((value, { req }) => req.method === 'POST' || value !== undefined)
      .isString().withMessage('Nama kategori wajib diisi minimal 2 karakter.')
      .bail().trim().isLength({ min: 2 }).withMessage('Nama kategori wajib diisi minimal 2 karakter.')
      .bail().isLength({ max: 100 }).withMessage('Nama kategori maksimal 100 karakter.')
      .run(req),
    body('description').optional().isString().withMessage('Deskripsi harus berupa teks.')
      .bail().isLength({ max: 500 }).withMessage('Deskripsi maksimal 500 karakter.')
      .run(req)
  ]);
  const errors = validationResult(req);
  if (!errors.isEmpty()) return next(new AppError(errors.array()[0].msg, 400));

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
