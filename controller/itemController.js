const mongoose = require('mongoose');
const Item = require('../model/Item');
const Category = require('../model/Category');
const AppError = require('../util/AppError');
const catchAsync = require('../util/catchAsync');
const logActivity = require('../util/activityLogger');

exports.create = catchAsync(async (req, res, next) => {
  const category = await Category.findOne({
    _id: req.body.category,
    archived: false
  });

  if (!category) {
    return next(new AppError('Kategori aktif tidak ditemukan.', 400));
  }

  const item = await Item.create({
    name: req.body.name,
    description: req.body.description || '',
    category: category._id,
    stock: req.body.stock,
    created_by: req.user._id,
    updated_by: req.user._id
  });
  await logActivity({
    actor: req.user._id,
    action: 'create_item',
    description: `Barang "${item.name}" berhasil dibuat.`,
    metadata: { item_id: item._id, name: item.name, category_id: item.category, stock: item.stock }
  });

  res.status(201).json({
    status: 'success',
    message: 'Barang berhasil dibuat.',
    data: { item }
  });
});

exports.list = catchAsync(async (req, res) => {
  const {
    search,
    category,
    sort = 'name',
    order = 'asc',
    page = '1',
    limit = '10'
  } = req.query;

  const pageNumber = Math.max(1, parseInt(page, 10) || 1);
  const limitNumber = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
  const allowedSort = ['name', 'stock', 'created_at'];
  const sortField = allowedSort.includes(sort) ? sort : 'name';

  const filter = { archived: false };

  if (search) {
    filter.name = { $regex: search, $options: 'i' };
  }

  if (category) {
    if (!mongoose.isValidObjectId(category)) {
      throw new AppError('ID kategori tidak valid.', 400);
    }
    filter.category = category;
  }

  const sortOrder = order === 'desc' ? -1 : 1;
  const [items, total] = await Promise.all([
    Item.find(filter)
      .populate('category', 'name')
      .sort({ [sortField]: sortOrder })
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber),
    Item.countDocuments(filter)
  ]);

  res.status(200).json({
    status: 'success',
    results: items.length,
    pagination: {
      page: pageNumber,
      limit: limitNumber,
      total,
      totalPages: Math.ceil(total / limitNumber)
    },
    data: { items }
  });
});

exports.getById = catchAsync(async (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return next(new AppError('ID barang tidak valid.', 400));
  }

  const item = await Item.findOne({
    _id: req.params.id,
    archived: false
  }).populate('category', 'name');

  if (!item) {
    return next(new AppError('Barang tidak ditemukan.', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { item }
  });
});

exports.update = catchAsync(async (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return next(new AppError('ID barang tidak valid.', 400));
  }

  const updates = {};
  const allowedFields = ['name', 'description', 'stock'];

  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  }

  if (req.body.category !== undefined) {
    const category = await Category.findOne({
      _id: req.body.category,
      archived: false
    });

    if (!category) {
      return next(new AppError('Kategori aktif tidak ditemukan.', 400));
    }

    updates.category = category._id;
  }

  if (Object.keys(updates).length === 0) {
    return next(new AppError('Kirim minimal satu field yang ingin diubah.', 400));
  }

  updates.updated_by = req.user._id;
  updates.updated_at = new Date();

  const item = await Item.findOneAndUpdate(
    { _id: req.params.id, archived: false },
    updates,
    { new: true, runValidators: true }
  ).populate('category', 'name');

  if (!item) {
    return next(new AppError('Barang tidak ditemukan.', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Barang berhasil diperbarui.',
    data: { item }
  });
});

exports.archive = catchAsync(async (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return next(new AppError('ID barang tidak valid.', 400));
  }

  const item = await Item.findOneAndUpdate(
    { _id: req.params.id, archived: false },
    {
      archived: true,
      updated_by: req.user._id,
      updated_at: new Date()
    },
    { new: true }
  );

  if (!item) {
    return next(new AppError('Barang tidak ditemukan.', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Barang berhasil diarsipkan.',
    data: { item }
  });
});
