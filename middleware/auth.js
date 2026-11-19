const jwt = require('jsonwebtoken');
const User = require('../model/User');
const AppError = require('../util/AppError');
const catchAsync = require('../util/catchAsync');

const protect = catchAsync(async (req, res, next) => {
  const [scheme, token] = (req.headers.authorization || '').split(' ');
  if (scheme !== 'Bearer' || !token) return next(new AppError('Token autentikasi diperlukan.', 401));
  if (!process.env.JWT_SECRET) return next(new AppError('JWT_SECRET belum dikonfigurasi.', 500));

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) return next(new AppError('User pemilik token tidak ditemukan.', 401));

  req.user = currentUser;
  next();
});

const restrictTo = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(new AppError('Anda tidak memiliki izin untuk mengakses resource ini.', 403));
  }
  next();
};

module.exports = { protect, restrictTo };
