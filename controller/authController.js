const jwt = require('jsonwebtoken');
const User = require('../model/User');
const AppError = require('../util/AppError');
const catchAsync = require('../util/catchAsync');
const logActivity = require('../util/activityLogger');

function signToken(userId) {
  if (!process.env.JWT_SECRET) throw new AppError('JWT_SECRET belum dikonfigurasi.', 500);
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1d' });
}

function assertJwtConfig() {
  if (!process.env.JWT_SECRET) throw new AppError('JWT_SECRET belum dikonfigurasi.', 500);
}

function publicUser(user) {
  return { id: user._id, name: user.name, email: user.email, role: user.role };
}

const register = catchAsync(async (req, res) => {
  const { name, email, password } = req.body;
  assertJwtConfig();
  const user = await User.create({ name, email, password, role: 'user' });
  res.status(201).json({ status: 'success', token: signToken(user._id), data: { user: publicUser(user) } });
});

const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) return next(new AppError('Email atau password salah.', 401));
  await logActivity({
    actor: user._id,
    action: 'login',
    description: `User ${user.email} berhasil login.`,
    metadata: { role: user.role }
  });
  res.status(200).json({ status: 'success', token: signToken(user._id), data: { user: publicUser(user) } });
});

const me = catchAsync(async (req, res) => {
  res.status(200).json({ status: 'success', data: { user: publicUser(req.user) } });
});

module.exports = { register, login, me };
