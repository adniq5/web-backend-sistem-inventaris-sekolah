const mongoose = require('mongoose');

const returnSchema = new mongoose.Schema({
  loan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Loan',
    required: [true, 'Peminjaman wajib dipilih.']
  },
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: [true, 'Barang wajib ditentukan.']
  },
  quantity: {
    type: Number,
    required: [true, 'Jumlah pengembalian wajib diisi.'],
    min: [1, 'Jumlah pengembalian minimal 1.'],
    validate: {
      validator: Number.isInteger,
      message: 'Jumlah pengembalian harus berupa bilangan bulat.'
    }
  },
  status: {
    type: String,
    enum: ['pending', 'verified'],
    default: 'pending'
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
  verified_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verified_at: {
    type: Date
  },
  archived: {
    type: Boolean,
    default: false
  }
}, { versionKey: false });

returnSchema.index({ created_by: 1, created_at: -1 });
returnSchema.index({ status: 1, created_at: -1 });
returnSchema.index({ loan: 1 }, { unique: true });

module.exports = mongoose.model('Return', returnSchema);
