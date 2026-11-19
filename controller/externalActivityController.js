const User = require('../model/User');
const ActivityLog = require('../model/ActivityLog');
const AppError = require('../util/AppError');
const catchAsync = require('../util/catchAsync');

exports.create = catchAsync(async (req, res, next) => {
  const { userId, activityType, description } = req.body;
  const user = await User.findById(userId).select('_id');

  if (!user) {
    return next(new AppError('User pelaku aktivitas tidak ditemukan.', 404));
  }

  const activityLog = await ActivityLog.create({
    actor: user._id,
    action: 'external',
    activity_type: activityType.trim(),
    description: description.trim(),
    source: 'external'
  });

  res.status(201).json({
    status: 'success',
    message: 'Aktivitas eksternal berhasil dicatat.',
    data: { activityLog }
  });
});
