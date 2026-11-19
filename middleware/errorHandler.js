const AppError = require('../util/AppError');

function normalizeError(error) {
  if (error.name === 'ValidationError') {
    return new AppError(Object.values(error.errors).map((item) => item.message).join(', '), 400);
  }
  if (error.code === 11000) return new AppError('Data dengan nilai unik tersebut sudah terdaftar.', 409);
  if (error.name === 'CastError') return new AppError('Nilai parameter tidak valid.', 400);
  if (error.name === 'JsonWebTokenError') return new AppError('Token tidak valid.', 401);
  if (error.name === 'TokenExpiredError') return new AppError('Token sudah kedaluwarsa.', 401);
  return error;
}

module.exports = (error, req, res, next) => {
  const normalized = normalizeError(error);
  const statusCode = normalized.statusCode || 500;
  const isProduction = process.env.NODE_ENV === 'production';

  if (statusCode >= 500) console.error(normalized.stack || normalized.message);

  res.status(statusCode).json({
    status: normalized.status || (statusCode >= 500 ? 'error' : 'fail'),
    message: isProduction && statusCode >= 500 ? 'Terjadi kesalahan pada server.' : normalized.message
  });
};
