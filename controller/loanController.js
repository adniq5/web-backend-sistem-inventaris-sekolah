const mongoose = require('mongoose');
const Loan = require('../model/Loan');
const Item = require('../model/Item');
const AppError = require('../util/AppError');
const catchAsync = require('../util/catchAsync');
const logActivity = require('../util/activityLogger');

function validateId(id, resourceName) {
  if (!mongoose.isValidObjectId(id)) {
    throw new AppError(`ID ${resourceName} tidak valid.`, 400);
  }
}

function ownerFilter(req) {
  return req.user.role === 'admin' ? {} : { created_by: req.user._id };
}

exports.create = catchAsync(async (req, res, next) => {
  const item = await Item.findOne({ _id: req.body.item, archived: false });
  if (!item) return next(new AppError('Barang aktif tidak ditemukan.', 404));

  if (req.body.quantity > item.stock) {
    return next(new AppError('Jumlah peminjaman melebihi stok barang saat ini.', 400));
  }

  const loan = await Loan.create({
    item: item._id,
    quantity: req.body.quantity,
    purpose: req.body.purpose || '',
    created_by: req.user._id,
    updated_by: req.user._id
  });

  await loan.populate('item', 'name stock');
  await logActivity({
    actor: req.user._id,
    action: 'submit_loan',
    description: `Pengajuan peminjaman ${loan.item.name} berhasil dibuat.`,
    metadata: { loan_id: loan._id, item_id: loan.item._id, quantity: loan.quantity }
  });
  res.status(201).json({
    status: 'success',
    message: 'Pengajuan peminjaman berhasil dibuat.',
    data: { loan }
  });
});

exports.list = catchAsync(async (req, res) => {
  const loans = await Loan.find({ archived: false, ...ownerFilter(req) })
    .populate('item', 'name stock')
    .populate('created_by', 'name email')
    .populate('updated_by', 'name email')
    .sort({ created_at: -1 });

  res.status(200).json({
    status: 'success',
    results: loans.length,
    data: { loans }
  });
});

exports.getById = catchAsync(async (req, res, next) => {
  validateId(req.params.id, 'peminjaman');

  const loan = await Loan.findOne({
    _id: req.params.id,
    archived: false,
    ...ownerFilter(req)
  })
    .populate('item', 'name stock')
    .populate('created_by', 'name email')
    .populate('updated_by', 'name email');

  if (!loan) return next(new AppError('Peminjaman tidak ditemukan.', 404));

  res.status(200).json({
    status: 'success',
    data: { loan }
  });
});

exports.approve = catchAsync(async (req, res, next) => {
  validateId(req.params.id, 'peminjaman');

  const loan = await Loan.findOne({
    _id: req.params.id,
    archived: false,
    status: 'pending'
  });
  if (!loan) return next(new AppError('Pengajuan pending tidak ditemukan.', 404));

  const item = await Item.findOneAndUpdate(
    { _id: loan.item, archived: false, stock: { $gte: loan.quantity } },
    { $inc: { stock: -loan.quantity }, updated_by: req.user._id, updated_at: new Date() },
    { new: true, runValidators: true }
  );
  if (!item) return next(new AppError('Stok barang tidak mencukupi atau barang tidak ditemukan.', 400));

  let approvedLoan;
  try {
    approvedLoan = await Loan.findOneAndUpdate(
      { _id: loan._id, archived: false, status: 'pending' },
      { status: 'approved', updated_by: req.user._id, updated_at: new Date() },
      { new: true, runValidators: true }
    );
  } catch (error) {
    const restored = await Item.updateOne(
      { _id: item._id },
      { $inc: { stock: loan.quantity }, updated_by: req.user._id, updated_at: new Date() }
    );
    if (restored.modifiedCount !== 1) {
      throw new AppError('Status peminjaman gagal diperbarui dan stok gagal dikembalikan.', 500);
    }
    throw error;
  }

  if (!approvedLoan) {
    const restored = await Item.updateOne(
      { _id: item._id },
      { $inc: { stock: loan.quantity }, updated_by: req.user._id, updated_at: new Date() }
    );
    if (restored.modifiedCount !== 1) {
      return next(new AppError('Peminjaman sudah diproses, tetapi stok gagal dikembalikan.', 500));
    }
    return next(new AppError('Pengajuan peminjaman sudah diproses.', 409));
  }

  await approvedLoan.populate('item', 'name stock');
  await logActivity({
    actor: req.user._id,
    action: 'approve_loan',
    description: `Peminjaman ${approvedLoan.item.name} berhasil disetujui.`,
    metadata: { loan_id: approvedLoan._id, item_id: approvedLoan.item._id, quantity: approvedLoan.quantity }
  });
  res.status(200).json({
    status: 'success',
    message: 'Peminjaman berhasil disetujui dan stok telah dikurangi.',
    data: { loan: approvedLoan }
  });
});

exports.reject = catchAsync(async (req, res, next) => {
  validateId(req.params.id, 'peminjaman');

  const loan = await Loan.findOneAndUpdate(
    { _id: req.params.id, archived: false, status: 'pending' },
    {
      status: 'rejected',
      rejection_reason: req.body.reason || '',
      updated_by: req.user._id,
      updated_at: new Date()
    },
    { new: true, runValidators: true }
  )
    .populate('item', 'name stock')
    .populate('created_by', 'name email')
    .populate('updated_by', 'name email');

  if (!loan) return next(new AppError('Pengajuan pending tidak ditemukan.', 404));
  await logActivity({
    actor: req.user._id,
    action: 'reject_loan',
    description: 'Pengajuan peminjaman berhasil ditolak.',
    metadata: { loan_id: loan._id, item_id: loan.item._id, reason: loan.rejection_reason }
  });

  res.status(200).json({
    status: 'success',
    message: 'Pengajuan peminjaman ditolak.',
    data: { loan }
  });
});
