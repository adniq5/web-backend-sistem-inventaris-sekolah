const AppError = require('../util/AppError');

module.exports = (req, res, next) => {
  if (!req.headers['x-api-key']) {
    return next(new AppError('API Key diperlukan.', 401));
  }

  if (!process.env.EXTERNAL_API_KEY) {
    return next(new AppError('EXTERNAL_API_KEY belum dikonfigurasi.', 500));
  }

  if (req.headers['x-api-key'] !== process.env.EXTERNAL_API_KEY) {
    return next(new AppError('API Key tidak valid.', 403));
  }

  next();
};
