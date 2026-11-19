const AppError = require('../util/AppError');
const { body, validationResult } = require('express-validator');

async function validateRegister(req, res, next) {
  await Promise.all([
    body('name').exists().withMessage('name, email, dan password wajib diisi.')
      .bail().isString().withMessage('Nama harus berupa teks.')
      .bail().trim().isLength({ min: 2 }).withMessage('Nama minimal 2 karakter.')
      .run(req),
    body('email').exists().withMessage('name, email, dan password wajib diisi.')
      .bail().isString().withMessage('Email harus berupa teks.')
      .bail().trim().isEmail().withMessage('Format email tidak valid.')
      .normalizeEmail().run(req),
    body('password').exists().withMessage('name, email, dan password wajib diisi.')
      .bail().isString().withMessage('Password harus berupa teks.')
      .bail().isLength({ min: 8 }).withMessage('Password minimal 8 karakter.')
      .run(req)
  ]);
  const errors = validationResult(req);
  if (!errors.isEmpty()) return next(new AppError(errors.array()[0].msg, 400));

  const { name, email, password } = req.body;
  if (!name || !email || !password) return next(new AppError('name, email, dan password wajib diisi.', 400));
  next();
}

async function validateLogin(req, res, next) {
  await Promise.all([
    body('email').exists().withMessage('email dan password wajib diisi.')
      .bail().isString().withMessage('Email harus berupa teks.')
      .bail().trim().notEmpty().withMessage('email dan password wajib diisi.')
      .run(req),
    body('password').exists().withMessage('email dan password wajib diisi.')
      .bail().isString().withMessage('Password harus berupa teks.')
      .bail().notEmpty().withMessage('email dan password wajib diisi.')
      .run(req)
  ]);
  const errors = validationResult(req);
  if (!errors.isEmpty()) return next(new AppError(errors.array()[0].msg, 400));

  const { email, password } = req.body;
  if (!email || !password) return next(new AppError('email dan password wajib diisi.', 400));
  next();
}

module.exports = { validateRegister, validateLogin };
