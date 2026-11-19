const AppError = require('../util/AppError');

module.exports = (req, res, next) => {
  next(new AppError(`Route tidak ditemukan: ${req.method} ${req.originalUrl}`, 404));
};
