
const mongoose = require('mongoose');
const Category = require('../model/Category');
const AppError = require('../util/AppError');
const catchAsync = require('../util/catchAsync');
const logActivity = require('../util/activityLogger');

exports.create = catchAsync(async (req, res) => {
  const category = await Category.create({
    name: req.body.name.trim(),
    description: req.body.description || '',
    created_by: req.user._id,
    updated_by: req.user._id
  });
  await logActivity({
    actor: req.user._id,
    action: 'create_category',
    description: `Kategori "${category.name}" berhasil dibuat.`,
    metadata: { category_id: category._id, name: category.name }
  });

  res.status(201).json({
    status: 'success',
    message: 'Kategori berhasil dibuat.',
    data: { category }
  });
});

exports.list = catchAsync(async (req, res) => {
  const categories = await Category.find({ archived: false })
    .sort({ name: 1 });

  res.status(200).json({
    status: 'success',
    results: categories.length,
    data: { categories }
  });
});

exports.getById = catchAsync(async (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return next(new AppError('ID kategori tidak valid.', 400));
  }

  const category = await Category.findOne({
    _id: req.params.id,
    archived: false
  });

  if (!category) {
    return next(new AppError('Kategori tidak ditemukan.', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { category }
  });
});

exports.update = catchAsync(async (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return next(new AppError('ID kategori tidak valid.', 400));
  }

  const updates = {};

  if (req.body.name !== undefined) {
    if (typeof req.body.name !== 'string' || req.body.name.trim().length < 2) {
      return next(new AppError('Nama kategori minimal 2 karakter.', 400));
    }

    updates.name = req.body.name.trim();
  }

  if (req.body.description !== undefined) {
    if (typeof req.body.description !== 'string') {
      return next(new AppError('Deskripsi harus berupa teks.', 400));
    }

    updates.description = req.body.description.trim();
  }

  if (Object.keys(updates).length === 0) {
    return next(new AppError('Kirim minimal satu field yang ingin diubah.', 400));
  }

  updates.updated_by = req.user._id;
  updates.updated_at = new Date();

  const category = await Category.findOneAndUpdate(
    { _id: req.params.id, archived: false },
    updates,
    { new: true, runValidators: true }
  );

  if (!category) {
    return next(new AppError('Kategori tidak ditemukan.', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Kategori berhasil diperbarui.',
    data: { category }
  });
});

exports.archive = catchAsync(async (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return next(new AppError('ID kategori tidak valid.', 400));
  }

  const category = await Category.findOneAndUpdate(
    { _id: req.params.id, archived: false },
    {
      archived: true,
      updated_by: req.user._id,
      updated_at: new Date()
    },
    { new: true }
  );

  if (!category) {
    return next(new AppError('Kategori tidak ditemukan.', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Kategori berhasil diarsipkan.',
    data: { category }
  });
});
