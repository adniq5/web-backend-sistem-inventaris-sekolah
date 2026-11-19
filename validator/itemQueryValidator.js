const AppError = require('../util/AppError');
const { query, validationResult } = require('express-validator');

async function validateItemQuery(req, res, next) {
  await Promise.all([
    query('search').optional().isString().withMessage('Parameter search harus berupa teks.').run(req),
    query('category').optional().isMongoId().withMessage('ID kategori tidak valid.').run(req),
    query('sort').optional().isIn(['name', 'stock', 'created_at']).withMessage('Field sorting tidak valid.').run(req),
    query('order').optional().isIn(['asc', 'desc']).withMessage('Urutan sorting harus asc atau desc.').run(req),
    query('page').optional().isInt({ min: 1 }).withMessage('Parameter page harus berupa bilangan bulat minimal 1.').run(req),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Parameter limit harus berupa bilangan bulat antara 1 dan 100.').run(req)
  ]);
  const errors = validationResult(req);
  if (!errors.isEmpty()) return next(new AppError(errors.array()[0].msg, 400));
  next();
}

module.exports = { validateItemQuery };
