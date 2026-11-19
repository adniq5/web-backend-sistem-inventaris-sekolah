const mongoose = require('mongoose');
const Return = require('../model/Return');
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

function returnQuery(filter) {
  return Return.find({ archived: false, ...filter })
    .populate('loan', 'item quantity status')
    .populate('item', 'name stock')
    .populate('created_by', 'name email')
    .populate('updated_by', 'name email')
    .populate('verified_by', 'name email')
    .sort({ created_at: -1 });
}

exports.create = catchAsync(async (req, res, next) => {
  validateId(req.body.loan, 'peminjaman');

  const loan = await Loan.findOne({
    _id: req.body.loan,
    status: 'approved',
    archived: false,
    created_by: req.user._id
  });

  if (!loan) {
    return next(new AppError('Peminjaman approved milik Anda tidak ditemukan.', 404));
  }

  if (req.body.quantity > loan.quantity) {
    return next(new AppError('Jumlah pengembalian melebihi jumlah yang dipinjam.', 400));
  }

  try {
    const returnRecord = await Return.create({
      loan: loan._id,
      item: loan.item,
      quantity: req.body.quantity,
      status: 'pending',
      created_by: req.user._id,
      updated_by: req.user._id
    });

    await returnRecord.populate('loan', 'item quantity status');
    await returnRecord.populate('item', 'name stock');
    await logActivity({
      actor: req.user._id,
      action: 'submit_return',
      description: `Pengajuan pengembalian ${returnRecord.item.name} menunggu verifikasi admin.`,
      metadata: {
        return_id: returnRecord._id,
        loan_id: returnRecord.loan._id,
        item_id: returnRecord.item._id,
        quantity: returnRecord.quantity
      }
    });

    return res.status(201).json({
      status: 'success',
      message: 'Pengajuan pengembalian berhasil dibuat dan menunggu verifikasi admin.',
      data: { return: returnRecord }
    });
  } catch (error) {
    if (error.code === 11000) {
      return next(new AppError('Peminjaman tersebut sudah memiliki pengajuan pengembalian.', 409));
    }
    throw error;
  }
});

exports.my = catchAsync(async (req, res) => {
  const returns = await returnQuery({ created_by: req.user._id });

  res.status(200).json({
    status: 'success',
    results: returns.length,
    data: { returns }
  });
});

exports.list = catchAsync(async (req, res) => {
  const returns = await returnQuery({});

  res.status(200).json({
    status: 'success',
    results: returns.length,
    data: { returns }
  });
});

exports.verify = catchAsync(async (req, res, next) => {
  validateId(req.params.id, 'pengembalian');

  const returnRecord = await Return.findOne({
    _id: req.params.id,
    archived: false,
    status: 'pending'
  });
  if (!returnRecord) {
    const existing = await Return.findOne({ _id: req.params.id, archived: false });
    if (existing && existing.status === 'verified') {
      return next(new AppError('Pengembalian tersebut sudah diverifikasi.', 409));
    }
    return next(new AppError('Pengajuan pengembalian tidak ditemukan.', 404));
  }

  const loan = await Loan.findOne({
    _id: returnRecord.loan,
    archived: false,
    status: 'approved'
  });
  if (!loan) {
    return next(new AppError('Peminjaman harus berstatus approved untuk diverifikasi.', 400));
  }

  const item = await Item.findOneAndUpdate(
    { _id: returnRecord.item, archived: false },
    { $inc: { stock: returnRecord.quantity }, updated_by: req.user._id, updated_at: new Date() },
    { new: true, runValidators: true }
  );
  if (!item) {
    return next(new AppError('Barang untuk pengembalian tidak ditemukan.', 404));
  }

  const verifiedAt = new Date();
  const verifiedReturn = await Return.findOneAndUpdate(
    { _id: returnRecord._id, archived: false, status: 'pending' },
    {
      status: 'verified',
      verified_by: req.user._id,
      verified_at: verifiedAt,
      updated_by: req.user._id,
      updated_at: verifiedAt
    },
    { new: true, runValidators: true }
  );

  if (!verifiedReturn) {
    const restored = await Item.updateOne(
      { _id: item._id },
      { $inc: { stock: -returnRecord.quantity }, updated_by: req.user._id, updated_at: new Date() }
    );
    if (restored.modifiedCount !== 1) {
      return next(new AppError('Pengembalian sudah diproses, tetapi stok gagal dikembalikan.', 500));
    }
    return next(new AppError('Pengembalian tersebut sudah diverifikasi.', 409));
  }

  const returnedLoan = await Loan.findOneAndUpdate(
    { _id: loan._id, archived: false, status: 'approved' },
    { status: 'returned', updated_by: req.user._id, updated_at: verifiedAt },
    { new: true, runValidators: true }
  );
  if (!returnedLoan) {
    const rollbackReturn = await Return.updateOne(
      { _id: verifiedReturn._id, status: 'verified' },
      { status: 'pending', $unset: { verified_by: 1, verified_at: 1 }, updated_by: req.user._id, updated_at: new Date() }
    );
    const restored = await Item.updateOne(
      { _id: item._id },
      { $inc: { stock: -returnRecord.quantity }, updated_by: req.user._id, updated_at: new Date() }
    );
    if (rollbackReturn.modifiedCount !== 1 || restored.modifiedCount !== 1) {
      return next(new AppError('Verifikasi gagal dan rollback data tidak lengkap.', 500));
    }
    return next(new AppError('Status peminjaman sudah berubah sehingga pengembalian tidak dapat diverifikasi.', 409));
  }

  await verifiedReturn.populate('loan', 'item quantity status');
  await verifiedReturn.populate('item', 'name stock');
  await logActivity({
    actor: req.user._id,
    action: 'verify_return',
    description: `Pengembalian ${verifiedReturn.item.name} berhasil diverifikasi.`,
    metadata: {
      return_id: verifiedReturn._id,
      loan_id: verifiedReturn.loan._id,
      item_id: verifiedReturn.item._id,
      quantity: verifiedReturn.quantity
    }
  });

  res.status(200).json({
    status: 'success',
    message: 'Pengembalian berhasil diverifikasi dan stok telah ditambahkan.',
    data: { return: verifiedReturn }
  });
});

exports.getById = catchAsync(async (req, res, next) => {
  validateId(req.params.id, 'pengembalian');

  const ownershipFilter = req.user.role === 'admin' ? {} : { created_by: req.user._id };
  const returnRecord = await returnQuery({
    _id: req.params.id,
    ...ownershipFilter
  }).then((records) => records[0]);

  if (!returnRecord) return next(new AppError('Pengembalian tidak ditemukan.', 404));

  res.status(200).json({
    status: 'success',
    data: { return: returnRecord }
  });
});
