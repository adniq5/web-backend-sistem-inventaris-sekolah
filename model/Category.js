
const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Nama kategori wajib diisi.'],
    trim: true,
    minlength: [2, 'Nama kategori minimal 2 karakter.'],
    maxlength: [100, 'Nama kategori maksimal 100 karakter.'],
    unique: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Deskripsi maksimal 500 karakter.'],
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
}, {
  versionKey: false
});

module.exports = mongoose.model('Category', categorySchema);
