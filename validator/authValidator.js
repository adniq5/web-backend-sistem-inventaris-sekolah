const AppError = require('../util/AppError');

function validateRegister(req, res, next) {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return next(new AppError('name, email, dan password wajib diisi.', 400));
  next();
}

function validateLogin(req, res, next) {
  const { email, password } = req.body;
  if (!email || !password) return next(new AppError('email dan password wajib diisi.', 400));
  next();
}

module.exports = { validateRegister, validateLogin };
