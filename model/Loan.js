const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema({
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: [true, 'Barang wajib dipilih.']
  },
  quantity: {
    type: Number,
    required: [true, 'Jumlah peminjaman wajib diisi.'],
    min: [1, 'Jumlah peminjaman minimal 1.'],
    validate: {
      validator: Number.isInteger,
      message: 'Jumlah peminjaman harus berupa bilangan bulat.'
    }
  },
  purpose: {
    type: String,
    trim: true,
    maxlength: [500, 'Keperluan maksimal 500 karakter.'],
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'returned'],
    default: 'pending'
  },
  rejection_reason: {
    type: String,
    trim: true,
    maxlength: [500, 'Alasan penolakan maksimal 500 karakter.'],
    default: ''
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updated_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  },
  archived: {
    type: Boolean,
    default: false
  }
}, { versionKey: false });

loanSchema.index({ created_by: 1, created_at: -1 });
loanSchema.index({ status: 1, created_at: -1 });

module.exports = mongoose.model('Loan', loanSchema);
